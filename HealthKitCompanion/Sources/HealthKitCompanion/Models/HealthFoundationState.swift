import Foundation
#if canImport(UIKit)
import UIKit
#endif

struct HealthMetricDefinition: Codable, Hashable {
    let entity: String
    let key: String
    let label: String
    let unit: String
    let dailyTarget: Double
}

struct HealthDailyRecord: Codable, Hashable, Identifiable {
    var id: String { date }

    let date: String
    let water_ml: Double
    let protein_g: Double
    let sleep_hours: Double
    let weight_kg: Double
    let workouts_count: Int
    let steps_count: Int
    let hrv_ms: Double
    let resting_hr: Int
    let source: String
    let updatedAt: String
}

struct HealthDashboardModels: Codable, Hashable {
    let sleepScore: Int
    let proteinProgress: Int
    let workoutLoad: Int
    let recoveryScore: Int
}

struct HealthIntegrationState: Codable, Hashable {
    let appleHealthPrepared: Bool
    let provider: String
}

struct HealthFoundationState: Codable, Hashable {
    let version: String
    let metrics: [HealthMetricDefinition]
    let daily: [String: HealthDailyRecord]
    let dashboardModels: HealthDashboardModels
    let lastSyncAt: String?
    let integration: HealthIntegrationState

    static func appleHealthReady(
        daily: [String: HealthDailyRecord],
        lastSyncAt: String
    ) -> HealthFoundationState {
        HealthFoundationState(
            version: "v1",
            metrics: [
                .init(entity: "Water", key: "water_ml", label: "Agua", unit: "ml", dailyTarget: 3000),
                .init(entity: "Protein", key: "protein_g", label: "Proteína", unit: "g", dailyTarget: 135),
                .init(entity: "Sleep", key: "sleep_hours", label: "Sueño", unit: "hours", dailyTarget: 8),
                .init(entity: "Weight", key: "weight_kg", label: "Peso", unit: "kg", dailyTarget: 0),
                .init(entity: "Workout", key: "workouts_count", label: "Entrenamientos", unit: "count", dailyTarget: 1),
                .init(entity: "Activity", key: "steps_count", label: "Pasos", unit: "steps", dailyTarget: 8000),
                .init(entity: "HRV", key: "hrv_ms", label: "HRV", unit: "ms", dailyTarget: 60),
                .init(entity: "RestingHR", key: "resting_hr", label: "FC Reposo", unit: "bpm", dailyTarget: 55),
            ],
            daily: daily,
            dashboardModels: Self.makeDashboardModels(daily: daily),
            lastSyncAt: lastSyncAt,
            integration: .init(appleHealthPrepared: true, provider: "apple_health")
        )
    }

    static func makeDashboardModels(daily: [String: HealthDailyRecord]) -> HealthDashboardModels {
        let recentDays = daily.values.sorted { $0.date > $1.date }.prefix(7)
        guard !recentDays.isEmpty else {
            return .init(sleepScore: 0, proteinProgress: 0, workoutLoad: 0, recoveryScore: 0)
        }

        let sleepAvg = recentDays.reduce(0.0) { $0 + $1.sleep_hours } / Double(recentDays.count)
        let proteinAvg = recentDays.reduce(0.0) { $0 + $1.protein_g } / Double(recentDays.count)
        let workoutLoad = recentDays.reduce(0) { $0 + $1.workouts_count }

        let sleepScore = clampPct((sleepAvg / 8.0) * 100)
        let proteinProgress = clampPct((proteinAvg / 135.0) * 100)
        let recoveryScore = clampPct((Double(sleepScore) * 0.7) + (Double(proteinProgress) * 0.3))

        return .init(
            sleepScore: sleepScore,
            proteinProgress: proteinProgress,
            workoutLoad: workoutLoad,
            recoveryScore: recoveryScore
        )
    }
}

struct HealthStateRow: Codable, Hashable {
    let id: String
    let user_id: String
    let state: HealthFoundationState
    let updated_at: String
}

struct FitnessBodyMetricRow: Codable, Hashable {
    let user_id: String
    let date: String
    let body_weight: Double?
    let sleep_hours: Double?
    let steps_count: Int?
    let hrv_ms: Double?
    let resting_hr: Int?
    let source: String
    let external_id: String
    let external_updated_at: String?
    let metadata: [String: String]
}

struct FitnessWorkoutRow: Codable, Hashable {
    let user_id: String
    let title: String
    let date: String
    let type: String
    let duration_minutes: Int
    let intensity: Int
    let notes: String
    let source: String
    let external_id: String
    let external_updated_at: String?
    let metadata: [String: String]
}

struct SnapshotUpload: Codable, Hashable {
    let schemaVersion: Int
    let generatedAt: String
    let capturedAt: String
    let deviceId: String
    let source: String
    let snapshot: HealthSnapshot
    let foundationState: HealthFoundationState
    let healthStateRow: HealthStateRow
    let bodyMetricRows: [FitnessBodyMetricRow]
    let workoutRows: [FitnessWorkoutRow]
}

struct SyncReport: Codable, Hashable {
    enum Status: String, Codable {
        case idle
        case syncing
        case success
        case partial
        case error
    }

    let status: Status
    let startedAt: String
    let finishedAt: String
    let snapshotId: String
    let lastRemoteSyncAt: String?
    let metricsUploaded: Int
    let workoutsUploaded: Int
    let healthStateUploaded: Bool
    let deduplicatedRows: Int
    let message: String
}

struct SupabaseBridgeConfiguration: Hashable {
    let baseURL: URL
    let anonKey: String
    let userId: String
    let deviceId: String

    static func live() -> SupabaseBridgeConfiguration? {
        let env = ProcessInfo.processInfo.environment
        let urlString = env["SUPABASE_URL"]
            ?? env["VITE_SUPABASE_URL"]
            ?? Bundle.main.object(forInfoDictionaryKey: "SUPABASE_URL") as? String
            ?? Bundle.main.object(forInfoDictionaryKey: "VITE_SUPABASE_URL") as? String
        let anonKey = env["SUPABASE_ANON_KEY"]
            ?? env["VITE_SUPABASE_ANON_KEY"]
            ?? Bundle.main.object(forInfoDictionaryKey: "SUPABASE_ANON_KEY") as? String
            ?? Bundle.main.object(forInfoDictionaryKey: "VITE_SUPABASE_ANON_KEY") as? String
        let userId = env["SUPABASE_USER_ID"]
            ?? env["VITE_SINGLE_USER_ID"]
            ?? Bundle.main.object(forInfoDictionaryKey: "SUPABASE_USER_ID") as? String
            ?? Bundle.main.object(forInfoDictionaryKey: "VITE_SINGLE_USER_ID") as? String
        #if canImport(UIKit)
        let platformDeviceId = UIDevice.current.identifierForVendor?.uuidString
        #else
        let platformDeviceId: String? = nil
        #endif

        let deviceId = env["SUPABASE_DEVICE_ID"]
            ?? Bundle.main.object(forInfoDictionaryKey: "SUPABASE_DEVICE_ID") as? String
            ?? platformDeviceId

        guard
            let urlString,
            let baseURL = URL(string: urlString),
            let anonKey,
            let userId,
            let deviceId
        else {
            return nil
        }

        return SupabaseBridgeConfiguration(baseURL: baseURL, anonKey: anonKey, userId: userId, deviceId: deviceId)
    }
}

struct SupabaseBridgeError: LocalizedError {
    let message: String
    var errorDescription: String? { message }
}

private func clampPct(_ value: Double) -> Int {
    max(0, min(100, Int(value.rounded())))
}
