import Foundation
import HealthKit

struct HealthMetric: Identifiable, Hashable, Codable {
    let id: String
    let kind: HealthMetricKind
    let recordedAt: Date
    let value: Double
    let unit: String
    let source: String
    let externalId: String
    let externalUpdatedAt: Date

    var displayValue: String {
        "\(value.formatted(.number.precision(.fractionLength(0...2)))) \(unit)"
    }
}

enum HealthMetricKind: String, CaseIterable, Hashable, Codable {
    case bodyMass
    case stepCount
    case sleepAnalysis
    case activeEnergyBurned
    case restingHeartRate
    case heartRateVariabilitySDNN

    var displayName: String {
        switch self {
        case .bodyMass: return "Weight"
        case .stepCount: return "Steps"
        case .sleepAnalysis: return "Sleep"
        case .activeEnergyBurned: return "Active Energy"
        case .restingHeartRate: return "Resting HR"
        case .heartRateVariabilitySDNN: return "HRV"
        }
    }

    var hkQuantityTypeIdentifier: HKQuantityTypeIdentifier? {
        switch self {
        case .bodyMass: return .bodyMass
        case .stepCount: return .stepCount
        case .sleepAnalysis: return nil
        case .activeEnergyBurned: return .activeEnergyBurned
        case .restingHeartRate: return .restingHeartRate
        case .heartRateVariabilitySDNN: return .heartRateVariabilitySDNN
        }
    }

    var hkCategoryTypeIdentifier: HKCategoryTypeIdentifier? {
        switch self {
        case .sleepAnalysis: return .sleepAnalysis
        default: return nil
        }
    }

    var unitSymbol: String {
        switch self {
        case .bodyMass: return "kg"
        case .stepCount: return "steps"
        case .sleepAnalysis: return "h"
        case .activeEnergyBurned: return "kcal"
        case .restingHeartRate: return "bpm"
        case .heartRateVariabilitySDNN: return "ms"
        }
    }
}

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
    case functionalStrengthTraining
    case walking
    case running
    case cycling
    case yoga
    case mobility
    case other

    var displayName: String {
        switch self {
        case .traditionalStrengthTraining: return "Strength"
        case .functionalStrengthTraining: return "Functional Strength"
        case .walking: return "Walking"
        case .running: return "Running"
        case .cycling: return "Cycling"
        case .yoga: return "Yoga"
        case .mobility: return "Mobility"
        case .other: return "Other"
        }
    }

    var supabaseType: String {
        switch self {
        case .traditionalStrengthTraining, .functionalStrengthTraining:
            return "strength"
        case .walking:
            return "walking"
        case .running:
            return "running"
        case .cycling:
            return "cycling"
        case .yoga:
            return "yoga"
        case .mobility:
            return "mobility"
        case .other:
            return "other"
        }
    }

    @available(iOS 17.0, *)
    var hkWorkoutActivityType: HKWorkoutActivityType {
        switch self {
        case .traditionalStrengthTraining: return .traditionalStrengthTraining
        case .functionalStrengthTraining: return .functionalStrengthTraining
        case .walking: return .walking
        case .running: return .running
        case .cycling: return .cycling
        case .yoga: return .yoga
        case .mobility: return .mindAndBody
        case .other: return .other
        }
    }
}

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

struct HealthBaselineValue: Codable, Hashable {
    let currentValue: Double
    let baseline30Days: Double
    let deltaPercent: Double
    let classification: BaselineClassification
}

enum BaselineClassification: String, Codable, CaseIterable, Hashable {
    case elevated
    case normal
    case reduced
    case suppressed
    case excellent
    case aboveTarget
    case onTarget
    case deficit

    var displayName: String {
        switch self {
        case .elevated: return "Elevated"
        case .normal: return "Normal"
        case .reduced: return "Reduced"
        case .suppressed: return "Suppressed"
        case .excellent: return "Excellent"
        case .aboveTarget: return "Above Target"
        case .onTarget: return "On Target"
        case .deficit: return "Deficit"
        }
    }
}

struct HealthBaselineSnapshot: Codable, Hashable {
    let hrv: HealthBaselineValue?
    let restingHeartRate: HealthBaselineValue?
    let sleep: HealthBaselineValue?
}

struct HealthRecoverySnapshot: Codable, Hashable {
    let score: Double
    let readiness: ReadinessLevel
    let trainingLoad: Double
    let weeklyTrend: Double
    let trendDelta: Double
    let sleepContribution: Double
    let trainingContribution: Double
    let hrvContribution: Double
    let restingHrContribution: Double
}

enum ReadinessLevel: String, Codable, CaseIterable, Hashable {
    case optimal
    case good
    case moderate
    case fatigued

    var displayName: String {
        switch self {
        case .optimal: return "Optimal"
        case .good: return "Good"
        case .moderate: return "Moderate"
        case .fatigued: return "Fatigued"
        }
    }
}

enum TrainingRecommendation: String, Codable, CaseIterable, Hashable {
    case trainHard
    case normalTraining
    case recoverySession
    case fullRest

    var displayName: String {
        switch self {
        case .trainHard: return "Train Hard"
        case .normalTraining: return "Normal Training"
        case .recoverySession: return "Recovery Session"
        case .fullRest: return "Full Rest"
        }
    }
}

struct ReadinessAssessment: Codable, Hashable {
    let level: ReadinessLevel
    let recommendation: TrainingRecommendation
    let explanations: [String]
    let riskFactors: [String]
}

struct HealthSyncSnapshot: Codable, Hashable {
    let syncedAt: Date
    let weight: HealthMetric?
    let steps: HealthMetric?
    let sleep: HealthMetric?
    let hrv: HealthMetric?
    let restingHeartRate: HealthMetric?
    let activeEnergy: HealthMetric?
    let workoutsSummary: WorkoutSummary?
    let recentWorkouts: [WorkoutRecord]
    let baseline: HealthBaselineSnapshot?
    let recovery: HealthRecoverySnapshot?
    let readiness: ReadinessAssessment?
}

struct WorkoutSummary: Codable, Hashable {
    let countLast7Days: Int
    let recordedAt: Date
}

struct HealthStateMetrics: Codable, Hashable {
    let weightKg: Double?
    let stepsLast7Days: Double?
    let stepsAverageDaily: Double?
    let sleepHours: Double?
    let hrvMs: Double?
    let restingHr: Double?
    let activeCalories: Double?
    let workoutsLast7Days: Int?
}

struct HealthStateBaselineSummary: Codable, Hashable {
    let hrv: HealthBaselineValue?
    let restingHeartRate: HealthBaselineValue?
    let sleep: HealthBaselineValue?
}

struct HealthStateRecoverySummary: Codable, Hashable {
    let score: Double
    let readiness: String
    let trainingLoad: Double
    let weeklyTrend: Double
    let trendDelta: Double
}

struct HealthStateReadinessSummary: Codable, Hashable {
    let level: String
    let recommendation: String
    let explanations: [String]
    let riskFactors: [String]
}

struct HealthStateSnapshot: Codable, Hashable {
    let source: String
    let sourceFingerprint: String
    let syncedAt: Date
    let metrics: HealthStateMetrics
    let baselines: HealthStateBaselineSummary?
    let recovery: HealthStateRecoverySummary?
    let readiness: HealthStateReadinessSummary?
}

struct HealthStatePayload: Codable, Hashable {
    let id: String
    let userId: UUID
    let state: HealthStateSnapshot
    let updatedAt: Date
}

struct HealthBodyMetricPayload: Codable, Hashable {
    let id: UUID
    let userId: UUID
    let date: String
    let bodyWeight: Double?
    let bodyFat: Double?
    let sleepHours: Double?
    let energyLevel: Int?
    let stepsCount: Int
    let hrvMs: Double?
    let restingHr: Int?
    let source: String
    let externalId: String
    let externalUpdatedAt: Date
    let metadata: [String: String]
}

struct HealthWorkoutPayload: Codable, Hashable {
    let id: UUID
    let userId: UUID
    let title: String
    let date: String
    let type: String
    let durationMinutes: Int
    let intensity: Int
    let notes: String
    let source: String
    let externalId: String
    let externalUpdatedAt: Date
    let metadata: [String: String]
}

struct HealthSyncPayload: Hashable {
    let healthState: HealthStatePayload
    let bodyMetrics: [HealthBodyMetricPayload]
    let workouts: [HealthWorkoutPayload]
}

struct HealthSyncReport: Hashable {
    let syncedAt: Date
    let bodyMetricsCount: Int
    let workoutsCount: Int
    let healthStateWritten: Bool
    let responseSummary: String
}

enum SyncStatus: String, CaseIterable, Hashable {
    case neverSynced = "Never Synced"
    case syncing = "Syncing"
    case success = "Success"
    case error = "Error"

    var displayName: String { rawValue }
}
