import Foundation

@MainActor
final class HealthKitPermissions: ObservableObject {
    @Published var authorizationStatusText: String = "Not requested"
    @Published var backgroundDeliveryStatusText: String = "Disabled"

    private unowned let manager: HealthKitManager

    init(manager: HealthKitManager) {
        self.manager = manager
    }

    func requestAuthorization() async {
        await manager.requestAuthorization()
        authorizationStatusText = manager.authorizationStatusText
    }

    func refresh() {
        authorizationStatusText = manager.authorizationStatusText
    }
}
