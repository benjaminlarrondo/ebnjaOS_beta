import SwiftUI

struct AgendaView: View {
    @EnvironmentObject private var agendaService: AgendaService
    @State private var mode: AgendaMode = .day
    @State private var selectedDate: Date = .now
    @State private var showCreateEvent = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                header
                teteCard
                modePicker
                dayOrWeekCard
                upcomingCard
            }
            .padding(.horizontal, 16)
            .padding(.top, 12)
            .padding(.bottom, 24)
        }
        .scrollIndicators(.hidden)
        .sheet(isPresented: $showCreateEvent) {
            AgendaCreateEventSheet(service: agendaService)
        }
        .task {
            _ = await agendaService.requestAccessIfNeeded()
        }
    }

    private var header: some View {
        CompactSectionHeader(
            title: "Agenda",
            subtitle: "Calendario lite: hoy, semana y próximos 5 días.",
            trailing: AnyView(
                Button {
                    showCreateEvent = true
                } label: {
                    Label("Evento", systemImage: "plus.circle.fill")
                }
                .buttonStyle(.borderedProminent)
            )
        )
    }

    private var teteCard: some View {
        SectionCard(title: "Tete", subtitle: agendaService.teteSourceText) {
            VStack(alignment: .leading, spacing: 8) {
                CompactStatusRow(label: "Hoy", value: agendaService.teteStatusText, detail: agendaService.nextTeteChangeText)
                CompactStatusRow(label: "Próximos 5 días", value: agendaService.teteWeekText, detail: agendaService.nextTeteActivityText)
            }
        }
    }

    private var modePicker: some View {
        Picker("Mode", selection: $mode) {
            ForEach(AgendaMode.allCases) { value in
                Text(value.displayName).tag(value)
            }
        }
        .pickerStyle(.segmented)
    }

    private var dayOrWeekCard: some View {
        SectionCard(title: mode.title, subtitle: mode.subtitle) {
            if mode == .day {
                dayCard
            } else {
                weekCard
            }
        }
    }

    private var dayCard: some View {
        let summary = agendaService.daySummary(for: selectedDate)
        return VStack(alignment: .leading, spacing: 10) {
            CompactStatusRow(label: "Hitos", value: "\(summary.eventCount)", detail: "\(summary.criticalCount) requieren atención")
            CompactStatusRow(label: "Tete", value: summary.teteStatus.label, detail: summary.teteStatus.note)

            if summary.events.isEmpty {
                Text("No hay eventos en este día.")
                    .foregroundStyle(.secondary)
            } else {
                ForEach(summary.events) { event in
                    NavigationLink {
                        AgendaEventDetailView(event: event)
                    } label: {
                        AgendaEventRow(event: event)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private var weekCard: some View {
        let summaries = agendaService.upcomingEvents(daysAhead: 5)
        return VStack(alignment: .leading, spacing: 10) {
            ForEach(summaries) { day in
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text(day.date.formatted(.dateTime.weekday(.wide).day().month(.abbreviated)))
                            .font(.subheadline.weight(.semibold))
                        Spacer()
                        Text("\(day.eventCount) hitos")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                    CompactStatusRow(label: "Tete", value: day.teteStatus.label, detail: day.teteStatus.note)
                    if let firstEvent = day.events.first {
                        Text(firstEvent.title)
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                    }
                }
                .padding(.vertical, 4)
            }
        }
    }

    private var upcomingCard: some View {
        SectionCard(title: "Próximos 5 días", subtitle: "Eventos reales desde EventKit") {
            let summaries = agendaService.upcomingEvents(daysAhead: 5)
            VStack(alignment: .leading, spacing: 10) {
                ForEach(summaries) { summary in
                    CompactStatusRow(
                        label: summary.date.formatted(.dateTime.weekday(.abbreviated).day()),
                        value: "\(summary.eventCount) hitos",
                        detail: summary.events.first?.title ?? "Sin eventos"
                    )
                }
            }
        }
    }
}

private enum AgendaMode: String, CaseIterable, Identifiable {
    case day
    case week

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .day: return "Día"
        case .week: return "Semana"
        }
    }

    var title: String {
        switch self {
        case .day: return "Vista día"
        case .week: return "Vista semana"
        }
    }

    var subtitle: String {
        switch self {
        case .day: return "Qué tienes hoy, qué requiere atención y qué viene después."
        case .week: return "Lunes a domingo resumido en próximos 5 días."
        }
    }
}

private struct AgendaEventRow: View {
    let event: AgendaEvent

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            RoundedRectangle(cornerRadius: 2, style: .continuous)
                .fill(event.isCritical ? Color.accentColor : Color.secondary.opacity(0.5))
                .frame(width: 4)
            VStack(alignment: .leading, spacing: 4) {
                Text(event.title)
                    .font(.subheadline.weight(.semibold))
                Text(event.startDate.formatted(date: .omitted, time: .shortened))
                    .font(.caption)
                    .foregroundStyle(.secondary)
                if let notes = event.notes, !notes.isEmpty {
                    Text(notes)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }
            }
            Spacer()
        }
        .padding(10)
        .background(.thinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}

private struct AgendaEventDetailView: View {
    let event: AgendaEvent

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                SectionCard(title: event.title, subtitle: event.calendarTitle) {
                    VStack(alignment: .leading, spacing: 8) {
                        CompactStatusRow(label: "Inicio", value: event.startDate.formatted(date: .abbreviated, time: .shortened), detail: nil)
                        CompactStatusRow(label: "Término", value: event.endDate.formatted(date: .abbreviated, time: .shortened), detail: nil)
                        CompactStatusRow(label: "Fuente", value: event.source.rawValue.uppercased(), detail: nil)
                        if let notes = event.notes, !notes.isEmpty {
                            Text(notes)
                                .font(.footnote)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
            .padding()
        }
        .navigationTitle("Detalle")
    }
}

private struct AgendaCreateEventSheet: View {
    @Environment(\.dismiss) private var dismiss
    @State private var title: String = ""
    @State private var category: String = "General"
    @State private var note: String = ""
    @State private var startDate: Date = .now
    @State private var endDate: Date = .now.addingTimeInterval(3600)
    @State private var errorMessage: String?
    @State private var isSaving = false
    let service: AgendaService

    var body: some View {
        NavigationStack {
            Form {
                Section("Nuevo evento") {
                    TextField("Título", text: $title)
                    TextField("Categoría", text: $category)
                    DatePicker("Inicio", selection: $startDate)
                    DatePicker("Término", selection: $endDate)
                    TextField("Nota opcional", text: $note, axis: .vertical)
                }

                if let errorMessage {
                    Section {
                        Text(errorMessage)
                            .foregroundStyle(.red)
                    }
                }
            }
            .navigationTitle("+ Evento")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancelar") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(isSaving ? "Guardando..." : "Guardar") {
                        Task { await save() }
                    }
                    .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || isSaving)
                }
            }
        }
    }

    private func save() async {
        isSaving = true
        defer { isSaving = false }

        do {
            try await service.createEvent(title: title, startDate: startDate, endDate: endDate, category: category, notes: note.isEmpty ? nil : note)
            dismiss()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
