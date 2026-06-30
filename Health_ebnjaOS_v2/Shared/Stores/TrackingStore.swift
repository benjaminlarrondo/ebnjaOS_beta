import Foundation
import OSLog

@MainActor
final class TrackingStore: ObservableObject {
    @Published private(set) var definitions: [HabitDefinition]
    @Published private(set) var entries: [HabitEntry] = []
    @Published private(set) var lastUpdatedText: String = "Never"
    @Published private(set) var syncStatusText: String = "Local-first"

    private let store = LocalCodableStore<HabitPayload>(fileName: "habits-v1.json", category: "TrackingStore")
    private let logger = Logger(subsystem: "Health_ebnjaOS_v2", category: "Tracking")

    init() {
        self.definitions = Self.defaultDefinitions
        restore()
    }

    var scoreText: String {
        let completed = todayCompletedCount
        let total = definitions.count
        guard total > 0 else { return "0" }
        let score = Int((Double(completed) / Double(total)) * 100.0)
        return "\(score)"
    }

    var pendingCount: Int {
        max(definitions.count - todayCompletedCount, 0)
    }

    var completedCount: Int {
        todayCompletedCount
    }

    var streakText: String {
        let streak = entries.sorted(by: { $0.date > $1.date }).prefix(7).count
        return "\(streak) días"
    }

    var weeklySummaryText: String {
        let recent = entries.filter { Calendar.current.isDate($0.date, equalTo: .now, toGranularity: .day) || $0.date > Calendar.current.date(byAdding: .day, value: -7, to: .now)! }
        return "\(recent.count) registros en 7 días"
    }

    func entry(for habit: HabitDefinition) -> HabitEntry? {
        entries.last { $0.habitID == habit.id && Calendar.current.isDate($0.date, inSameDayAs: .now) }
    }

    func saveCheck(for habit: HabitDefinition, note: String? = nil, value: String? = nil) {
        saveEntry(habit: habit, kind: habit.kind, value: value ?? "done", note: note)
    }

    func saveCount(for habit: HabitDefinition, value: String, note: String? = nil) {
        saveEntry(habit: habit, kind: .count, value: value, note: note)
    }

    func saveNote(for habit: HabitDefinition, note: String) {
        saveEntry(habit: habit, kind: .note, value: nil, note: note)
    }

    func remove(_ entry: HabitEntry) {
        entries.removeAll { $0.id == entry.id }
        persist()
    }

    private func saveEntry(habit: HabitDefinition, kind: HabitEntryKind, value: String?, note: String?) {
        entries.removeAll {
            $0.habitID == habit.id && Calendar.current.isDate($0.date, inSameDayAs: .now)
        }
        let entry = HabitEntry(id: UUID(), habitID: habit.id, date: .now, kind: kind, value: value, note: note)
        entries.insert(entry, at: 0)
        persist()
        logger.info("Habit entry saved habit=\(habit.title, privacy: .public)")
    }

    private func restore() {
        guard let payload = store.load() else { return }
        entries = payload.entries
        lastUpdatedText = Self.dateFormatter.string(from: payload.lastUpdatedAt)
        syncStatusText = "Local restored"
    }

    private func persist() {
        let payload = HabitPayload(entries: entries, lastUpdatedAt: .now)
        lastUpdatedText = Self.dateFormatter.string(from: payload.lastUpdatedAt)
        syncStatusText = "Local saved"
        store.save(payload)
    }

    private var todayCompletedCount: Int {
        definitions.compactMap { entry(for: $0) }.count
    }

    private static let defaultDefinitions: [HabitDefinition] = [
        .init(id: UUID(uuidString: "00000000-0000-0000-0000-000000000101")!, title: "Agua", symbol: "drop.fill", kind: .count, target: "8 vasos"),
        .init(id: UUID(uuidString: "00000000-0000-0000-0000-000000000102")!, title: "Medicamentos", symbol: "pills.fill", kind: .check, target: "Tomar"),
        .init(id: UUID(uuidString: "00000000-0000-0000-0000-000000000103")!, title: "Entrenamiento", symbol: "figure.strengthtraining.traditional", kind: .check, target: "Hoy"),
        .init(id: UUID(uuidString: "00000000-0000-0000-0000-000000000104")!, title: "Comidas", symbol: "fork.knife", kind: .count, target: "3 comidas"),
        .init(id: UUID(uuidString: "00000000-0000-0000-0000-000000000105")!, title: "Lectura", symbol: "book.fill", kind: .count, target: "20 min"),
        .init(id: UUID(uuidString: "00000000-0000-0000-0000-000000000106")!, title: "PMP", symbol: "checklist", kind: .check, target: "Bloque"),
        .init(id: UUID(uuidString: "00000000-0000-0000-0000-000000000107")!, title: "Música", symbol: "music.note", kind: .count, target: "1 sesión"),
        .init(id: UUID(uuidString: "00000000-0000-0000-0000-000000000108")!, title: "Sueño", symbol: "moon.zzz.fill", kind: .count, target: "7h+")
    ]

    private static let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter
    }()
}
