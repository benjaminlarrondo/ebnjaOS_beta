import Foundation

enum HabitEntryKind: String, Codable, CaseIterable, Identifiable, Hashable {
    case check
    case count
    case note

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .check: return "Check"
        case .count: return "Count"
        case .note: return "Note"
        }
    }
}

struct HabitDefinition: Codable, Hashable, Identifiable {
    let id: UUID
    let title: String
    let symbol: String
    let kind: HabitEntryKind
    let target: String?
}

struct HabitEntry: Codable, Hashable, Identifiable {
    let id: UUID
    let habitID: UUID
    let date: Date
    let kind: HabitEntryKind
    let value: String?
    let note: String?
}

struct HabitPayload: Codable, Hashable {
    var entries: [HabitEntry]
    var lastUpdatedAt: Date
}
