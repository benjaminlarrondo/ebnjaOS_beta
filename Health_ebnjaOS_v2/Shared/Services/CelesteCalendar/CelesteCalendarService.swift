import Foundation
import OSLog

@MainActor
final class CelesteCalendarService: ObservableObject {
    enum LoadState: String {
        case idle
        case loaded
        case failed
    }

    @Published private(set) var loadState: LoadState = .idle
    @Published private(set) var sourceLabel: String = "Local snapshot"
    @Published private(set) var loadStatusText: String = "Ready"
    @Published private(set) var loadStatusMessage: String = "Using versioned local snapshot from celeste_calendar."

    private let logger = Logger(subsystem: "Health_ebnjaOS_v2", category: "CelesteCalendar")
    private let decoder: JSONDecoder
    private let snapshot: CelesteCalendarSnapshot?

    init(bundle: Bundle = .main) {
        self.decoder = JSONDecoder()
        self.decoder.dateDecodingStrategy = .iso8601

        if let url = bundle.url(forResource: "celeste_calendar_snapshot", withExtension: "json", subdirectory: "CelesteCalendar") {
            do {
                let data = try Data(contentsOf: url)
                self.snapshot = try decoder.decode(CelesteCalendarSnapshot.self, from: data)
                self.loadState = .loaded
                self.loadStatusText = "Loaded"
                self.loadStatusMessage = "Using local versioned celeste_calendar snapshot."
            } catch {
                self.snapshot = nil
                self.loadState = .failed
                self.loadStatusText = "Failed"
                self.loadStatusMessage = "Unable to read celeste_calendar snapshot."
                logger.error("Failed to decode celeste calendar snapshot: \(error.localizedDescription, privacy: .public)")
            }
        } else {
            self.snapshot = nil
            self.loadState = .failed
            self.loadStatusText = "Missing"
            self.loadStatusMessage = "celeste_calendar snapshot resource not found."
        }
    }

    func status(for date: Date, calendar: Calendar = .current) -> CelesteDay {
        let key = Self.dateKey(for: date)
        let record = snapshot?.days[key]
        let owner = record?.owner ?? defaultOwner(for: date, calendar: calendar)
        let note = record?.note
        return CelesteDay(
            id: key,
            date: date,
            owner: owner,
            note: note,
            isToday: calendar.isDateInToday(date)
        )
    }

    func upcoming(days count: Int = 5, from date: Date = .now, calendar: Calendar = .current) -> [CelesteDay] {
        guard count > 0 else { return [] }
        return (0..<count).compactMap { offset in
            guard let targetDate = calendar.date(byAdding: .day, value: offset, to: date) else { return nil }
            return status(for: targetDate, calendar: calendar)
        }
    }

    func nextChange(after date: Date = .now, days lookAhead: Int = 5, calendar: Calendar = .current) -> NextChange? {
        let currentOwner = status(for: date, calendar: calendar).owner
        for offset in 1...max(lookAhead, 5) {
            guard let targetDate = calendar.date(byAdding: .day, value: offset, to: date) else { continue }
            let owner = status(for: targetDate, calendar: calendar).owner
            if owner != currentOwner {
                let message = owner == .mine ? "Vuelve Tete" : "Sale Tete"
                return NextChange(date: targetDate, owner: owner, message: message)
            }
        }
        return nil
    }

    func summary(days count: Int = 5, from date: Date = .now, calendar: Calendar = .current) -> TeteScheduleSummary {
        let today = status(for: date, calendar: calendar)
        let upcomingDays = upcoming(days: count, from: date, calendar: calendar)
        return TeteScheduleSummary(
            today: today,
            upcomingDays: upcomingDays,
            nextChange: nextChange(after: date, days: count, calendar: calendar),
            sourceLabel: sourceLabel
        )
    }

    private func defaultOwner(for date: Date, calendar: Calendar) -> CelesteCalendarOwner {
        let weekday = calendar.component(.weekday, from: date)
        switch weekday {
        case 1, 7:
            return .hers
        default:
            return .mine
        }
    }

    private static func dateKey(for date: Date, calendar: Calendar = .current) -> String {
        let formatter = DateFormatter()
        formatter.calendar = calendar
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: date)
    }
}
