import Foundation

enum AppTab: String, CaseIterable, Identifiable {
    case home
    case fitness
    case agenda
    case brain
    case more

    var id: String { rawValue }
}

@MainActor
final class AppNavigationState: ObservableObject {
    @Published var selectedTab: AppTab = .home
}
