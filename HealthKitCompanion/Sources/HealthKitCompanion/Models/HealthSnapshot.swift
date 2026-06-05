import Foundation

struct HealthSnapshot: Identifiable, Codable, Hashable {
    let id: String
    let schemaVersion: Int
    let capturedAt: Date
    let windowStart: Date
    let windowEnd: Date
    let source: String
    let metrics: [HealthMetric]
    let workouts: [WorkoutRecord]

    var metricsCount: Int { metrics.count }
    var workoutsCount: Int { workouts.count }
}
