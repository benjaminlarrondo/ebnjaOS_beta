import SwiftUI

struct TrackingView: View {
    @EnvironmentObject private var store: TrackingStore
    @State private var selectedHabit: HabitDefinition?
    @State private var noteText: String = ""
    @State private var countText: String = ""

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                header
                summaryCard
                habitsCard
            }
            .padding(.horizontal, 16)
            .padding(.top, 12)
            .padding(.bottom, 24)
        }
        .scrollIndicators(.hidden)
        .sheet(item: $selectedHabit) { habit in
            HabitEntrySheet(habit: habit, store: store)
        }
    }

    private var header: some View {
        CompactSectionHeader(
            title: "Hábitos",
            subtitle: "Dashboard diario local-first con trazabilidad.",
            trailing: AnyView(Text(store.lastUpdatedText).font(.caption).foregroundStyle(.secondary))
        )
    }

    private var summaryCard: some View {
        SectionCard(title: "Dashboard diario", subtitle: "Score, pendientes, completados y streak") {
            VStack(alignment: .leading, spacing: 8) {
                CompactStatusRow(label: "Score", value: store.scoreText, detail: "de 100")
                CompactStatusRow(label: "Pendientes", value: "\(store.pendingCount)", detail: "para hoy")
                CompactStatusRow(label: "Completados", value: "\(store.completedCount)", detail: store.streakText)
                CompactStatusRow(label: "Semana", value: store.weeklySummaryText, detail: store.syncStatusText)
            }
        }
    }

    private var habitsCard: some View {
        SectionCard(title: "Hábitos base", subtitle: "Toca un hábito para registrar") {
            VStack(alignment: .leading, spacing: 8) {
                ForEach(store.definitions) { habit in
                    Button {
                        selectedHabit = habit
                    } label: {
                        HabitRow(habit: habit, entry: store.entry(for: habit))
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
}

private struct HabitRow: View {
    let habit: HabitDefinition
    let entry: HabitEntry?

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: habit.symbol)
                .font(.system(size: 15, weight: .semibold))
                .frame(width: 26, height: 26)
                .background(.thinMaterial)
                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))

            VStack(alignment: .leading, spacing: 2) {
                Text(habit.title)
                    .font(.subheadline.weight(.semibold))
                Text(habit.target ?? habit.kind.displayName)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Text(entry == nil ? "Pendiente" : "Hecho")
                .font(.caption.weight(.semibold))
                .padding(.horizontal, 8)
                .padding(.vertical, 5)
                .background((entry == nil ? Color.secondary : Color.green).opacity(0.16))
                .clipShape(Capsule())
        }
        .padding(10)
        .background(.thinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}

private struct HabitEntrySheet: View {
    @Environment(\.dismiss) private var dismiss
    let habit: HabitDefinition
    let store: TrackingStore
    @State private var value: String = ""
    @State private var note: String = ""

    var body: some View {
        NavigationStack {
            Form {
                Section(habit.title) {
                    if habit.kind == .count {
                        TextField("Cantidad", text: $value)
                            .keyboardType(.numberPad)
                    }
                    TextField("Nota opcional", text: $note, axis: .vertical)
                }
            }
            .navigationTitle(habit.title)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancelar") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Guardar") {
                        switch habit.kind {
                        case .check:
                            store.saveCheck(for: habit, note: note.isEmpty ? nil : note)
                        case .count:
                            store.saveCount(for: habit, value: value.isEmpty ? "1" : value, note: note.isEmpty ? nil : note)
                        case .note:
                            store.saveNote(for: habit, note: note.isEmpty ? "Entrada" : note)
                        }
                        dismiss()
                    }
                }
            }
        }
    }
}
