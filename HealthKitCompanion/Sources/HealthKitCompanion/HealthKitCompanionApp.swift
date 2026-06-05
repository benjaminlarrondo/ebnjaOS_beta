import SwiftUI

@main
struct HealthKitCompanionApp: App {
    @StateObject private var permissions: HealthKitPermissions
    @StateObject private var manager: HealthKitManager
    @StateObject private var queries: HealthKitQueries
    @StateObject private var syncEngine: SyncEngine
    @StateObject private var supabaseClient: SupabaseClient

    init() {
        let queries = HealthKitQueries()
        let manager = HealthKitManager(queries: queries)
        let permissions = HealthKitPermissions(manager: manager)
        let supabaseClient = SupabaseClient()
        _permissions = StateObject(wrappedValue: permissions)
        _manager = StateObject(wrappedValue: manager)
        _queries = StateObject(wrappedValue: queries)
        _supabaseClient = StateObject(wrappedValue: supabaseClient)
        _syncEngine = StateObject(wrappedValue: SyncEngine(supabaseClient: supabaseClient))
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(permissions)
                .environmentObject(manager)
                .environmentObject(queries)
                .environmentObject(syncEngine)
                .environmentObject(supabaseClient)
        }
    }
}
