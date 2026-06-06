import XCTest
@testable import Health_ebnjaOS_v2

final class Health_ebnjaOS_v2Tests: XCTestCase {
    @MainActor
    func testBaselineEngineProducesExpectedClassification() {
        let engine = HealthBaselineEngine()
        let snapshot = engine.buildSnapshot(from: HealthBaselineInputs(
            currentHrvMs: 72,
            currentRestingHeartRate: 52,
            currentSleepHours: 8.2,
            historicalHrvMs: [58, 60, 62, 61, 64, 63, 59, 60, 61, 62, 64, 65, 66, 63, 64, 62, 61, 63, 62, 64, 66, 68, 67, 65, 66, 64, 63, 62, 61, 60],
            historicalRestingHeartRate: [58, 59, 60, 60, 61, 60, 59, 58, 59, 60, 61, 60, 59, 58, 59, 60, 61, 60, 59, 58, 59, 60, 61, 60, 59, 58, 59, 60, 61, 60],
            historicalSleepHours: Array(repeating: 7.6, count: 30)
        ))

        XCTAssertEqual(snapshot?.hrv?.classification, .elevated)
        XCTAssertEqual(snapshot?.restingHeartRate?.classification, .excellent)
        XCTAssertEqual(snapshot?.sleep?.classification, .aboveTarget)
    }

    @MainActor
    func testReadinessEngineReturnsActionableRecommendation() {
        let engine = ReadinessEngine()
        let assessment = engine.assess(
            recoveryScore: 88,
            sleepHours: 8.0,
            hrvMs: 71,
            restingHeartRate: 54,
            trainingLoad: 42
        )

        XCTAssertEqual(assessment.level, .optimal)
        XCTAssertEqual(assessment.recommendation, .trainHard)
        XCTAssertFalse(assessment.explanations.isEmpty)
    }

    func testSupabaseConfigLoadsFromEnvironment() {
        let config = SupabaseConfig.load(
            bundle: Bundle(for: Self.self),
            environment: [
                "SUPABASE_URL": "https://example.supabase.co",
                "SUPABASE_ANON_KEY": "anon-key",
                "SUPABASE_USER_ID": "00000000-0000-0000-0000-000000000123",
                "SUPABASE_DEVICE_ID": "device-001"
            ]
        )

        XCTAssertEqual(config?.url.absoluteString, "https://example.supabase.co")
        XCTAssertEqual(config?.anonKey, "anon-key")
        XCTAssertEqual(config?.userID.uuidString, "00000000-0000-0000-0000-000000000123")
        XCTAssertEqual(config?.deviceID, "device-001")
    }

    func testSupabaseConfigReturnsNilWhenMissingRequiredValues() {
        let config = SupabaseConfig.load(bundle: Bundle(for: Self.self), environment: [:])

        XCTAssertNil(config)
    }
}
