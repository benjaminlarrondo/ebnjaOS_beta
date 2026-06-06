import Foundation

extension Date {
    var healthDateString: String {
        Self.healthDateFormatter.string(from: self)
    }

    var healthDateTimeString: String {
        Self.healthDateTimeFormatter.string(from: self)
    }

    private static let healthDateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter
    }()

    private static let healthDateTimeFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter
    }()
}
