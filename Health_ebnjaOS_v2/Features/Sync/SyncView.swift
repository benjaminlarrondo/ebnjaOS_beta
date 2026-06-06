import SwiftUI

struct SyncView: View {
    @EnvironmentObject private var syncManager: SyncManager

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                statusCard
                actionCard
                reportCard
            }
            .padding()
        }
        .task {
            await syncManager.refreshLastSync()
        }
    }

    private var statusCard: some View {
        SectionCard(title: "Sync Status", subtitle: "Supabase DEV bridge") {
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    StatusPill(title: syncManager.syncStatus.displayName, color: syncStatusColor)
                    Spacer()
                    Text(syncManager.lastSyncText)
                        .foregroundStyle(.secondary)
                }
                Text(syncManager.lastSyncDetail)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private var actionCard: some View {
        SectionCard(title: "Sync Now", subtitle: "Idempotent upload to Supabase") {
            Button {
                Task { await syncManager.syncNow() }
            } label: {
                Label("Sync Health Snapshot", systemImage: "arrow.triangle.2.circlepath")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
        }
    }

    private var reportCard: some View {
        SectionCard(title: "Last Sync Report", subtitle: "Metrics and workouts uploaded") {
            VStack(alignment: .leading, spacing: 8) {
                if let report = syncManager.lastSyncReport {
                    StatusRow(label: "Body Metrics", value: "\(report.bodyMetricsCount)")
                    StatusRow(label: "Workouts", value: "\(report.workoutsCount)")
                    StatusRow(label: "Health State", value: report.healthStateWritten ? "Written" : "Pending")
                    Text(report.responseSummary)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                } else {
                    Text("No sync report yet.")
                        .foregroundStyle(.secondary)
                }
            }
        }
    }

    private var syncStatusColor: Color {
        switch syncManager.syncStatus {
        case .neverSynced: return .secondary
        case .syncing: return .orange
        case .success: return .green
        case .error: return .red
        }
    }
}
