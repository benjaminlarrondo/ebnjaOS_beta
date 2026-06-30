import Foundation

@MainActor
final class TeteScheduleProvider: ObservableObject {
    private let service: CelesteCalendarService

    init(service: CelesteCalendarService = CelesteCalendarService()) {
        self.service = service
    }

    var sourceLabel: String { service.sourceLabel }
    var loadStatusText: String { service.loadStatusText }
    var loadStatusMessage: String { service.loadStatusMessage }

    func todayStatusText(for date: Date = .now) -> String {
        service.status(for: date).owner == .mine ? "Hoy con Tete" : "Hoy sin Tete"
    }

    func upcomingDays(days: Int = 5, from date: Date = .now) -> [TeteDayStatus] {
        service.upcoming(days: days, from: date).map { day in
            TeteDayStatus(
                id: day.id,
                date: day.date,
                label: day.owner == .mine ? "Tete" : "Libre",
                isTete: day.owner == .mine,
                note: day.note
            )
        }
    }

    func nextChangeText(for date: Date = .now) -> String {
        guard let change = service.nextChange(after: date) else {
            return "Sin próximo cambio dentro de 5 días"
        }

        let weekday = DateFormatter.localizedString(from: change.date, dateStyle: .medium, timeStyle: .none)
        return "\(change.message) · \(weekday)"
    }

    func nextActivityText(for date: Date = .now) -> String {
        let summary = service.summary()
        return summary.nextChange?.owner == .mine ? "Próximo bloque con Tete" : "Próxima actividad sin Tete"
    }

    func weekSummaryText(for date: Date = .now) -> String {
        let upcoming = service.upcoming(days: 5, from: date)
        let teteDays = upcoming.filter { $0.owner == .mine }.count
        return "\(teteDays) de \(upcoming.count) días con Tete"
    }
}
