import Foundation
import CryptoKit

@MainActor
struct HealthSyncNormalizer {
    let config: SupabaseConfig

    func normalize(snapshot: HealthSyncSnapshot) -> HealthSyncPayload {
        let healthState = HealthStatePayload(
            id: healthStateIdentifier,
            userId: config.userID,
            state: makeStateSnapshot(from: snapshot),
            updatedAt: snapshot.syncedAt
        )

        let bodyMetrics = makeBodyMetricPayloads(from: snapshot)
        let workouts = snapshot.recentWorkouts.map { workout in
            HealthWorkoutPayload(
                id: stableUUID(prefix: "workout", externalID: workout.externalId),
                userId: config.userID,
                title: workout.workoutType.displayName,
                date: Self.dateOnlyFormatter.string(from: workout.endedAt),
                type: workout.workoutType.supabaseType,
                durationMinutes: max(Int(round(workout.duration / 60.0)), 0),
                intensity: intensity(for: workout),
                notes: workout.source,
                source: "apple_health",
                externalId: workout.externalId,
                externalUpdatedAt: workout.externalUpdatedAt,
                metadata: workoutMetadata(for: workout, snapshot: snapshot)
            )
        }

        return HealthSyncPayload(healthState: healthState, bodyMetrics: bodyMetrics, workouts: workouts)
    }

    private var healthStateIdentifier: String {
        "health-state-\(config.userID.uuidString)"
    }

    private func makeBodyMetricPayloads(from snapshot: HealthSyncSnapshot) -> [HealthBodyMetricPayload] {
        guard snapshot.weight != nil || snapshot.steps != nil || snapshot.sleep != nil || snapshot.hrv != nil || snapshot.restingHeartRate != nil || snapshot.activeEnergy != nil else {
            return []
        }

        let date = Self.dateOnlyFormatter.string(from: snapshot.syncedAt)
        let externalId = "apple-health-body-metrics-\(date)"
        let latestUpdatedAt = [
            snapshot.weight?.externalUpdatedAt,
            snapshot.steps?.externalUpdatedAt,
            snapshot.sleep?.externalUpdatedAt,
            snapshot.hrv?.externalUpdatedAt,
            snapshot.restingHeartRate?.externalUpdatedAt,
            snapshot.activeEnergy?.externalUpdatedAt
        ].compactMap { $0 }.max() ?? snapshot.syncedAt

        return [
            HealthBodyMetricPayload(
                id: stableUUID(prefix: "body-metric", externalID: externalId),
                userId: config.userID,
                date: date,
                bodyWeight: snapshot.weight?.value,
                bodyFat: nil,
                sleepHours: snapshot.sleep?.value,
                energyLevel: snapshot.recovery.map { Int($0.score.rounded()) },
                stepsCount: Int(snapshot.steps?.value.rounded() ?? 0),
                hrvMs: snapshot.hrv?.value,
                restingHr: snapshot.restingHeartRate.map { Int($0.value.rounded()) },
                source: "apple_health",
                externalId: externalId,
                externalUpdatedAt: latestUpdatedAt,
                metadata: makeBodyMetricMetadata(from: snapshot, date: date)
            )
        ]
    }

    private func makeBodyMetricMetadata(from snapshot: HealthSyncSnapshot, date: String) -> [String: String] {
        var metadata: [String: String] = [
            "source": "apple_health",
            "sync_date": date,
            "synced_at": Self.iso8601Formatter.string(from: snapshot.syncedAt)
        ]

        if let baseline = snapshot.baseline {
            metadata["hrv_baseline_delta"] = baseline.hrv.map { String(format: "%.1f", $0.deltaPercent) } ?? "n/a"
            metadata["resting_hr_baseline_delta"] = baseline.restingHeartRate.map { String(format: "%.1f", $0.deltaPercent) } ?? "n/a"
            metadata["sleep_baseline_delta"] = baseline.sleep.map { String(format: "%.1f", $0.deltaPercent) } ?? "n/a"
        }

        if let recovery = snapshot.recovery {
            metadata["recovery_score"] = String(format: "%.0f", recovery.score)
            metadata["training_load"] = String(format: "%.0f", recovery.trainingLoad)
            metadata["weekly_trend"] = String(format: "%.0f", recovery.weeklyTrend)
        }

        if let readiness = snapshot.readiness {
            metadata["readiness_level"] = readiness.level.displayName
            metadata["training_recommendation"] = readiness.recommendation.displayName
        }

        if let activeEnergy = snapshot.activeEnergy {
            metadata["active_energy_burned"] = String(format: "%.0f", activeEnergy.value)
        }

        return metadata
    }

    private func makeStateSnapshot(from snapshot: HealthSyncSnapshot) -> HealthStateSnapshot {
        HealthStateSnapshot(
            source: "apple_health",
            sourceFingerprint: sourceFingerprint(from: snapshot),
            syncedAt: snapshot.syncedAt,
            metrics: HealthStateMetrics(
                weightKg: snapshot.weight?.value,
                stepsLast7Days: snapshot.steps?.value,
                stepsAverageDaily: snapshot.steps.map { $0.value / 7.0 },
                sleepHours: snapshot.sleep?.value,
                hrvMs: snapshot.hrv?.value,
                restingHr: snapshot.restingHeartRate?.value,
                activeCalories: snapshot.activeEnergy?.value,
                workoutsLast7Days: snapshot.workoutsSummary?.countLast7Days
            ),
            baselines: makeBaselineSummary(from: snapshot.baseline),
            recovery: snapshot.recovery.map {
                HealthStateRecoverySummary(
                    score: $0.score,
                    readiness: $0.readiness.displayName,
                    trainingLoad: $0.trainingLoad,
                    weeklyTrend: $0.weeklyTrend,
                    trendDelta: $0.trendDelta
                )
            },
            readiness: snapshot.readiness.map {
                HealthStateReadinessSummary(
                    level: $0.level.displayName,
                    recommendation: $0.recommendation.displayName,
                    explanations: $0.explanations,
                    riskFactors: $0.riskFactors
                )
            }
        )
    }

    private func makeBaselineSummary(from baseline: HealthBaselineSnapshot?) -> HealthStateBaselineSummary? {
        guard let baseline else { return nil }
        return HealthStateBaselineSummary(
            hrv: baseline.hrv,
            restingHeartRate: baseline.restingHeartRate,
            sleep: baseline.sleep
        )
    }

    private func workoutMetadata(for workout: WorkoutRecord, snapshot: HealthSyncSnapshot) -> [String: String] {
        var metadata: [String: String] = [
            "source": "apple_health",
            "synced_at": Self.iso8601Formatter.string(from: snapshot.syncedAt)
        ]

        metadata["workout_display_name"] = workout.workoutType.displayName
        metadata["duration_minutes"] = "\(max(Int(round(workout.duration / 60.0)), 0))"
        if let energyBurned = workout.energyBurned {
            metadata["energy_burned"] = String(format: "%.0f", energyBurned)
        }
        return metadata
    }

    private func intensity(for workout: WorkoutRecord) -> Int {
        let minutes = max(Int(round(workout.duration / 60.0)), 0)
        let energy = workout.energyBurned ?? 0
        let raw = (Double(minutes) / 12.0) + (energy / 100.0)
        return max(1, min(10, Int(raw.rounded())))
    }

    private func sourceFingerprint(from snapshot: HealthSyncSnapshot) -> String {
        let pieces = [
            stringPiece(snapshot.weight?.value),
            stringPiece(snapshot.steps?.value),
            stringPiece(snapshot.sleep?.value),
            stringPiece(snapshot.hrv?.value),
            stringPiece(snapshot.restingHeartRate?.value),
            stringPiece(snapshot.activeEnergy?.value),
            stringPiece(snapshot.workoutsSummary?.countLast7Days),
            stringPiece(snapshot.recovery?.score),
            snapshot.readiness?.level.displayName
        ].compactMap { $0 }
        return pieces.joined(separator: "|")
    }

    private func stringPiece<T>(_ value: T?) -> String? {
        value.map { String(describing: $0) }
    }

    private func stableUUID(prefix: String, externalID: String) -> UUID {
        let input = "\(prefix)|\(config.userID.uuidString)|\(externalID)"
        let digest = SHA256.hash(data: Data(input.utf8))
        var bytes = Array(digest.prefix(16))
        bytes[6] = (bytes[6] & 0x0F) | 0x40
        bytes[8] = (bytes[8] & 0x3F) | 0x80
        let uuidBytes = (
            bytes[0], bytes[1], bytes[2], bytes[3],
            bytes[4], bytes[5], bytes[6], bytes[7],
            bytes[8], bytes[9], bytes[10], bytes[11],
            bytes[12], bytes[13], bytes[14], bytes[15]
        )
        return UUID(uuid: uuid_t(
            uuidBytes.0, uuidBytes.1, uuidBytes.2, uuidBytes.3,
            uuidBytes.4, uuidBytes.5, uuidBytes.6, uuidBytes.7,
            uuidBytes.8, uuidBytes.9, uuidBytes.10, uuidBytes.11,
            uuidBytes.12, uuidBytes.13, uuidBytes.14, uuidBytes.15
        ))
    }

    private static let dateOnlyFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.calendar = Calendar(identifier: .gregorian)
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter
    }()

    private static let iso8601Formatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()
}
