import SwiftUI

struct ReadinessView: View {
    @EnvironmentObject private var manager: HealthKitManager

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                todaysReadinessCard
                whyCard
                riskCard
            }
            .padding()
        }
    }

    private var todaysReadinessCard: some View {
        SectionCard(title: "Today's Readiness", subtitle: "Actionable training advice") {
            VStack(alignment: .leading, spacing: 10) {
                MetricCard(title: "Level", value: manager.todayReadinessText, unit: "", detail: manager.recoveryReadinessText, state: manager.todayRecommendationText)
                StatusRow(label: "Recommendation", value: manager.todayRecommendationText)
                StatusRow(label: "Recovery Score", value: manager.todayRecoveryScoreText)
            }
        }
    }

    private var whyCard: some View {
        SectionCard(title: "Why?", subtitle: "Main reasons behind the recommendation") {
            VStack(alignment: .leading, spacing: 8) {
                if manager.readinessWhy.isEmpty {
                    Text("Waiting for HealthKit data.")
                        .foregroundStyle(.secondary)
                } else {
                    ForEach(manager.readinessWhy, id: \.self) { item in
                        Label(item, systemImage: "checkmark.circle")
                            .font(.footnote)
                    }
                }
            }
        }
    }

    private var riskCard: some View {
        SectionCard(title: "Risk Factors", subtitle: "Signals to watch today") {
            VStack(alignment: .leading, spacing: 8) {
                if manager.readinessRiskFactors.isEmpty {
                    Text("No major risk factors detected.")
                        .foregroundStyle(.secondary)
                } else {
                    ForEach(manager.readinessRiskFactors, id: \.self) { item in
                        Label(item, systemImage: "exclamationmark.triangle")
                            .font(.footnote)
                    }
                }
            }
        }
    }
}
