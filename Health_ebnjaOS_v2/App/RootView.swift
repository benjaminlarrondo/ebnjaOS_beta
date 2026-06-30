import SwiftUI

struct RootView: View {
    @EnvironmentObject private var navigation: AppNavigationState
    @EnvironmentObject private var permissions: HealthKitPermissions
    @EnvironmentObject private var manager: HealthKitManager
    @EnvironmentObject private var syncManager: SyncManager
    @State private var showBrandSplash = true

    var body: some View {
        ZStack {
            TabView(selection: $navigation.selectedTab) {
                NavigationStack {
                    DashboardView()
                        .navigationTitle("Home")
                        .navigationBarTitleDisplayMode(.inline)
                }
                .tag(AppTab.home)
                .tabItem {
                    Label("Home", systemImage: "house")
                }

                NavigationStack {
                    FitnessView()
                        .navigationTitle("Fitness")
                }
                .tag(AppTab.fitness)
                .tabItem {
                    Label("Fitness", systemImage: "figure.strengthtraining.traditional")
                }

                NavigationStack {
                    AgendaView()
                        .navigationTitle("Agenda")
                }
                .tag(AppTab.agenda)
                .tabItem {
                    Label("Agenda", systemImage: "calendar")
                }

                NavigationStack {
                    BrainView()
                        .navigationTitle("Brain")
                }
                .tag(AppTab.brain)
                .tabItem {
                    Label("Brain", systemImage: "brain.head.profile")
                }

                NavigationStack {
                    MoreView()
                        .navigationTitle("Más")
                }
                .tag(AppTab.more)
                .tabItem {
                    Label("Más", systemImage: "ellipsis.circle")
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
