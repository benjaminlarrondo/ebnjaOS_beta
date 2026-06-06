import SwiftUI

struct RecoveryView: View {
    @EnvironmentObject private var manager: HealthKitManager

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                summaryCard
                componentsCard
                trendCard
            }
            .padding()
        }
    }

    private var summaryCard: some View {
        SectionCard(title: "Recovery Score", subtitle: "Real Apple Health inputs") {
            VStack(alignment: .leading, spacing: 12) {
                MetricCard(title: "Score", value: manager.recoveryScoreText, unit: "%", detail: manager.statusDetail, state: manager.recoveryReadinessText)
                StatusRow(label: "Readiness", value: manager.recoveryReadinessText)
                StatusRow(label: "Recommendation", value: manager.todayRecommendationText)
            }
        }
    }

    private var componentsCard: some View {
        SectionCard(title: "Components", subtitle: "What influences recovery") {
            VStack(spacing: 12) {
                StatusRow(label: "Sleep", value: manager.latestSleepText)
                StatusRow(label: "Training Load", value: manager.trainingLoadText)
                StatusRow(label: "HRV", value: manager.latestHrvText)
                StatusRow(label: "Resting HR", value: manager.latestRestingHrText)
            }
        }
    }

    private var trendCard: some View {
        SectionCard(title: "Weekly Trend", subtitle: "7-day moving average") {
            VStack(alignment: .leading, spacing: 8) {
                Text(manager.weeklyRecoveryTrendText)
                    .font(.largeTitle.bold())
                Text("Delta: \(manager.recoveryTrendDeltaText)%")
                    .foregroundStyle(.secondary)
                Text("Based on the latest 30 days of Apple Health data.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
    }
}
