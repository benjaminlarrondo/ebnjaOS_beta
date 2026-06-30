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
        if ProcessInfo.processInfo.environment["SIMULATOR_DEVICE_NAME"] != nil {
            authorizationStatus = .authorized
            statusDetail = "Running on Simulator: using mock HealthKit data."
            manager.refreshAuthorizationState(from: authorizationStatus, detail: statusDetail)
            return
        }

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
        if ProcessInfo.processInfo.environment["SIMULATOR_DEVICE_NAME"] != nil {
            authorizationStatus = .authorized
            statusDetail = "Running on Simulator: using mock HealthKit data."
            manager.refreshAuthorizationState(from: authorizationStatus, detail: statusDetail)
            await manager.loadLatestDataIfAuthorized()
            return
        }

        guard HKHealthStore.isHealthDataAvailable() else {
            authorizationStatus = .denied
            statusDetail = "Health data is unavailable on this device."
            manager.refreshAuthorizationState(from: authorizationStatus, detail: statusDetail)
            return
        }

        do {
            NSLog("Running on \(ProcessInfo.processInfo.environment["SIMULATOR_DEVICE_NAME"] == nil ? "Device" : "Simulator"): requesting HealthKit permissions")
            try await healthStore.requestAuthorization(toShare: [], read: HealthKitTypes.readTypes())
            refresh()
            if authorizationStatus == .authorized {
                await manager.loadLatestDataIfAuthorized()
            }
        } catch {
            authorizationStatus = .denied
            statusDetail = error.localizedDescription
            manager.refreshAuthorizationState(from: authorizationStatus, detail: statusDetail)
        }
    }
}
