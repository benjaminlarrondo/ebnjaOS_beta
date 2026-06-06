import SwiftUI
import HealthKit

@main
struct Health_ebnjaOS_v2App: App {
    @StateObject private var healthKitManager: HealthKitManager
    @StateObject private var permissions: HealthKitPermissions
    @StateObject private var syncManager: SyncManager

    init() {
        let healthStore = HKHealthStore()
        let manager = HealthKitManager(healthStore: healthStore)
        let permissions = HealthKitPermissions(manager: manager, healthStore: healthStore)
        let syncManager = SyncManager(manager: manager, config: Config.loadSupabaseConfig())
        _healthKitManager = StateObject(wrappedValue: manager)
        _permissions = StateObject(wrappedValue: permissions)
        _syncManager = StateObject(wrappedValue: syncManager)
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(healthKitManager)
                .environmentObject(permissions)
                .environmentObject(syncManager)
        }
    }
}
