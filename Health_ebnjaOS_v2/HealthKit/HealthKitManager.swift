import Foundation
import Combine
import HealthKit
import OSLog

@MainActor
final class HealthKitManager: ObservableObject {
    enum LoadState: String {
        case idle
        case loading
        case ready
        case noData
        case failed
    }

    @Published private(set) var loadState: LoadState = .idle
    @Published private(set) var statusDetail: String = "Ready to load Apple Health data."
    @Published private(set) var errorMessage: String?
    @Published private(set) var snapshot: HealthSnapshot?
    @Published private(set) var baselineSnapshot: HealthBaselineSnapshot?
    @Published private(set) var recoverySnapshot: HealthRecoverySnapshot?
    @Published private(set) var readinessAssessment: ReadinessAssessment?
    @Published private(set) var latestSyncSnapshot: HealthSyncSnapshot?
    @Published private(set) var authorizationStatusText: String = "Pending"
    @Published private(set) var latestUpdatedText: String = "Never"

    @Published private(set) var latestWeightText: String = "—"
    @Published private(set) var latestWeightDateText: String = "No Data"
    @Published private(set) var latestSleepText: String = "—"
    @Published private(set) var latestSleepDateText: String = "No Data"
    @Published private(set) var last7DaysStepsText: String = "—"
    @Published private(set) var last7DaysStepsAverageText: String = "—"
    @Published private(set) var last7DaysStepsDateText: String = "No Data"
    @Published private(set) var latestHrvText: String = "—"
    @Published private(set) var latestHrvDateText: String = "No Data"
    @Published private(set) var latestRestingHrText: String = "—"
    @Published private(set) var latestRestingHrDateText: String = "No Data"
    @Published private(set) var latestActiveEnergyText: String = "—"
    @Published private(set) var latestActiveEnergyDateText: String = "No Data"
    @Published private(set) var workoutsLast7DaysText: String = "—"
    @Published private(set) var workoutsLast7DaysDateText: String = "No Data"

    @Published private(set) var recoveryScoreText: String = "—"
    @Published private(set) var recoveryReadinessText: String = "Pending"
    @Published private(set) var trainingLoadText: String = "—"
    @Published private(set) var weeklyRecoveryTrendText: String = "—"
    @Published private(set) var recoveryTrendDeltaText: String = "—"

    @Published private(set) var todayReadinessText: String = "Pending"
    @Published private(set) var todayRecommendationText: String = "Pending"
    @Published private(set) var todayRecoveryScoreText: String = "—"
    @Published private(set) var readinessWhy: [String] = []
    @Published private(set) var readinessRiskFactors: [String] = []

    private let logger = Logger(subsystem: "Health_ebnjaOS_v2", category: "HealthKit")
    private let healthStore: HKHealthStore
    private let queries: HealthKitQueries
    private let normalizer = HealthKitNormalizer()
    private let baselineEngine = HealthBaselineEngine()
    private let recoveryEngine = HealthRecoveryEngine()
    private let readinessEngine = ReadinessEngine()
    private let snapshotService = HealthSnapshotService()

    init(healthStore: HKHealthStore = HKHealthStore()) {
        self.healthStore = healthStore
        self.queries = HealthKitQueries(healthStore: healthStore)
        refreshAuthorizationState()

        if let cachedSnapshot = snapshotService.loadCachedSnapshot() {
            latestSyncSnapshot = cachedSnapshot
            baselineSnapshot = cachedSnapshot.baseline
            recoverySnapshot = cachedSnapshot.recovery
            readinessAssessment = cachedSnapshot.readiness
            updateDisplayTexts(from: cachedSnapshot)
            latestUpdatedText = cachedSnapshot.syncedAt.formatted(date: .abbreviated, time: .shortened)
        }
    }

    var hasData: Bool {
        if let snapshot {
            return snapshot.metricsCount > 0 || snapshot.workoutsCount > 0
        }

        guard let latestSyncSnapshot else { return false }
        return latestSyncSnapshot.weight != nil
            || latestSyncSnapshot.steps != nil
            || latestSyncSnapshot.sleep != nil
            || latestSyncSnapshot.hrv != nil
            || latestSyncSnapshot.restingHeartRate != nil
            || latestSyncSnapshot.activeEnergy != nil
            || latestSyncSnapshot.workoutsSummary != nil
    }

    func refreshAuthorizationState(from state: HealthKitPermissions.AuthorizationState? = nil, detail: String? = nil) {
        if let state {
            authorizationStatusText = state.displayName
            statusDetail = detail ?? statusDetail
            return
        }

        guard HKHealthStore.isHealthDataAvailable() else {
            authorizationStatusText = HealthKitPermissions.AuthorizationState.denied.displayName
            statusDetail = "Health data is unavailable on this device."
            return
        }

        let statuses = HealthKitTypes.readTypes().compactMap { objectType -> HKAuthorizationStatus? in
            if let quantityType = objectType as? HKQuantityType {
                return healthStore.authorizationStatus(for: quantityType)
            }
            if let categoryType = objectType as? HKCategoryType {
                return healthStore.authorizationStatus(for: categoryType)
            }
            if let workoutType = objectType as? HKWorkoutType {
                return healthStore.authorizationStatus(for: workoutType)
            }
            return nil
        }

        if statuses.contains(.sharingDenied) {
            authorizationStatusText = HealthKitPermissions.AuthorizationState.denied.displayName
            statusDetail = "At least one requested HealthKit type was denied."
        } else if statuses.contains(.notDetermined) {
            authorizationStatusText = HealthKitPermissions.AuthorizationState.pending.displayName
            statusDetail = "Waiting for the user to authorize Apple Health access."
        } else {
            authorizationStatusText = HealthKitPermissions.AuthorizationState.authorized.displayName
            statusDetail = "Apple Health access is authorized."
        }
    }

    func loadLatestDataIfAuthorized(days: Int = 30) async {
        refreshAuthorizationState()
        guard authorizationStatusText == HealthKitPermissions.AuthorizationState.authorized.displayName else {
            loadState = .idle
            errorMessage = nil
            statusDetail = "Apple Health authorization is required before loading data."
            return
        }

        await loadLatestData(days: days)
    }

    func loadLatestData(days: Int = 30) async {
        guard HKHealthStore.isHealthDataAvailable() else {
            loadState = .failed
            errorMessage = "Health data is unavailable on this device."
            statusDetail = errorMessage ?? statusDetail
            return
        }

        loadState = .loading
        errorMessage = nil
        logger.info("HealthKit load started")

        do {
            let rawPayload = try await queries.fetchHistoricalPayload(days: days)
            let windowStart = Calendar.current.date(byAdding: .day, value: -days, to: .now) ?? .now
            let snapshot = normalizer.normalize(
                quantitySamples: rawPayload.quantitySamples,
                sleepSamples: rawPayload.sleepSamples,
                workouts: rawPayload.workouts,
                windowStart: windowStart,
                windowEnd: .now
            )

            let weight = latestMetric(in: snapshot, kind: .bodyMass)
            let stepValues = values(from: rawPayload.quantitySamples, identifier: .stepCount)
            let stepTotal = stepValues.reduce(0, +)
            let stepLatestDate = rawPayload.quantitySamples
                .filter { $0.quantityType.identifier == HKQuantityTypeIdentifier.stepCount.rawValue }
                .map(\.endDate)
                .max() ?? .now
            let steps = HealthMetric(
                id: "steps-summary-\(days)",
                kind: .stepCount,
                recordedAt: stepLatestDate,
                value: stepTotal,
                unit: HealthMetricKind.stepCount.unitSymbol,
                source: "healthkit",
                externalId: "steps-summary-\(days)",
                externalUpdatedAt: stepLatestDate
            )
            let sleep = latestMetric(in: snapshot, kind: .sleepAnalysis)
            let hrv = latestMetric(in: snapshot, kind: .heartRateVariabilitySDNN)
            let restingHr = latestMetric(in: snapshot, kind: .restingHeartRate)
            let activeEnergyValues = values(from: rawPayload.quantitySamples, identifier: .activeEnergyBurned)
            let activeEnergyTotal = activeEnergyValues.reduce(0, +)
            let activeEnergyLatestDate = rawPayload.quantitySamples
                .filter { $0.quantityType.identifier == HKQuantityTypeIdentifier.activeEnergyBurned.rawValue }
                .map(\.endDate)
                .max() ?? .now
            let activeEnergy = HealthMetric(
                id: "active-energy-summary-\(days)",
                kind: .activeEnergyBurned,
                recordedAt: activeEnergyLatestDate,
                value: activeEnergyTotal,
                unit: HealthMetricKind.activeEnergyBurned.unitSymbol,
                source: "healthkit",
                externalId: "active-energy-summary-\(days)",
                externalUpdatedAt: activeEnergyLatestDate
            )
            let workouts = WorkoutSummary(countLast7Days: snapshot.workouts.count, recordedAt: snapshot.workouts.first?.startedAt ?? .now)

            let hrvHistory = values(from: rawPayload.quantitySamples, identifier: .heartRateVariabilitySDNN)
            let restingHrHistory = values(from: rawPayload.quantitySamples, identifier: .restingHeartRate)
            let sleepHistory = dailySleepHours(from: rawPayload.sleepSamples)
            let hrvDaily = dailyQuantityAverages(from: rawPayload.quantitySamples, identifier: .heartRateVariabilitySDNN, unit: .secondUnit(with: .milli))
            let restingDaily = dailyQuantityAverages(from: rawPayload.quantitySamples, identifier: .restingHeartRate, unit: HKUnit.count().unitDivided(by: .minute()))
            let activeCaloriesDaily = dailyQuantitySums(from: rawPayload.quantitySamples, identifier: .activeEnergyBurned, unit: .kilocalorie())
            let workoutCountsDaily = dailyWorkoutCounts(from: rawPayload.workouts)

            let baseline = baselineEngine.buildSnapshot(
                from: HealthBaselineInputs(
                    currentHrvMs: hrv?.value,
                    currentRestingHeartRate: restingHr?.value,
                    currentSleepHours: sleep?.value,
                    historicalHrvMs: hrvHistory,
                    historicalRestingHeartRate: restingHrHistory,
                    historicalSleepHours: sleepHistory
                )
            )
            baselineSnapshot = baseline

            let recovery = recoveryEngine.buildSnapshot(
                from: HealthRecoveryInputs(
                    sleepHours: sleep?.value,
                    hrvDeltaPercent: baseline?.hrv?.deltaPercent,
                    restingHeartRateDeltaPercent: baseline?.restingHeartRate?.deltaPercent,
                    workoutCountLast7Days: snapshot.workouts.count,
                    activeCaloriesLast7Days: activeEnergy.value,
                    dailySleepHoursByDay: sleepHistoryByDay(from: rawPayload.sleepSamples),
                    dailyHrvMsByDay: hrvDaily,
                    dailyRestingHeartRateByDay: restingDaily,
                    dailyActiveCaloriesByDay: activeCaloriesDaily,
                    dailyWorkoutCountsByDay: workoutCountsDaily
                )
            )
            recoverySnapshot = recovery

            let readiness = readinessEngine.assess(
                recoveryScore: recovery?.score ?? 0,
                sleepHours: sleep?.value,
                hrvMs: hrv?.value,
                restingHeartRate: restingHr?.value,
                trainingLoad: recovery?.trainingLoad ?? 0
            )
            readinessAssessment = readiness

            latestSyncSnapshot = HealthSyncSnapshot(
                syncedAt: .now,
                weight: weight,
                steps: steps,
                sleep: sleep,
                hrv: hrv,
                restingHeartRate: restingHr,
                activeEnergy: activeEnergy,
                workoutsSummary: workouts,
                recentWorkouts: snapshot.workouts,
                baseline: baseline,
                recovery: recovery,
                readiness: readiness
            )

            _ = generateSnapshot()

            self.snapshot = snapshot
            updateDisplayTexts(from: latestSyncSnapshot)

            latestUpdatedText = snapshot.capturedAt.formatted(date: .abbreviated, time: .shortened)
            if snapshot.metrics.isEmpty && snapshot.workouts.isEmpty {
                loadState = .noData
                statusDetail = "No HealthKit samples found in the selected ranges."
                logger.info("HealthKit load completed with no data")
            } else {
                loadState = .ready
                statusDetail = "Latest Apple Health values loaded."
                logger.info("HealthKit load completed successfully")
            }
            logger.info("Metrics loaded")
        } catch {
            loadState = .failed
            errorMessage = error.localizedDescription
            statusDetail = error.localizedDescription
            logger.error("HealthKit load failed: \(error.localizedDescription, privacy: .public)")
        }
    }

    func generateSnapshot() -> HealthSyncSnapshot? {
        guard let latestSyncSnapshot else { return nil }
        let generated = snapshotService.generateSnapshot(from: latestSyncSnapshot)
        self.latestSyncSnapshot = generated
        return generated
    }

    private func latestMetric(in snapshot: HealthSnapshot, kind: HealthMetricKind) -> HealthMetric? {
        snapshot.metrics.first { $0.kind == kind }
    }

    private func updateDisplayTexts(from syncSnapshot: HealthSyncSnapshot?) {
        guard let syncSnapshot else { return }

        let weight = syncSnapshot.weight
        let steps = syncSnapshot.steps
        let sleep = syncSnapshot.sleep
        let hrv = syncSnapshot.hrv
        let restingHr = syncSnapshot.restingHeartRate
        let activeEnergy = syncSnapshot.activeEnergy
        let workouts = syncSnapshot.workoutsSummary
        let recovery = syncSnapshot.recovery
        let readiness = syncSnapshot.readiness

        latestWeightText = weight.map { Self.weightFormatter.string(from: NSNumber(value: $0.value)) ?? "—" } ?? "—"
        latestWeightDateText = weight.map { Self.dateFormatter.string(from: $0.recordedAt) } ?? "No Data"

        latestSleepText = sleep.map { Self.oneDecimalFormatter.string(from: NSNumber(value: $0.value)) ?? "—" } ?? "—"
        latestSleepDateText = sleep.map { Self.dateFormatter.string(from: $0.recordedAt) } ?? "No Data"

        last7DaysStepsText = steps.map { Self.integerFormatter.string(from: NSNumber(value: $0.value)) ?? "—" } ?? "—"
        last7DaysStepsAverageText = steps.map { Self.integerFormatter.string(from: NSNumber(value: $0.value / 7.0)) ?? "—" } ?? "—"
        last7DaysStepsDateText = steps.map { Self.dateFormatter.string(from: $0.recordedAt) } ?? "No Data"

        latestHrvText = hrv.map { Self.oneDecimalFormatter.string(from: NSNumber(value: $0.value)) ?? "—" } ?? "—"
        latestHrvDateText = hrv.map { Self.dateFormatter.string(from: $0.recordedAt) } ?? "No Data"

        latestRestingHrText = restingHr.map { Self.integerFormatter.string(from: NSNumber(value: $0.value)) ?? "—" } ?? "—"
        latestRestingHrDateText = restingHr.map { Self.dateFormatter.string(from: $0.recordedAt) } ?? "No Data"

        latestActiveEnergyText = activeEnergy.map { Self.integerFormatter.string(from: NSNumber(value: $0.value)) ?? "—" } ?? "—"
        latestActiveEnergyDateText = activeEnergy.map { Self.dateFormatter.string(from: $0.recordedAt) } ?? "No Data"

        workoutsLast7DaysText = workouts.map { Self.integerFormatter.string(from: NSNumber(value: $0.countLast7Days)) ?? "—" } ?? "—"
        workoutsLast7DaysDateText = workouts.map { Self.dateFormatter.string(from: $0.recordedAt) } ?? "No Data"

        recoveryScoreText = recovery.map { Self.integerFormatter.string(from: NSNumber(value: $0.score)) ?? "—" } ?? "—"
        recoveryReadinessText = recovery.map { $0.readiness.displayName } ?? "Pending"
        trainingLoadText = recovery.map { Self.integerFormatter.string(from: NSNumber(value: $0.trainingLoad)) ?? "—" } ?? "—"
        weeklyRecoveryTrendText = recovery.map { Self.integerFormatter.string(from: NSNumber(value: $0.weeklyTrend)) ?? "—" } ?? "—"
        recoveryTrendDeltaText = recovery.map { Self.signedIntegerFormatter.string(from: NSNumber(value: $0.trendDelta)) ?? "—" } ?? "—"

        todayReadinessText = readiness.map { $0.level.displayName } ?? "Pending"
        todayRecommendationText = readiness.map { $0.recommendation.displayName } ?? "Pending"
        todayRecoveryScoreText = recovery.map { Self.integerFormatter.string(from: NSNumber(value: $0.score)) ?? "—" } ?? "—"
        readinessWhy = readiness?.explanations ?? []
        readinessRiskFactors = readiness?.riskFactors ?? []
    }

    private func values(from samples: [HKQuantitySample], identifier: HKQuantityTypeIdentifier) -> [Double] {
        samples
            .filter { $0.quantityType.identifier == identifier.rawValue }
            .map { sample in
                switch identifier {
                case .bodyMass: return sample.quantity.doubleValue(for: .gramUnit(with: .kilo))
                case .stepCount: return sample.quantity.doubleValue(for: .count())
                case .activeEnergyBurned: return sample.quantity.doubleValue(for: .kilocalorie())
                case .restingHeartRate: return sample.quantity.doubleValue(for: HKUnit.count().unitDivided(by: .minute()))
                case .heartRateVariabilitySDNN: return sample.quantity.doubleValue(for: .secondUnit(with: .milli))
                default: return 0
                }
            }
    }

    private func sleepHistoryByDay(from samples: [HKCategorySample]) -> [Date: Double] {
        let calendar = Calendar.current
        let grouped = Dictionary(grouping: samples) { calendar.startOfDay(for: $0.endDate) }
        return Dictionary(uniqueKeysWithValues: grouped.map { day, daySamples in
            let totalHours = daySamples.reduce(0.0) { partial, sample in
                partial + sample.endDate.timeIntervalSince(sample.startDate) / 3600
            }
            return (day, totalHours)
        })
    }

    private func dailySleepHours(from samples: [HKCategorySample]) -> [Double] {
        Array(sleepHistoryByDay(from: samples).values)
    }

    private func dailyQuantityAverages(from samples: [HKQuantitySample], identifier: HKQuantityTypeIdentifier, unit: HKUnit) -> [Date: Double] {
        let calendar = Calendar.current
        let grouped = Dictionary(grouping: samples.filter { $0.quantityType.identifier == identifier.rawValue }) { calendar.startOfDay(for: $0.endDate) }
        return Dictionary(uniqueKeysWithValues: grouped.map { day, daySamples in
            let values = daySamples.map { $0.quantity.doubleValue(for: unit) }
            let average = values.isEmpty ? 0 : values.reduce(0, +) / Double(values.count)
            return (day, average)
        })
    }

    private func dailyQuantitySums(from samples: [HKQuantitySample], identifier: HKQuantityTypeIdentifier, unit: HKUnit) -> [Date: Double] {
        let calendar = Calendar.current
        let grouped = Dictionary(grouping: samples.filter { $0.quantityType.identifier == identifier.rawValue }) { calendar.startOfDay(for: $0.endDate) }
        return Dictionary(uniqueKeysWithValues: grouped.map { day, daySamples in
            let values = daySamples.map { $0.quantity.doubleValue(for: unit) }
            return (day, values.reduce(0, +))
        })
    }

    private func dailyWorkoutCounts(from samples: [HKWorkout]) -> [Date: Double] {
        let calendar = Calendar.current
        let grouped = Dictionary(grouping: samples) { calendar.startOfDay(for: $0.endDate) }
        return Dictionary(uniqueKeysWithValues: grouped.map { day, daySamples in
            (day, Double(daySamples.count))
        })
    }

    private static let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter
    }()

    private static let oneDecimalFormatter: NumberFormatter = {
        let formatter = NumberFormatter()
        formatter.minimumFractionDigits = 1
        formatter.maximumFractionDigits = 1
        return formatter
    }()

    private static let weightFormatter: NumberFormatter = {
        let formatter = NumberFormatter()
        formatter.minimumFractionDigits = 1
        formatter.maximumFractionDigits = 1
        return formatter
    }()

    private static let integerFormatter: NumberFormatter = {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.maximumFractionDigits = 0
        return formatter
    }()

    private static let signedIntegerFormatter: NumberFormatter = {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.positivePrefix = "+"
        formatter.negativePrefix = "-"
        formatter.maximumFractionDigits = 0
        return formatter
    }()
}
