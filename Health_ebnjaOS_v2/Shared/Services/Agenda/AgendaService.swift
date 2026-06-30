import Foundation
import EventKit
import OSLog

struct AgendaEvent: Identifiable, Hashable {
    let id: String
    let title: String
    let startDate: Date
    let endDate: Date
    let calendarTitle: String
    let notes: String?
    let isToday: Bool
    let isCritical: Bool
    let source: CalendarEventSource
}

struct AgendaDaySummary: Identifiable, Hashable {
    let id: String
    let date: Date
    let eventCount: Int
    let criticalCount: Int
    let teteStatus: TeteDayStatus
    let events: [AgendaEvent]
}

@MainActor
final class AgendaService: ObservableObject {
    enum LoadState: String {
        case idle
        case loaded
        case denied
        case failed
    }

    @Published private(set) var loadState: LoadState = .idle
    @Published private(set) var statusText: String = "Ready"
    @Published private(set) var statusDetail: String = "Calendar surface is ready."
    @Published private(set) var lastSyncText: String = "Never"
    @Published private(set) var lastSyncDate: Date?

    private let logger = Logger(subsystem: "Health_ebnjaOS_v2", category: "Agenda")
    private let eventStore: EKEventStore
    private let teteProvider: TeteScheduleProvider
    private let calendar: Calendar

    init(
        eventStore: EKEventStore = EKEventStore(),
        celesteCalendarService: CelesteCalendarService = CelesteCalendarService(),
        calendar: Calendar = .current
    ) {
        self.eventStore = eventStore
        self.teteProvider = TeteScheduleProvider(service: celesteCalendarService)
        self.calendar = calendar
    }

    var teteSourceText: String { teteProvider.sourceLabel }
    var teteStatusText: String { teteProvider.todayStatusText() }
    var teteWeekText: String { teteProvider.weekSummaryText() }
    var nextTeteChangeText: String { teteProvider.nextChangeText() }
    var nextTeteActivityText: String { teteProvider.nextActivityText() }

    func teteUpcomingDays(days: Int = 5) -> [TeteDayStatus] {
        teteProvider.upcomingDays(days: days)
    }

    func requestAccessIfNeeded() async -> Bool {
        guard EKEventStore.authorizationStatus(for: .event) != .authorized else {
            loadState = .loaded
            statusText = "Calendar authorized"
            statusDetail = "EventKit access already granted."
            return true
        }

        do {
            let granted = try await eventStore.requestFullAccessToEvents()
            loadState = granted ? .loaded : .denied
            statusText = granted ? "Calendar authorized" : "Calendar denied"
            statusDetail = granted ? "EventKit full access granted." : "EventKit access denied."
            return granted
        } catch {
            loadState = .failed
            statusText = "Calendar error"
            statusDetail = error.localizedDescription
            logger.error("Agenda permission failed: \(error.localizedDescription, privacy: .public)")
            return false
        }
    }

    func loadDaySummaries(daysAhead: Int = 5) async -> [AgendaDaySummary] {
        let granted = await requestAccessIfNeeded()
        guard granted else { return [] }
        return (0..<daysAhead).compactMap { offset in
            guard let date = calendar.date(byAdding: .day, value: offset, to: .now) else { return nil }
            return daySummary(for: date)
        }
    }

    func daySummary(for date: Date) -> AgendaDaySummary {
        let events = events(on: date)
        let teteStatus = teteProvider.upcomingDays(days: 5, from: date).first ?? TeteDayStatus(id: "missing", date: date, label: "Libre", isTete: false, note: nil)
        let criticalCount = events.filter { $0.isCritical }.count
        return AgendaDaySummary(
            id: Self.dateKey(for: date),
            date: date,
            eventCount: events.count,
            criticalCount: criticalCount,
            teteStatus: teteStatus,
            events: events
        )
    }

    func events(on date: Date) -> [AgendaEvent] {
        let start = calendar.startOfDay(for: date)
        guard let end = calendar.date(byAdding: .day, value: 1, to: start) else { return [] }
        let predicate = eventStore.predicateForEvents(withStart: start, end: end, calendars: nil)
        let events = eventStore.events(matching: predicate)
        return events.map { event in
            AgendaEvent(
                id: event.eventIdentifier ?? UUID().uuidString,
                title: event.title ?? "Untitled",
                startDate: event.startDate,
                endDate: event.endDate,
                calendarTitle: event.calendar.title,
                notes: event.notes,
                isToday: calendar.isDateInToday(date),
                isCritical: event.isAllDay || event.hasRecurrenceRules || event.availability == .busy,
                source: .eventKit
            )
        }
        .sorted { $0.startDate < $1.startDate }
    }

    func upcomingEvents(daysAhead: Int = 5) -> [AgendaDaySummary] {
        (0..<daysAhead).compactMap { offset in
            guard let date = calendar.date(byAdding: .day, value: offset, to: .now) else { return nil }
            return daySummary(for: date)
        }
    }

    func createEvent(
        title: String,
        startDate: Date,
        endDate: Date,
        category: String,
        notes: String?
    ) async throws {
        let granted = await requestAccessIfNeeded()
        guard granted else {
            throw AgendaError.calendarPermissionRequired
        }

        guard let calendar = eventStore.defaultCalendarForNewEvents ?? eventStore.calendars(for: .event).first else {
            throw AgendaError.calendarUnavailable
        }

        let event = EKEvent(eventStore: eventStore)
        event.title = title
        event.startDate = startDate
        event.endDate = endDate
        event.notes = notes
        event.calendar = calendar
        event.addAlarm(EKAlarm(relativeOffset: -900))
        if !category.isEmpty {
            event.notes = [notes, "Category: \(category)"].compactMap { $0 }.joined(separator: "\n")
        }

        try eventStore.save(event, span: .thisEvent, commit: true)
        lastSyncDate = .now
        lastSyncText = Self.dateFormatter.string(from: .now)
        statusText = "Event created"
        statusDetail = "The event was added to Apple Calendar."
        logger.info("Agenda event created")
    }

    private static let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter
    }()

    private static func dateKey(for date: Date) -> String {
        let formatter = DateFormatter()
        formatter.calendar = Calendar.current
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: date)
    }
}

enum AgendaError: LocalizedError {
    case calendarPermissionRequired
    case calendarUnavailable

    var errorDescription: String? {
        switch self {
        case .calendarPermissionRequired:
            return "Calendar permission is required to create events."
        case .calendarUnavailable:
            return "No writable calendar is available on this device."
        }
    }
}
