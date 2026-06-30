import SwiftUI

struct DashboardView: View {
    @EnvironmentObject private var navigation: AppNavigationState
    @EnvironmentObject private var manager: HealthKitManager
    @EnvironmentObject private var fitnessStore: FitnessExecutionStore
    @EnvironmentObject private var agendaService: AgendaService
    @EnvironmentObject private var trackingStore: TrackingStore
    @EnvironmentObject private var brainStore: BrainStore
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                header
                dayStatusCard
                modulesGrid
                insightsCard
            }
            .padding(.horizontal, 16)
            .padding(.top, 12)
            .padding(.bottom, 24)
        }
        .scrollIndicators(.hidden)
    }

    private var header: some View {
        CompactSectionHeader(
            title: "ebnjaOS",
            subtitle: "Qué tengo que hacer hoy en menos de 5 segundos.",
            trailing: AnyView(
                Text(manager.latestUpdatedText)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            )
        )
    }

    private var dayStatusCard: some View {
        SectionCard(title: "Estado del día", subtitle: "Recovery, readiness y foco operativo") {
            VStack(alignment: .leading, spacing: 8) {
                CompactStatusRow(label: "Recovery", value: manager.recoveryScoreText, detail: manager.recoveryReadinessText)
                CompactStatusRow(label: "Readiness", value: manager.todayReadinessText, detail: manager.todayRecommendationText)
                CompactStatusRow(label: "Workout de hoy", value: fitnessStore.recommendedTemplate?.name ?? "Pendiente", detail: manager.latestSleepText)
            }
        }
    }

    private var modulesGrid: some View {
        LazyVGrid(columns: columns, alignment: .leading, spacing: 10) {
            Button {
                navigation.selectedTab = .fitness
            } label: {
                CompactModuleCard(
                    title: "Fitness",
                    subtitle: "Qué toca entrenar hoy",
                    value: fitnessStore.recommendedTemplate?.name ?? "Rutina pendiente",
                    detail: fitnessStore.nextTrainingTemplate?.workoutDay.description ?? "Selecciona y empieza una rutina",
                    icon: "figure.strengthtraining.traditional"
                )
            }
            .buttonStyle(.plain)

            Button {
                navigation.selectedTab = .agenda
            } label: {
                CompactModuleCard(
                    title: "Agenda",
                    subtitle: "Hitos del día y próximos 5 días",
                    value: "\(agendaService.daySummary(for: .now).eventCount) hitos hoy",
                    detail: agendaService.nextTeteChangeText,
                    icon: "calendar"
                )
            }
            .buttonStyle(.plain)

            NavigationLink {
                TrackingView()
            } label: {
                CompactModuleCard(
                    title: "Hábitos",
                    subtitle: "Pendientes y completados",
                    value: "\(trackingStore.completedCount)/\(trackingStore.completedCount + trackingStore.pendingCount)",
                    detail: trackingStore.weeklySummaryText,
                    icon: "checklist"
                )
            }
            .buttonStyle(.plain)

            NavigationLink {
                TeteView()
            } label: {
                CompactModuleCard(
                    title: "Tete",
                    subtitle: "Hoy con Tete / sin Tete",
                    value: agendaService.teteStatusText,
                    detail: agendaService.nextTeteChangeText,
                    icon: "heart.fill"
                )
            }
            .buttonStyle(.plain)

            Button {
                navigation.selectedTab = .brain
            } label: {
                CompactModuleCard(
                    title: "Brain",
                    subtitle: "Inbox y últimas capturas",
                    value: brainStore.lastCaptureText,
                    detail: "\(brainStore.inboxCount) elementos en inbox",
                    icon: "brain.head.profile"
                )
            }
            .buttonStyle(.plain)
        }
    }

    private var insightsCard: some View {
        SectionCard(title: "Insights", subtitle: "Una acción sugerida para ahora") {
            VStack(alignment: .leading, spacing: 8) {
                CompactStatusRow(
                    label: "Acción",
                    value: insightActionTitle,
                    detail: insightActionDetail
                )
            }
        }
    }

    private var insightActionTitle: String {
        if manager.todayRecommendationText == TrainingRecommendation.fullRest.displayName {
            return "Recupera primero"
        }
        if fitnessStore.recommendedTemplate == nil {
            return "Elige rutina"
        }
        return "Entrena hoy"
    }

    private var insightActionDetail: String {
        if manager.todayRecommendationText == TrainingRecommendation.fullRest.displayName {
            return "Prioriza descanso, sueño y recuperación antes de forzar carga."
        }
        return "Abre Fitness, inicia tu sesión y vuelve a Home para seguir el día."
    }

    private var columns: [GridItem] {
        let count = horizontalSizeClass == .regular ? 2 : 1
        return Array(repeating: GridItem(.flexible(), spacing: 10), count: count)
    }
}
