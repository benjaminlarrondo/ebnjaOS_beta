import Foundation

enum CalendarEventSource: String, Codable, CaseIterable, Identifiable {
    case celeste
    case eventKit

    var id: String { rawValue }
}

enum CelesteCalendarOwner: String, Codable, CaseIterable, Identifiable {
    case mine
    case hers
    case neutral

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .mine: return "Tete"
        case .hers: return "Celeste"
        case .neutral: return "Neutral"
        }
    }
}

struct CelesteDayRecord: Codable, Hashable {
    let owner: CelesteCalendarOwner
    let exception: Bool
    let note: String?
}

struct CelesteCalendarSnapshot: Codable, Hashable {
    let version: String?
    let year: Int?
    let days: [String: CelesteDayRecord]
    let meta: [String: String]?
}

struct CelesteDay: Identifiable, Hashable {
    let id: String
    let date: Date
    let owner: CelesteCalendarOwner
    let note: String?
    let isToday: Bool
}

struct TeteDayStatus: Identifiable, Hashable {
    let id: String
    let date: Date
    let label: String
    let isTete: Bool
    let note: String?
}

struct NextChange: Identifiable, Hashable {
    let id = UUID()
    let date: Date
    let owner: CelesteCalendarOwner
    let message: String
}

struct TeteScheduleSummary: Identifiable, Hashable {
    let id = UUID()
    let today: CelesteDay
    let upcomingDays: [CelesteDay]
    let nextChange: NextChange?
    let sourceLabel: String
}
