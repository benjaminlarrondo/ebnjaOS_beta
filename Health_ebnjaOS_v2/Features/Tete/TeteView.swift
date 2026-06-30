import SwiftUI

struct TeteView: View {
    @EnvironmentObject private var agendaService: AgendaService

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                header
                statusCard
                upcomingCard
                nextChangeCard
                sourceCard
            }
            .padding(.horizontal, 16)
            .padding(.top, 12)
            .padding(.bottom, 24)
        }
        .scrollIndicators(.hidden)
    }

    private var header: some View {
        CompactSectionHeader(
            title: "Tete",
            subtitle: "Responde rápido: hoy, próximos 5 días y próximo cambio.",
            trailing: AnyView(
                Text(agendaService.teteSourceText)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            )
        )
    }

    private var statusCard: some View {
        SectionCard(title: "Estado de hoy", subtitle: "¿Me toca hoy?") {
            CompactStatusRow(label: "Hoy", value: agendaService.teteStatusText, detail: nil)
        }
    }

    private var upcomingCard: some View {
        SectionCard(title: "Próximos 5 días", subtitle: "Vista compacta semanal") {
            VStack(alignment: .leading, spacing: 8) {
                ForEach(agendaService.teteUpcomingDays(days: 5)) { day in
                    CompactStatusRow(
                        label: day.date.formatted(.dateTime.weekday(.abbreviated).day()),
                        value: day.label,
                        detail: day.note
                    )
                }
            }
        }
    }

    private var nextChangeCard: some View {
        SectionCard(title: "Próximo cambio", subtitle: "Fecha exacta y sentido del cambio") {
            CompactStatusRow(label: "Cambio", value: agendaService.nextTeteChangeText, detail: agendaService.nextTeteActivityText)
        }
    }

    private var sourceCard: some View {
        SectionCard(title: "Fuente", subtitle: "Adapter o snapshot usado para Tete") {
            CompactStatusRow(label: "Fuente", value: agendaService.teteSourceText, detail: "No se modifica owner ni reglas.")
        }
    }
}
