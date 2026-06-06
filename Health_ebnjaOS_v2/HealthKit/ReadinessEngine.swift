import Foundation

@MainActor
final class ReadinessEngine {
    func assess(
        recoveryScore: Double,
        sleepHours: Double?,
        hrvMs: Double?,
        restingHeartRate: Double?,
        trainingLoad: Double
    ) -> ReadinessAssessment {
        let level: ReadinessLevel
        let recommendation: TrainingRecommendation

        switch recoveryScore {
        case 85...100:
            level = .optimal
            recommendation = .trainHard
        case 70..<85:
            level = .good
            recommendation = .normalTraining
        case 50..<70:
            level = .moderate
            recommendation = .recoverySession
        default:
            level = .fatigued
            recommendation = .fullRest
        }

        var explanations: [String] = [
            "Recovery score is \(recoveryScore.formatted(.number.precision(.fractionLength(0...0))))/100."
        ]

        if let sleepHours, sleepHours < 7 {
            explanations.append("Sleep is below the 7 hour target.")
        } else if let sleepHours, sleepHours >= 8 {
            explanations.append("Sleep is at or above target.")
        }

        if let hrvMs, hrvMs < 55 {
            explanations.append("HRV is below the preferred range.")
        } else if let hrvMs, hrvMs >= 70 {
            explanations.append("HRV is in a strong range.")
        }

        if let restingHeartRate, restingHeartRate > 60 {
            explanations.append("Resting HR is above the preferred range.")
        } else if let restingHeartRate, restingHeartRate <= 55 {
            explanations.append("Resting HR is favorable.")
        }

        if trainingLoad > 70 {
            explanations.append("Training load is high, so recovery matters today.")
        } else if trainingLoad < 35 {
            explanations.append("Training load has room to increase.")
        }

        var riskFactors: [String] = []
        if let sleepHours, sleepHours < 7 { riskFactors.append("Low sleep") }
        if let hrvMs, hrvMs < 55 { riskFactors.append("Low HRV") }
        if let restingHeartRate, restingHeartRate > 60 { riskFactors.append("Elevated resting HR") }
        if trainingLoad > 75 { riskFactors.append("High training load") }

        return ReadinessAssessment(
            level: level,
            recommendation: recommendation,
            explanations: explanations,
            riskFactors: riskFactors
        )
    }
}
