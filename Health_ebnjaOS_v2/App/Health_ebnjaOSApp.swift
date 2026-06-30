import SwiftUI
import HealthKit

@main
struct Health_ebnjaOS_v2App: App {
    @StateObject private var healthKitManager: HealthKitManager
    @StateObject private var permissions: HealthKitPermissions
    @StateObject private var syncManager: SyncManager
    @StateObject private var navigationState: AppNavigationState
    @StateObject private var agendaService: AgendaService
    @StateObject private var fitnessStore: FitnessExecutionStore
    @StateObject private var brainStore: BrainStore
    @StateObject private var trackingStore: TrackingStore

    init() {
        let healthStore = HKHealthStore()
        let manager = HealthKitManager(healthStore: healthStore)
        let permissions = HealthKitPermissions(manager: manager, healthStore: healthStore)
        let syncManager = SyncManager(manager: manager, config: Config.loadSupabaseConfig())
        let navigationState = AppNavigationState()
        let agendaService = AgendaService()
        let fitnessStore = FitnessExecutionStore()
        let brainStore = BrainStore()
        let trackingStore = TrackingStore()
        _healthKitManager = StateObject(wrappedValue: manager)
        _permissions = StateObject(wrappedValue: permissions)
        _syncManager = StateObject(wrappedValue: syncManager)
        _navigationState = StateObject(wrappedValue: navigationState)
        _agendaService = StateObject(wrappedValue: agendaService)
        _fitnessStore = StateObject(wrappedValue: fitnessStore)
        _brainStore = StateObject(wrappedValue: brainStore)
        _trackingStore = StateObject(wrappedValue: trackingStore)
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(navigationState)
                .environmentObject(healthKitManager)
                .environmentObject(permissions)
                .environmentObject(syncManager)
                .environmentObject(agendaService)
                .environmentObject(fitnessStore)
                .environmentObject(brainStore)
                .environmentObject(trackingStore)
        }
    }
}
