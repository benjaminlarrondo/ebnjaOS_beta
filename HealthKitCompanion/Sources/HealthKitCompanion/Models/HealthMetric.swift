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
        formattedValue
    }

    var formattedValue: String {
        "\(value.formatted(.number.precision(.fractionLength(0...2)))) \(unit)"
    }
}

enum HealthMetricKind: String, CaseIterable, Hashable, Codable {
    case bodyMass
    case stepCount
    case heartRate
    case restingHeartRate
    case heartRateVariabilitySDNN
    case sleepAnalysis

    var displayName: String {
        switch self {
        case .bodyMass: return "Body Mass"
        case .stepCount: return "Step Count"
        case .heartRate: return "Heart Rate"
        case .restingHeartRate: return "Resting HR"
        case .heartRateVariabilitySDNN: return "HRV"
        case .sleepAnalysis: return "Sleep"
        }
    }

    var hkQuantityTypeIdentifier: HKQuantityTypeIdentifier? {
        switch self {
        case .bodyMass: return .bodyMass
        case .stepCount: return .stepCount
        case .heartRate: return .heartRate
        case .restingHeartRate: return .restingHeartRate
        case .heartRateVariabilitySDNN: return .heartRateVariabilitySDNN
        case .sleepAnalysis: return nil
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
        case .heartRate, .restingHeartRate: return "bpm"
        case .heartRateVariabilitySDNN: return "ms"
        case .sleepAnalysis: return "hr"
        }
    }
}
