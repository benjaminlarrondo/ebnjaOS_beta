import Foundation
import HealthKit

@MainActor
final class HealthKitPermissions: ObservableObject {
    enum AuthorizationState: String {
        case pending = "Pending"
        case authorized = "Authorized"
        case denied = "Denied"

        var displayName: String { rawValue }
    }

    @Published private(set) var authorizationStatus: AuthorizationState = .pending
    @Published private(set) var statusDetail: String = "Authorization not requested yet."

    private let healthStore: HKHealthStore
    private unowned let manager: HealthKitManager

    init(manager: HealthKitManager, healthStore: HKHealthStore = HKHealthStore()) {
        self.manager = manager
        self.healthStore = healthStore
        refresh()
    }

    func refresh() {
        guard HKHealthStore.isHealthDataAvailable() else {
            authorizationStatus = .denied
            statusDetail = "Health data is unavailable on this device."
            manager.refreshAuthorizationState(from: authorizationStatus, detail: statusDetail)
            return
        }

        let statuses = HealthKitTypes.readTypes().compactMap { objectType -> HKAuthorizationStatus? in
            if let quantityType = objectType as? HKQuantityType {
                return healthStore.authorizationStatus(for: quantityType)
            }
            if let categoryType = objectType as? HKCategoryType {
                return healthStore.authorizationStatus(for: categoryType)
            }
            if let workoutType = objectType as? HKWorkoutType {
                return healthStore.authorizationStatus(for: workoutType)
            }
            return nil
        }

        if statuses.contains(.sharingDenied) {
            authorizationStatus = .denied
            statusDetail = "At least one requested HealthKit type was denied."
        } else if statuses.contains(.notDetermined) {
            authorizationStatus = .pending
            statusDetail = "Waiting for the user to grant HealthKit permissions."
        } else {
            authorizationStatus = .authorized
            statusDetail = "Apple Health access is authorized."
        }

        manager.refreshAuthorizationState(from: authorizationStatus, detail: statusDetail)
    }

    func requestAuthorization() async {
        guard HKHealthStore.isHealthDataAvailable() else {
            authorizationStatus = .denied
            statusDetail = "Health data is unavailable on this device."
            manager.refreshAuthorizationState(from: authorizationStatus, detail: statusDetail)
            return
        }

        do {
            try await healthStore.requestAuthorization(toShare: [], read: HealthKitTypes.readTypes())
            refresh()
        } catch {
            authorizationStatus = .denied
            statusDetail = error.localizedDescription
            manager.refreshAuthorizationState(from: authorizationStatus, detail: statusDetail)
        }
    }
}
