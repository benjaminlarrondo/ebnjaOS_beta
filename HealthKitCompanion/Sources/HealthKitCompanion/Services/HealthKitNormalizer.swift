import Foundation
import HealthKit

final class HealthKitNormalizer {
    func normalize(
        quantitySamples: [HKQuantitySample],
        sleepSamples: [HKCategorySample],
        workouts: [HKWorkout],
        windowStart: Date,
        windowEnd: Date
    ) -> HealthSnapshot {
        let metrics = quantitySamples.compactMap(normalizeQuantitySample)
        let sleepMetrics = sleepSamples.compactMap(normalizeSleepSample)
        let normalizedWorkouts = workouts.compactMap(normalizeWorkout)

        let allMetrics = (metrics + sleepMetrics).sorted { $0.recordedAt > $1.recordedAt }
        let sortedWorkouts = normalizedWorkouts.sorted { $0.startedAt > $1.startedAt }

        return HealthSnapshot(
            id: UUID().uuidString,
            schemaVersion: 1,
            capturedAt: .now,
            windowStart: windowStart,
            windowEnd: windowEnd,
            source: "apple_health_companion",
            metrics: allMetrics,
            workouts: sortedWorkouts
        )
    }

    func normalizeQuantitySample(_ sample: HKQuantitySample) -> HealthMetric? {
        guard let kind = HealthMetricKind(quantitySample: sample) else { return nil }
        let unit = preferredUnit(for: kind)
        let value = sample.quantity.doubleValue(for: unit)

        return HealthMetric(
            id: sample.uuid.uuidString,
            kind: kind,
            recordedAt: sample.startDate,
            value: value,
            unit: kind.unitSymbol,
            source: "healthkit",
            externalId: sample.uuid.uuidString,
            externalUpdatedAt: sample.endDate
        )
    }

    func normalizeSleepSample(_ sample: HKCategorySample) -> HealthMetric? {
        let kind = HealthMetricKind.sleepAnalysis
        let durationHours = sample.endDate.timeIntervalSince(sample.startDate) / 3600

        return HealthMetric(
            id: sample.uuid.uuidString,
            kind: kind,
            recordedAt: sample.startDate,
            value: durationHours,
            unit: kind.unitSymbol,
            source: "healthkit",
            externalId: sample.uuid.uuidString,
            externalUpdatedAt: sample.endDate
        )
    }

    func normalizeWorkout(_ workout: HKWorkout) -> WorkoutRecord? {
        let workoutType = WorkoutType(hkWorkoutActivityType: workout.workoutActivityType)
        return WorkoutRecord(
            id: workout.uuid.uuidString,
            workoutType: workoutType,
            startedAt: workout.startDate,
            endedAt: workout.endDate,
            duration: workout.duration,
            energyBurned: workout.totalEnergyBurned?.doubleValue(for: .kilocalorie()),
            source: "healthkit",
            externalId: workout.uuid.uuidString,
            externalUpdatedAt: workout.endDate
        )
    }

    private func preferredUnit(for kind: HealthMetricKind) -> HKUnit {
        switch kind {
        case .bodyMass: return .gramUnit(with: .kilo)
        case .stepCount: return .count()
        case .heartRate, .restingHeartRate: return HKUnit.count().unitDivided(by: .minute())
        case .heartRateVariabilitySDNN: return .secondUnit(with: .milli)
        case .sleepAnalysis: return .hour()
        }
    }
}

private extension HealthMetricKind {
    init?(quantitySample: HKQuantitySample) {
        switch quantitySample.quantityType.identifier {
        case HKQuantityTypeIdentifier.bodyMass.rawValue: self = .bodyMass
        case HKQuantityTypeIdentifier.stepCount.rawValue: self = .stepCount
        case HKQuantityTypeIdentifier.heartRate.rawValue: self = .heartRate
        case HKQuantityTypeIdentifier.restingHeartRate.rawValue: self = .restingHeartRate
        case HKQuantityTypeIdentifier.heartRateVariabilitySDNN.rawValue: self = .heartRateVariabilitySDNN
        default: return nil
        }
    }
}

private extension WorkoutType {
    init(hkWorkoutActivityType: HKWorkoutActivityType) {
        switch hkWorkoutActivityType {
        case .traditionalStrengthTraining: self = .traditionalStrengthTraining
        case .walking: self = .walking
        case .running: self = .running
        case .yoga: self = .yoga
        case .cycling: self = .cycling
        case .functionalStrengthTraining: self = .functionalStrengthTraining
        default: self = .other
        }
    }
}
