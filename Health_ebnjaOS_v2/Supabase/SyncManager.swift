import Foundation
import Combine
import OSLog

@MainActor
final class SyncManager: ObservableObject {
    private let logger = Logger(subsystem: "Health_ebnjaOS_v2", category: "Sync")
    private let healthKitManager: HealthKitManager
    private let service: SupabaseService?
    private let normalizer: HealthSyncNormalizer?

    @Published private(set) var syncStatus: SyncStatus = .neverSynced
    @Published private(set) var lastSyncText: String = "Never Synced"
    @Published private(set) var lastSyncDetail: String = "Awaiting first sync."
    @Published private(set) var lastSyncAt: Date?
    @Published private(set) var lastSyncReport: HealthSyncReport?
    @Published private(set) var lastSyncError: String?

    init(manager: HealthKitManager, config: SupabaseConfig?) {
        self.healthKitManager = manager

        if let config {
            self.service = SupabaseService(config: config)
            self.normalizer = HealthSyncNormalizer(config: config)
        } else {
            self.service = nil
            self.normalizer = nil
        }
    }

    func refreshLastSync() async {
        guard let service else {
            lastSyncDetail = "Set SUPABASE_URL and SUPABASE_ANON_KEY to enable sync."
            return
        }

        do {
            lastSyncAt = try await service.pullLastSync()
            if let lastSyncAt {
                lastSyncText = Self.dateFormatter.string(from: lastSyncAt)
                lastSyncDetail = "Remote sync refreshed successfully."
            } else {
                lastSyncText = "Never Synced"
                lastSyncDetail = "No remote sync found yet."
            }
        } catch {
            lastSyncError = error.localizedDescription
            lastSyncDetail = error.localizedDescription
        }
    }

    func syncNow() async {
        guard let service, let normalizer else {
            syncStatus = .error
            lastSyncError = "Missing Supabase DEV configuration."
            lastSyncDetail = "Set SUPABASE_URL and SUPABASE_ANON_KEY in Environment or Info.plist."
            logger.error("Sync skipped: incomplete Supabase configuration")
            return
        }

        syncStatus = .syncing
        lastSyncError = nil
        lastSyncDetail = "Reading Apple Health snapshot..."
        logger.info("Sync request started")

        if healthKitManager.latestSyncSnapshot == nil {
            await healthKitManager.loadLatestDataIfAuthorized()
            _ = healthKitManager.generateSnapshot()
        }

        guard let snapshot = healthKitManager.latestSyncSnapshot else {
            syncStatus = .error
            lastSyncError = "No HealthKit snapshot available."
            lastSyncDetail = "HealthKit is authorized but no snapshot was generated. Open Dashboard first, wait for metrics to load, then retry sync."
            logger.error("Sync failed: no HealthKit snapshot")
            return
        }

        let payload = normalizer.normalize(snapshot: snapshot)

        do {
            let healthStateResult = try await service.upsertHealthState(payload.healthState)
            let bodyMetricsResult = try await service.upsertBodyMetrics(payload.bodyMetrics)
            let workoutsResult = try await service.upsertWorkouts(payload.workouts)

            syncStatus = .success
            lastSyncAt = snapshot.syncedAt
            lastSyncText = Self.dateFormatter.string(from: snapshot.syncedAt)
            lastSyncDetail = "Synced \(bodyMetricsResult.rowCount) body metrics, \(workoutsResult.rowCount) workouts, and the health state."
            lastSyncReport = HealthSyncReport(
                syncedAt: snapshot.syncedAt,
                bodyMetricsCount: bodyMetricsResult.rowCount,
                workoutsCount: workoutsResult.rowCount,
                healthStateWritten: healthStateResult.statusCode >= 200 && healthStateResult.statusCode < 300,
                responseSummary: [healthStateResult.responseBody, bodyMetricsResult.responseBody, workoutsResult.responseBody].joined(separator: "\n")
            )
            logger.info("Sync request completed successfully")
        } catch {
            syncStatus = .error
            lastSyncError = error.localizedDescription
            lastSyncDetail = error.localizedDescription
            logger.error("Sync request failed: \(error.localizedDescription, privacy: .public)")
        }
    }

    private static let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter
    }()
}
