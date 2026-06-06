import Foundation
import HealthKit

struct HealthKitRawPayload {
    let quantitySamples: [HKQuantitySample]
    let sleepSamples: [HKCategorySample]
    let workouts: [HKWorkout]
}

@MainActor
final class HealthKitQueries {
    private let healthStore: HKHealthStore

    init(healthStore: HKHealthStore = HKHealthStore()) {
        self.healthStore = healthStore
    }

    static func defaultReadTypes() -> Set<HKObjectType> {
        HealthKitTypes.readTypes()
    }

    func fetchHistoricalPayload(days: Int) async throws -> HealthKitRawPayload {
        guard let windowStart = Calendar.current.date(byAdding: .day, value: -days, to: .now) else {
            throw HealthKitQueryError.invalidDateWindow
        }

        async let quantitySamples = fetchQuantitySamples(windowStart: windowStart)
        async let sleepSamples = fetchSleepSamples(windowStart: windowStart)
        async let workouts = fetchWorkouts(windowStart: windowStart)

        return try await HealthKitRawPayload(
            quantitySamples: quantitySamples,
            sleepSamples: sleepSamples,
            workouts: workouts
        )
    }

    private func fetchQuantitySamples(windowStart: Date) async throws -> [HKQuantitySample] {
        let identifiers: [HKQuantityTypeIdentifier] = [
            .bodyMass,
            .stepCount,
            .activeEnergyBurned,
            .restingHeartRate,
            .heartRateVariabilitySDNN
        ]

        var collected: [HKQuantitySample] = []
        for identifier in identifiers {
            guard let type = HKObjectType.quantityType(forIdentifier: identifier) else { continue }
            let samples = try await healthStore.fetchAnchoredQuantitySamples(type: type, windowStart: windowStart)
            collected.append(contentsOf: samples)
        }
        return collected.sorted { $0.startDate > $1.startDate }
    }

    private func fetchSleepSamples(windowStart: Date) async throws -> [HKCategorySample] {
        guard let type = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else { return [] }
        let samples = try await healthStore.fetchAnchoredCategorySamples(type: type, windowStart: windowStart)
        return samples.sorted { $0.startDate > $1.startDate }
    }

    private func fetchWorkouts(windowStart: Date) async throws -> [HKWorkout] {
        let samples = try await healthStore.fetchAnchoredWorkoutSamples(windowStart: windowStart)
        return samples.sorted { $0.startDate > $1.startDate }
    }
}

enum HealthKitQueryError: Error {
    case invalidDateWindow
}

private extension HKHealthStore {
    func fetchAnchoredQuantitySamples(type: HKQuantityType, windowStart: Date) async throws -> [HKQuantitySample] {
        try await withCheckedThrowingContinuation { continuation in
            let predicate = HKQuery.predicateForSamples(withStart: windowStart, end: .now)
            let query = HKAnchoredObjectQuery(
                type: type,
                predicate: predicate,
                anchor: nil,
                limit: HKObjectQueryNoLimit
            ) { _, samples, _, _, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }

                let quantitySamples = (samples as? [HKQuantitySample]) ?? []
                continuation.resume(returning: quantitySamples)
            }

            execute(query)
        }
    }

    func fetchAnchoredCategorySamples(type: HKCategoryType, windowStart: Date) async throws -> [HKCategorySample] {
        try await withCheckedThrowingContinuation { continuation in
            let predicate = HKQuery.predicateForSamples(withStart: windowStart, end: .now)
            let query = HKAnchoredObjectQuery(
                type: type,
                predicate: predicate,
                anchor: nil,
                limit: HKObjectQueryNoLimit
            ) { _, samples, _, _, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }

                let categorySamples = (samples as? [HKCategorySample]) ?? []
                continuation.resume(returning: categorySamples)
            }

            execute(query)
        }
    }

    func fetchAnchoredWorkoutSamples(windowStart: Date) async throws -> [HKWorkout] {
        let workoutType = HKObjectType.workoutType()
        return try await withCheckedThrowingContinuation { continuation in
            let predicate = HKQuery.predicateForSamples(withStart: windowStart, end: .now)
            let query = HKAnchoredObjectQuery(
                type: workoutType,
                predicate: predicate,
                anchor: nil,
                limit: HKObjectQueryNoLimit
            ) { _, samples, _, _, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }

                let workoutSamples = (samples as? [HKWorkout]) ?? []
                continuation.resume(returning: workoutSamples)
            }

            execute(query)
        }
    }
}
