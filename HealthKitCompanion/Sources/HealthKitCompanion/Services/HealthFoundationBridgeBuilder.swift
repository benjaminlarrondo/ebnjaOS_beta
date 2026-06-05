import Foundation

final class HealthFoundationBridgeBuilder {
    func buildUpload(snapshot: HealthSnapshot, deviceId: String, userId: String) -> SnapshotUpload {
        let foundationState = buildFoundationState(snapshot: snapshot)
        let healthStateRow = HealthStateRow(
            id: "health-single-state-v1",
            user_id: userId,
            state: foundationState,
            updated_at: isoString(Date())
        )

        return SnapshotUpload(
            schemaVersion: snapshot.schemaVersion,
            generatedAt: isoString(Date()),
            capturedAt: isoString(snapshot.capturedAt),
            deviceId: deviceId,
            source: snapshot.source,
            snapshot: snapshot,
            foundationState: foundationState,
            healthStateRow: healthStateRow,
            bodyMetricRows: buildBodyMetricRows(from: snapshot, userId: userId),
            workoutRows: buildWorkoutRows(from: snapshot, userId: userId)
        )
    }

    func buildFoundationState(snapshot: HealthSnapshot) -> HealthFoundationState {
        let daily = buildDailyRecords(from: snapshot)
        return .appleHealthReady(daily: daily, lastSyncAt: isoString(snapshot.capturedAt))
    }

    func buildDailyRecords(from snapshot: HealthSnapshot) -> [String: HealthDailyRecord] {
        let groupedByDate = groupMetricsByDate(snapshot.metrics)
        let workoutsByDate = Dictionary(grouping: snapshot.workouts) { toDateKey($0.startedAt) }

        var records: [String: HealthDailyRecord] = [:]
        let allDates = Set(listDates(from: snapshot.windowStart, to: snapshot.windowEnd))

        for date in allDates {
            let metrics = groupedByDate[date] ?? []
            let workouts = workoutsByDate[date] ?? []

            let water = 0.0
            let protein = 0.0
            let sleep = metricsForDay(metrics, kind: .sleepAnalysis, reducer: .sum)
            let weight = latestValue(metrics, kind: .bodyMass)
            let steps = Int(metricsForDay(metrics, kind: .stepCount, reducer: .sum).rounded())
            let hrv = latestValue(metrics, kind: .heartRateVariabilitySDNN)
            let restingHr = Int(latestValue(metrics, kind: .restingHeartRate).rounded())
            let updatedAt = latestUpdatedAt(metrics, workouts: workouts, fallback: snapshot.capturedAt)

            records[date] = HealthDailyRecord(
                date: date,
                water_ml: water,
                protein_g: protein,
                sleep_hours: sleep,
                weight_kg: weight,
                workouts_count: workouts.count,
                steps_count: steps,
                hrv_ms: hrv,
                resting_hr: restingHr,
                source: "derived",
                updatedAt: updatedAt
            )
        }

        return records
    }

    func buildBodyMetricRows(from snapshot: HealthSnapshot, userId: String) -> [FitnessBodyMetricRow] {
        let daily = buildDailyRecords(from: snapshot)
        return daily.values.sorted { $0.date < $1.date }.map { day in
            FitnessBodyMetricRow(
                user_id: userId,
                date: day.date,
                body_weight: day.weight_kg == 0 ? nil : day.weight_kg,
                sleep_hours: day.sleep_hours == 0 ? nil : day.sleep_hours,
                steps_count: day.steps_count == 0 ? nil : day.steps_count,
                hrv_ms: day.hrv_ms == 0 ? nil : day.hrv_ms,
                resting_hr: day.resting_hr == 0 ? nil : day.resting_hr,
                source: "apple_health",
                external_id: "apple-health-body:\(day.date)",
                external_updated_at: day.updatedAt,
                metadata: [
                    "source": "apple_health",
                    "date": day.date,
                    "updatedAt": day.updatedAt,
                ]
            )
        }
    }

    func buildWorkoutRows(from snapshot: HealthSnapshot, userId: String) -> [FitnessWorkoutRow] {
        snapshot.workouts.enumerated().map { index, workout in
            FitnessWorkoutRow(
                user_id: userId,
                title: "Apple Health Workout \(index + 1)",
                date: toDateKey(workout.startedAt),
                type: workout.workoutType.rawValue,
                duration_minutes: max(0, Int((workout.duration / 60).rounded())),
                intensity: 0,
                notes: "Imported from Apple Health Companion",
                source: "apple_health",
                external_id: workout.externalId,
                external_updated_at: isoString(workout.externalUpdatedAt),
                metadata: [
                    "source": "apple_health",
                    "date": toDateKey(workout.startedAt),
                    "externalId": workout.externalId,
                ]
            )
        }
    }

    private enum Reducer {
        case sum
        case latest
    }

    private func groupMetricsByDate(_ metrics: [HealthMetric]) -> [String: [HealthMetric]] {
        Dictionary(grouping: metrics) { toDateKey($0.recordedAt) }
    }

    private func metricsForDay(_ metrics: [HealthMetric], kind: HealthMetricKind, reducer: Reducer) -> Double {
        let filtered = metrics.filter { $0.kind == kind }
        guard !filtered.isEmpty else { return 0 }

        switch reducer {
        case .sum:
            return filtered.reduce(0) { $0 + $1.value }
        case .latest:
            return filtered.sorted { $0.recordedAt < $1.recordedAt }.last?.value ?? 0
        }
    }

    private func latestValue(_ metrics: [HealthMetric], kind: HealthMetricKind) -> Double {
        metricsForDay(metrics, kind: kind, reducer: .latest)
    }

    private func latestUpdatedAt(_ metrics: [HealthMetric], workouts: [WorkoutRecord], fallback: Date) -> String {
        let latestMetric = metrics.map(\.externalUpdatedAt).max() ?? .distantPast
        let latestWorkout = workouts.map(\.externalUpdatedAt).max() ?? .distantPast
        let candidate = max(latestMetric, latestWorkout)
        return isoString(candidate == .distantPast ? fallback : candidate)
    }

    private func isoString(_ date: Date) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter.string(from: date)
    }

    private func toDateKey(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.calendar = Calendar(identifier: .gregorian)
        formatter.locale = .current
        formatter.timeZone = .current
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: date)
    }

    private func listDates(from start: Date, to end: Date) -> [String] {
        var dates: [String] = []
        var current = Calendar.current.startOfDay(for: start)
        let last = Calendar.current.startOfDay(for: end)

        while current <= last {
            dates.append(toDateKey(current))
            guard let next = Calendar.current.date(byAdding: .day, value: 1, to: current) else { break }
            current = next
        }

        return dates
    }
}
