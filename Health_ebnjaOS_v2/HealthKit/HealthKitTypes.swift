import Foundation
import HealthKit

struct HealthKitPermissionDescriptor: Identifiable, Hashable {
    let id = UUID()
    let identifier: String
    let title: String
    let detail: String
}

enum HealthKitTypes {
    static func readTypes() -> Set<HKObjectType> {
        let quantityIdentifiers: [HKQuantityTypeIdentifier] = [
            .bodyMass,
            .stepCount,
            .activeEnergyBurned,
            .restingHeartRate,
            .heartRateVariabilitySDNN
        ]

        let quantityTypes = quantityIdentifiers.compactMap { HKObjectType.quantityType(forIdentifier: $0) }
        let sleepType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis)
        let workoutType = HKObjectType.workoutType()

        var types: [HKObjectType] = quantityTypes
        if let sleepType {
            types.append(sleepType)
        }
        types.append(workoutType)
        return Set(types)
    }

    static var displayPermissions: [HealthKitPermissionDescriptor] {
        [
            .init(identifier: "bodyMass", title: "Weight", detail: "Read the latest recorded weight."),
            .init(identifier: "stepCount", title: "Steps", detail: "Read daily activity totals."),
            .init(identifier: "sleepAnalysis", title: "Sleep", detail: "Read sleep duration and recent nights."),
            .init(identifier: "activeEnergyBurned", title: "Active Energy", detail: "Read training load and calorie output."),
            .init(identifier: "restingHeartRate", title: "Resting HR", detail: "Read resting heart rate trends."),
            .init(identifier: "heartRateVariabilitySDNN", title: "HRV", detail: "Read heart rate variability trends."),
            .init(identifier: "workoutType", title: "Workouts", detail: "Read workout history for recovery and readiness.")
        ]
    }
}
