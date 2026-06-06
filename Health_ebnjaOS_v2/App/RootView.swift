import SwiftUI

struct RootView: View {
    @EnvironmentObject private var permissions: HealthKitPermissions
    @EnvironmentObject private var manager: HealthKitManager
    @EnvironmentObject private var syncManager: SyncManager
    @State private var showBrandSplash = true

    var body: some View {
        ZStack {
            TabView {
                NavigationStack {
                    DashboardView()
                        .navigationTitle("Dashboard")
                        .navigationBarTitleDisplayMode(.inline)
                }
                .tabItem {
                    Label("Dashboard", systemImage: "house")
                }

                NavigationStack {
                    RecoveryView()
                        .navigationTitle("Recovery")
                }
                .tabItem {
                    Label("Recovery", systemImage: "heart.fill")
                }

                NavigationStack {
                    ReadinessView()
                        .navigationTitle("Readiness")
                }
                .tabItem {
                    Label("Readiness", systemImage: "checkmark.seal")
                }

                NavigationStack {
                    SyncView()
                        .navigationTitle("Sync")
                }
                .tabItem {
                    Label("Sync", systemImage: "arrow.triangle.2.circlepath")
                }
            }

            if showBrandSplash {
                BrandSplashView()
                    .transition(.opacity)
                    .zIndex(1)
            }
        }
        .task(id: permissions.authorizationStatus) {
            permissions.refresh()
            await manager.loadLatestDataIfAuthorized()
            await syncManager.refreshLastSync()
            await MainActor.run {
                if showBrandSplash {
                    withAnimation(.easeOut(duration: 0.45)) {
                        showBrandSplash = false
                    }
                }
            }
        }
    }
}
