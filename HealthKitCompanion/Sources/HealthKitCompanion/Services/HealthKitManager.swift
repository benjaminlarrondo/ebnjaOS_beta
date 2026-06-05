import Foundation
import HealthKit
#if canImport(UIKit)
import UIKit
#endif

@MainActor
final class HealthKitManager: ObservableObject {
    enum LoadState: String {
        case idle
        case authorizing
        case loading
        case ready
        case failed
    }

    @Published var loadState: LoadState = .idle
    @Published var authorizationStatusText: String = "Not requested"
    @Published var errorMessage: String?
    @Published var snapshot: HealthSnapshot?
    @Published var exportedSnapshotURL: URL?
    @Published var snapshotUpload: SnapshotUpload?

    private let healthStore = HKHealthStore()
    private let queries: HealthKitQueries
    private let normalizer = HealthKitNormalizer()
    private let bridgeBuilder = HealthFoundationBridgeBuilder()

    init(queries: HealthKitQueries) {
        self.queries = queries
    }

    var hasRealData: Bool {
        guard let snapshot else { return false }
        return snapshot.metricsCount > 0 || snapshot.workoutsCount > 0
    }

    var lastUpdatedText: String {
        guard let snapshot else { return "Never" }
        return snapshot.capturedAt.formatted(date: .abbreviated, time: .shortened)
    }

    func requestAuthorization() async {
        guard HKHealthStore.isHealthDataAvailable() else {
            authorizationStatusText = "Health data unavailable"
            loadState = .failed
            return
        }

        loadState = .authorizing

        do {
            try await healthStore.requestAuthorization(
                toShare: [],
                read: HealthKitQueries.defaultReadTypes()
            )
            authorizationStatusText = "Authorized"
            loadState = .idle
        } catch {
            authorizationStatusText = "Authorization failed"
            errorMessage = error.localizedDescription
            loadState = .failed
        }
    }

    func loadHistoricalData(days: Int = 30) async {
        loadState = .loading
        errorMessage = nil

        do {
            let windowStart = Calendar.current.date(byAdding: .day, value: -days, to: .now) ?? .now
            let rawPayload = try await queries.fetchHistoricalPayload(days: days)
            let normalizedSnapshot = normalizer.normalize(
                quantitySamples: rawPayload.quantitySamples,
                sleepSamples: rawPayload.sleepSamples,
                workouts: rawPayload.workouts,
                windowStart: windowStart,
                windowEnd: .now
            )

            snapshot = normalizedSnapshot
            snapshotUpload = bridgeBuilder.buildUpload(
                snapshot: normalizedSnapshot,
                deviceId: Self.deviceIdentifier,
                userId: Self.defaultUserId
            )
            loadState = .ready
        } catch {
            errorMessage = error.localizedDescription
            loadState = .failed
        }
    }

    func refresh(days: Int = 30) async {
        await requestAuthorization()
        guard authorizationStatusText == "Authorized" else { return }
        await loadHistoricalData(days: days)
    }

    func exportSnapshot() throws -> URL {
        guard let snapshotUpload else {
            throw ExportError.missingSnapshot
        }

        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        encoder.dateEncodingStrategy = .iso8601

        let data = try encoder.encode(snapshotUpload)
        let filename = "health-snapshot-\(Self.exportDateFormatter.string(from: snapshotUpload.snapshot.capturedAt)).json"
        let url = FileManager.default.temporaryDirectory.appendingPathComponent(filename)
        try data.write(to: url, options: [.atomic])
        exportedSnapshotURL = url
        return url
    }

    func exportSnapshotData() throws -> Data {
        guard let snapshotUpload else {
            throw ExportError.missingSnapshot
        }
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        encoder.dateEncodingStrategy = .iso8601
        return try encoder.encode(snapshotUpload)
    }

    private static let exportDateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.locale = .current
        formatter.dateFormat = "yyyyMMdd-HHmmss"
        return formatter
    }()

    private static var deviceIdentifier: String {
        #if canImport(UIKit)
        return UIDevice.current.identifierForVendor?.uuidString ?? "unknown-device"
        #else
        return "unknown-device"
        #endif
    }

    private static let defaultUserId: String = {
        let env = ProcessInfo.processInfo.environment
        return env["SUPABASE_USER_ID"] ?? env["VITE_SINGLE_USER_ID"] ?? "00000000-0000-0000-0000-000000000001"
    }()
}

extension HealthKitManager {
    enum ExportError: Error {
        case missingSnapshot
    }
}
