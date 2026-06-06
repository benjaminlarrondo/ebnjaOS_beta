import Foundation

struct HealthRecoveryInputs {
    let sleepHours: Double?
    let hrvDeltaPercent: Double?
    let restingHeartRateDeltaPercent: Double?
    let workoutCountLast7Days: Int
    let activeCaloriesLast7Days: Double
    let dailySleepHoursByDay: [Date: Double]
    let dailyHrvMsByDay: [Date: Double]
    let dailyRestingHeartRateByDay: [Date: Double]
    let dailyActiveCaloriesByDay: [Date: Double]
    let dailyWorkoutCountsByDay: [Date: Double]
}

@MainActor
final class HealthRecoveryEngine {
    func buildSnapshot(from inputs: HealthRecoveryInputs) -> HealthRecoverySnapshot? {
        guard hasMeaningfulInput(inputs) else { return nil }

        let sleepContribution = scoreSleep(inputs.sleepHours)
        let trainingLoad = calculateTrainingLoad(
            workoutCountLast7Days: inputs.workoutCountLast7Days,
            activeCaloriesLast7Days: inputs.activeCaloriesLast7Days
        )
        let trainingContribution = 100 - trainingLoad
        let hrvContribution = scoreDelta(deltaPercent: inputs.hrvDeltaPercent, goodWhenPositive: true)
        let restingHrContribution = scoreDelta(deltaPercent: inputs.restingHeartRateDeltaPercent, goodWhenPositive: false)

        let score = weightedAverage([
            (sleepContribution, 0.40),
            (trainingContribution, 0.30),
            (hrvContribution, 0.15),
            (restingHrContribution, 0.15)
        ])

        let weeklyTrend = movingAverage(
            inputs.dailySleepHoursByDay.mapValues { scoreSleep($0) },
            hrv: inputs.dailyHrvMsByDay,
            restingHr: inputs.dailyRestingHeartRateByDay,
            activeCalories: inputs.dailyActiveCaloriesByDay,
            workouts: inputs.dailyWorkoutCountsByDay
        )

        let trendDelta = score - weeklyTrend
        let readiness: ReadinessLevel = {
            switch score {
            case 85...100: return .optimal
            case 70..<85: return .good
            case 50..<70: return .moderate
            default: return .fatigued
            }
        }()

        return HealthRecoverySnapshot(
            score: score,
            readiness: readiness,
            trainingLoad: trainingLoad,
            weeklyTrend: weeklyTrend,
            trendDelta: trendDelta,
            sleepContribution: sleepContribution,
            trainingContribution: trainingContribution,
            hrvContribution: hrvContribution,
            restingHrContribution: restingHrContribution
        )
    }

    private func hasMeaningfulInput(_ inputs: HealthRecoveryInputs) -> Bool {
        inputs.sleepHours != nil || inputs.hrvDeltaPercent != nil || inputs.restingHeartRateDeltaPercent != nil || !inputs.dailySleepHoursByDay.isEmpty || !inputs.dailyHrvMsByDay.isEmpty || !inputs.dailyRestingHeartRateByDay.isEmpty || !inputs.dailyActiveCaloriesByDay.isEmpty || !inputs.dailyWorkoutCountsByDay.isEmpty
    }

    private func scoreSleep(_ hours: Double?) -> Double {
        guard let hours else { return 0 }
        return clamp((hours / 8.0) * 100)
    }

    private func calculateTrainingLoad(workoutCountLast7Days: Int, activeCaloriesLast7Days: Double) -> Double {
        let workoutImpact = min(Double(workoutCountLast7Days) * 10.0, 60)
        let caloriesImpact = min(activeCaloriesLast7Days / 45.0, 40)
        return clamp(workoutImpact + caloriesImpact)
    }

    private func scoreDelta(deltaPercent: Double?, goodWhenPositive: Bool) -> Double {
        guard let deltaPercent else { return 50 }
        let adjusted = goodWhenPositive ? 50 + (deltaPercent / 2.0) : 50 - (deltaPercent / 2.0)
        return clamp(adjusted)
    }

    private func weightedAverage(_ values: [(Double, Double)]) -> Double {
        let weighted = values.reduce(0.0) { partial, pair in
            partial + (pair.0 * pair.1)
        }
        let weights = values.reduce(0.0) { $0 + $1.1 }
        guard weights > 0 else { return 0 }
        return clamp(weighted / weights)
    }

    private func movingAverage(
        _ sleepScores: [Date: Double],
        hrv: [Date: Double],
        restingHr: [Date: Double],
        activeCalories: [Date: Double],
        workouts: [Date: Double]
    ) -> Double {
        let days = Set(sleepScores.keys)
            .union(hrv.keys)
            .union(restingHr.keys)
            .union(activeCalories.keys)
            .union(workouts.keys)
            .sorted()

        guard !days.isEmpty else { return 0 }

        let scores: [Double] = days.map { day in
            let sleepScore = sleepScores[day] ?? 0
            let hrvScore = clamp((hrv[day] ?? 0) / 2.0)
            let restingScore = clamp(100 - (restingHr[day] ?? 0))
            let activeScore = clamp(100 - ((activeCalories[day] ?? 0) / 10.0))
            let workoutScore = clamp(100 - ((workouts[day] ?? 0) * 12.0))
            return weightedAverage([
                (sleepScore, 0.40),
                (activeScore, 0.20),
                (hrvScore, 0.20),
                (restingScore, 0.20),
                (workoutScore, 0.00)
            ])
        }

        return weightedAverage(scores.map { ($0, 1.0) })
    }

    private func clamp(_ value: Double) -> Double {
        min(100, max(0, value.rounded()))
    }
}
