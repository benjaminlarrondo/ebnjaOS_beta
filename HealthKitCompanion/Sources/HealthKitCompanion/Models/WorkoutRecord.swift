import Foundation
import HealthKit

struct WorkoutRecord: Identifiable, Hashable, Codable {
    let id: String
    let workoutType: WorkoutType
    let startedAt: Date
    let endedAt: Date
    let duration: TimeInterval
    let energyBurned: Double?
    let source: String
    let externalId: String
    let externalUpdatedAt: Date
}

enum WorkoutType: String, CaseIterable, Hashable, Codable {
    case traditionalStrengthTraining
    case walking
    case running
    case yoga
    case cycling
    case functionalStrengthTraining
    case other

    @available(macOS 13.0, iOS 17.0, *)
    var hkWorkoutActivityType: HKWorkoutActivityType {
        switch self {
        case .traditionalStrengthTraining: return .traditionalStrengthTraining
        case .walking: return .walking
        case .running: return .running
        case .yoga: return .yoga
        case .cycling: return .cycling
        case .functionalStrengthTraining: return .functionalStrengthTraining
        case .other: return .other
        }
    }
}
