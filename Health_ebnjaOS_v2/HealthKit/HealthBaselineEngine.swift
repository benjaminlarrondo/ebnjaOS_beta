import Foundation

struct HealthBaselineInputs {
    let currentHrvMs: Double?
    let currentRestingHeartRate: Double?
    let currentSleepHours: Double?
    let historicalHrvMs: [Double]
    let historicalRestingHeartRate: [Double]
    let historicalSleepHours: [Double]
}

@MainActor
final class HealthBaselineEngine {
    func buildSnapshot(from inputs: HealthBaselineInputs) -> HealthBaselineSnapshot? {
        let hrv = makeBaseline(
            current: inputs.currentHrvMs,
            history: inputs.historicalHrvMs,
            classifier: classifyHrv
        )
        let restingHeartRate = makeBaseline(
            current: inputs.currentRestingHeartRate,
            history: inputs.historicalRestingHeartRate,
            classifier: classifyRestingHeartRate
        )
        let sleep = makeBaseline(
            current: inputs.currentSleepHours,
            history: inputs.historicalSleepHours,
            classifier: classifySleep
        )

        guard hrv != nil || restingHeartRate != nil || sleep != nil else { return nil }
        return HealthBaselineSnapshot(hrv: hrv, restingHeartRate: restingHeartRate, sleep: sleep)
    }

    private func makeBaseline(
        current: Double?,
        history: [Double],
        classifier: (_ current: Double, _ baseline: Double) -> BaselineClassification
    ) -> HealthBaselineValue? {
        guard let current, !history.isEmpty else { return nil }
        let baseline = history.reduce(0, +) / Double(history.count)
        guard baseline > 0 else { return nil }
        let deltaPercent = ((current - baseline) / baseline) * 100
        let classification = classifier(current, baseline)
        return HealthBaselineValue(
            currentValue: current,
            baseline30Days: baseline,
            deltaPercent: deltaPercent,
            classification: classification
        )
    }

    private func classifyHrv(current: Double, baseline: Double) -> BaselineClassification {
        if current >= baseline * 1.10 { return .elevated }
        if current >= baseline * 0.90 { return .normal }
        if current >= baseline * 0.75 { return .reduced }
        return .suppressed
    }

    private func classifyRestingHeartRate(current: Double, baseline: Double) -> BaselineClassification {
        if current <= baseline * 0.90 { return .excellent }
        if current <= baseline * 1.05 { return .normal }
        return .elevated
    }

    private func classifySleep(current: Double, baseline: Double) -> BaselineClassification {
        if current >= baseline * 1.05 { return .aboveTarget }
        if current >= baseline * 0.95 { return .onTarget }
        return .deficit
    }
}
