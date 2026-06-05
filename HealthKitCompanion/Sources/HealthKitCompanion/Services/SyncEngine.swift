import Foundation

@MainActor
final class SyncEngine: ObservableObject {
    enum Status: String {
        case idle
        case syncing
        case success
        case error
    }

    @Published var status: Status = .idle
    @Published var lastSync: Date?
    @Published var lastReport: SyncReport?

    private let supabaseClient: SupabaseClient

    init(supabaseClient: SupabaseClient) {
        self.supabaseClient = supabaseClient
    }

    var statusText: String {
        status.rawValue.capitalized
    }

    var lastSyncText: String {
        guard let lastSync else { return "Never" }
        return lastSync.formatted(date: .abbreviated, time: .shortened)
    }

    var lastReportText: String {
        guard let lastReport else { return "No sync report yet" }
        return "\(lastReport.status.rawValue.uppercased()): \(lastReport.message)"
    }

    func sync(snapshot: HealthSnapshot) async {
        status = .syncing
        do {
            let report = try await supabaseClient.upload(snapshot: snapshot)
            lastReport = report
            lastSync = ISO8601DateFormatter().date(from: report.finishedAt) ?? .now
            status = .success
        } catch {
            let fallback = SyncReport(
                status: .error,
                startedAt: ISO8601DateFormatter().string(from: .now),
                finishedAt: ISO8601DateFormatter().string(from: .now),
                snapshotId: snapshot.id,
                lastRemoteSyncAt: nil,
                metricsUploaded: 0,
                workoutsUploaded: 0,
                healthStateUploaded: false,
                deduplicatedRows: 0,
                message: error.localizedDescription
            )
            lastReport = fallback
            status = .error
        }
    }

    func refreshLastSync() async {
        do {
            lastSync = try await supabaseClient.pullLastSync()
        } catch {
            lastReport = SyncReport(
                status: .error,
                startedAt: ISO8601DateFormatter().string(from: .now),
                finishedAt: ISO8601DateFormatter().string(from: .now),
                snapshotId: "unknown",
                lastRemoteSyncAt: nil,
                metricsUploaded: 0,
                workoutsUploaded: 0,
                healthStateUploaded: false,
                deduplicatedRows: 0,
                message: error.localizedDescription
            )
        }
    }
}
