import SwiftUI

struct DashboardView: View {
    @EnvironmentObject private var permissions: HealthKitPermissions
    @EnvironmentObject private var manager: HealthKitManager
    @EnvironmentObject private var syncManager: SyncManager
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass

    var body: some View {
        ZStack {
            Image("DashboardBackground")
                .resizable()
                .scaledToFill()
                .ignoresSafeArea()

            ScrollView(.vertical) {
                VStack(alignment: .leading, spacing: 16) {
                    header
                    syncStatusCard
                    metricsGrid
                    readinessCards
                    actionsCard
                }
                .frame(width: Self.dashboardContentWidth, alignment: .leading)
                .safeAreaPadding(.horizontal, 20)
                .padding(.top, 20)
                .safeAreaInset(edge: .bottom) {
                    Color.clear.frame(height: 220)
                }
            }
            .scrollIndicators(.hidden)
            .background(Color.black.opacity(0.12))
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("ebnjaOS Health")
                .font(.title.bold())
                .lineLimit(1)
                .minimumScaleFactor(0.75)
            Text("Premium health intelligence for Apple Health and Supabase.")
                .foregroundStyle(.secondary)
                .lineLimit(2)
                .minimumScaleFactor(0.85)
        }
    }

    private var syncStatusCard: some View {
        SectionCard(title: "Sync Status", subtitle: "Supabase DEV sync") {
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    StatusPill(title: syncManager.syncStatus.displayName, color: syncStatusColor)
                    Spacer()
                    Text(syncManager.lastSyncText)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                Text(syncManager.lastSyncDetail)
                    .font(.footnote)
                    .foregroundStyle(.secondary)

                if let report = syncManager.lastSyncReport {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Body metrics: \(report.bodyMetricsCount)")
                        Text("Workouts: \(report.workoutsCount)")
                        Text("Health state: \(report.healthStateWritten ? "Written" : "Pending")")
                    }
                    .font(.caption)
                    .foregroundStyle(.secondary)
                }
            }
        }
    }

    private var metricsGrid: some View {
        let columns = dashboardColumns

        return LazyVGrid(columns: columns, alignment: .leading, spacing: 12) {
            MetricCard(title: "Weight", value: manager.latestWeightText, unit: "kg", detail: manager.latestWeightDateText, state: manager.loadState.rawValue)
            MetricCard(title: "Sleep", value: manager.latestSleepText, unit: "h", detail: manager.latestSleepDateText, state: manager.loadState.rawValue)
            MetricCard(title: "Steps", value: manager.last7DaysStepsText, unit: "steps", detail: "\(manager.last7DaysStepsAverageText) avg/day · \(manager.last7DaysStepsDateText)", state: manager.loadState.rawValue)
            MetricCard(title: "HRV", value: manager.latestHrvText, unit: "ms", detail: manager.latestHrvDateText, state: manager.loadState.rawValue)
            MetricCard(title: "Resting HR", value: manager.latestRestingHrText, unit: "bpm", detail: manager.latestRestingHrDateText, state: manager.loadState.rawValue)
            MetricCard(title: "Active Energy", value: manager.latestActiveEnergyText, unit: "kcal", detail: manager.latestActiveEnergyDateText, state: manager.loadState.rawValue)
            MetricCard(title: "Workouts", value: manager.workoutsLast7DaysText, unit: "count", detail: manager.workoutsLast7DaysDateText, state: manager.loadState.rawValue)
        }
    }

    private var readinessCards: some View {
        let columns = dashboardColumns

        return VStack(alignment: .leading, spacing: 12) {
            Text("Recovery & Readiness")
                .font(.headline)

            LazyVGrid(columns: columns, alignment: .leading, spacing: 12) {
                MetricCard(title: "Recovery Score", value: manager.recoveryScoreText, unit: "%", detail: "Sleep, load, HRV, and resting HR", state: manager.recoveryReadinessText)
                MetricCard(title: "Readiness", value: manager.todayReadinessText, unit: "", detail: "Train hard or recover today", state: manager.todayRecommendationText)
                MetricCard(title: "Training Load", value: manager.trainingLoadText, unit: "%", detail: "Workout and calorie pressure", state: manager.recoveryReadinessText)
                MetricCard(title: "Weekly Trend", value: manager.weeklyRecoveryTrendText, unit: "%", detail: "7-day moving average", state: manager.recoveryTrendDeltaText)
            }
        }
    }

    private var actionsCard: some View {
        SectionCard(title: "Quick Actions", subtitle: "Health authorization and loading") {
            VStack(spacing: 10) {
                Button {
                    Task { await permissions.requestAuthorization() }
                } label: {
                    Label("Request Health Access", systemImage: "heart.text.square")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)

                Button {
                    Task { await manager.loadLatestDataIfAuthorized() }
                } label: {
                    Label("Load Latest Data", systemImage: "arrow.down.circle")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
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

    private var dashboardColumns: [GridItem] {
        let columnCount = horizontalSizeClass == .regular ? 2 : 1
        return Array(
            repeating: GridItem(.flexible(minimum: 0, maximum: .infinity), spacing: 12, alignment: .top),
            count: columnCount
        )
    }

    private static var dashboardContentWidth: CGFloat {
        max(UIScreen.main.bounds.width - 40, 320)
    }
}
