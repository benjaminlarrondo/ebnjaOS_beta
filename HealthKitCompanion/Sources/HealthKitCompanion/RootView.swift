import SwiftUI

struct RootView: View {
    @EnvironmentObject private var permissions: HealthKitPermissions
    @EnvironmentObject private var manager: HealthKitManager
    @EnvironmentObject private var syncEngine: SyncEngine

    var body: some View {
        TabView {
            NavigationStack {
                HealthDebugDashboardView()
                    .navigationTitle("Debug Dashboard")
            }
            .tabItem {
                Label("Dashboard", systemImage: "waveform.path.ecg")
            }

            NavigationStack {
                HealthSnapshotListView(snapshot: manager.snapshot)
                    .navigationTitle("Snapshot")
            }
            .tabItem {
                Label("Snapshot", systemImage: "doc.text.magnifyingglass")
            }

            NavigationStack {
                SettingsView()
                    .navigationTitle("Settings")
            }
            .tabItem {
                Label("Settings", systemImage: "gearshape")
            }
        }
    }
}

private struct HealthDebugDashboardView: View {
    @EnvironmentObject private var permissions: HealthKitPermissions
    @EnvironmentObject private var manager: HealthKitManager
    @EnvironmentObject private var syncEngine: SyncEngine

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                header
                metricsCard
                workoutsCard
                exportCard
                syncCard
            }
            .padding()
        }
        .task {
            permissions.refresh()
            await syncEngine.refreshLastSync()
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Apple Health → JSON")
                .font(.largeTitle.bold())
            Text("Real HealthKit data from the device, normalized into a canonical snapshot ready for Supabase.")
                .foregroundStyle(.secondary)
            StatusCard(
                authorization: manager.authorizationStatusText,
                loadState: manager.loadState.rawValue.capitalized,
                lastUpdated: manager.lastUpdatedText,
                errorMessage: manager.errorMessage
            )

            HStack(spacing: 12) {
                Button("Request Authorization") {
                    Task {
                        await permissions.requestAuthorization()
                    }
                }
                .buttonStyle(.borderedProminent)

                Button("Load 30 Days") {
                    Task {
                        await manager.loadHistoricalData(days: 30)
                    }
                }
                .buttonStyle(.bordered)
                .disabled(manager.authorizationStatusText != "Authorized")

                Button("Refresh") {
                    Task {
                        await manager.refresh(days: 30)
                        permissions.refresh()
                    }
                }
                .buttonStyle(.bordered)

                Button("Sync to Supabase") {
                    Task {
                        guard let snapshot = manager.snapshot else { return }
                        await syncEngine.sync(snapshot: snapshot)
                    }
                }
                .buttonStyle(.borderedProminent)
                .disabled(manager.snapshot == nil || !manager.hasRealData)
            }
        }
    }

    private var metricsCard: some View {
        MetricSummaryCard(
            title: "Metrics",
            count: manager.snapshot?.metricsCount ?? 0,
            subtitle: "bodyMass · stepCount · sleepAnalysis · restingHeartRate · HRV",
            items: manager.snapshot?.metrics.prefix(10).map { metric in
                "\(metric.kind.displayName): \(metric.displayValue)"
            } ?? []
        )
    }

    private var workoutsCard: some View {
        MetricSummaryCard(
            title: "Workouts",
            count: manager.snapshot?.workoutsCount ?? 0,
            subtitle: "traditionalStrengthTraining · walking · running · yoga · cycling",
            items: manager.snapshot?.workouts.prefix(10).map { workout in
                "\(workout.workoutType.rawValue) · \(workout.duration.formatted(.number.precision(.fractionLength(0...1))))s"
            } ?? []
        )
    }

    private var exportCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Export Snapshot")
                .font(.headline)

            Text("Generates a canonical JSON snapshot in the local temporary folder.")
                .foregroundStyle(.secondary)

            Button("Export JSON") {
                do {
                    _ = try manager.exportSnapshot()
                } catch {
                    manager.errorMessage = error.localizedDescription
                }
            }
            .buttonStyle(.borderedProminent)

            if let url = manager.exportedSnapshotURL {
                Text(url.path)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .textSelection(.enabled)
            }
        }
        .padding()
        .background(.thinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }

    private var syncCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Sync Report")
                .font(.headline)

            StatusRow(label: "Status", value: syncEngine.statusText)
            StatusRow(label: "Last Remote Sync", value: syncEngine.lastSyncText)
            Text(syncEngine.lastReportText)
                .font(.caption)
                .foregroundStyle(.secondary)

            if let report = syncEngine.lastReport {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Metrics uploaded: \(report.metricsUploaded)")
                    Text("Workouts uploaded: \(report.workoutsUploaded)")
                    Text("Health state uploaded: \(report.healthStateUploaded ? "Yes" : "No")")
                    Text("Deduplicated rows: \(report.deduplicatedRows)")
                }
                .font(.caption)
                .foregroundStyle(.secondary)
            }
        }
        .padding()
        .background(.thinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}

private struct StatusCard: View {
    let authorization: String
    let loadState: String
    let lastUpdated: String
    let errorMessage: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            StatusRow(label: "Authorization", value: authorization)
            StatusRow(label: "Load State", value: loadState)
            StatusRow(label: "Last Updated", value: lastUpdated)
            if let errorMessage {
                Text(errorMessage)
                    .foregroundStyle(.red)
                    .font(.caption)
            }
        }
        .padding()
        .background(.thinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}

private struct StatusRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .font(.subheadline.weight(.semibold))
            Spacer()
            Text(value)
                .foregroundStyle(.secondary)
        }
    }
}

private struct MetricSummaryCard: View {
    let title: String
    let count: Int
    let subtitle: String
    let items: [String]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(title)
                    .font(.headline)
                Spacer()
                Text("\(count)")
                    .font(.title3.bold())
            }

            Text(subtitle)
                .font(.caption)
                .foregroundStyle(.secondary)

            VStack(alignment: .leading, spacing: 6) {
                ForEach(items, id: \.self) { item in
                    Text("• \(item)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding()
        .background(.thinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}

private struct HealthSnapshotListView: View {
    let snapshot: HealthSnapshot?

    var body: some View {
        Group {
            if let snapshot {
                List {
                    Section("Snapshot") {
                        LabeledContent("Captured", value: snapshot.capturedAt.formatted(date: .abbreviated, time: .shortened))
                        LabeledContent("Window", value: "\(snapshot.windowStart.formatted(date: .abbreviated, time: .omitted)) → \(snapshot.windowEnd.formatted(date: .abbreviated, time: .omitted))")
                        LabeledContent("Source", value: snapshot.source)
                    }

                    Section("Metrics") {
                        ForEach(snapshot.metrics) { metric in
                            VStack(alignment: .leading, spacing: 4) {
                                Text(metric.kind.displayName)
                                    .font(.headline)
                                Text(metric.displayValue)
                                    .foregroundStyle(.secondary)
                                Text(metric.recordedAt.formatted(date: .abbreviated, time: .shortened))
                                    .font(.caption)
                                    .foregroundStyle(.tertiary)
                            }
                        }
                    }

                    Section("Workouts") {
                        ForEach(snapshot.workouts) { workout in
                            VStack(alignment: .leading, spacing: 4) {
                                Text(workout.workoutType.rawValue)
                                    .font(.headline)
                                Text("\(workout.duration.formatted(.number.precision(.fractionLength(0...1)))) seconds")
                                    .foregroundStyle(.secondary)
                                Text(workout.startedAt.formatted(date: .abbreviated, time: .shortened))
                                    .font(.caption)
                                    .foregroundStyle(.tertiary)
                            }
                        }
                    }
                }
            } else {
                VStack(alignment: .leading, spacing: 8) {
                    Text("No Snapshot")
                        .font(.headline)
                    Text("Run the 30-day import to generate a canonical JSON snapshot.")
                        .foregroundStyle(.secondary)
                }
                .padding()
            }
        }
    }
}
