import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var permissions: HealthKitPermissions
    @EnvironmentObject private var syncEngine: SyncEngine
    @EnvironmentObject private var supabaseClient: SupabaseClient

    var body: some View {
        Form {
            Section("HealthKit") {
                LabeledContent("Authorization", value: permissions.authorizationStatusText)
                LabeledContent("Background delivery", value: permissions.backgroundDeliveryStatusText)
            }

            Section("Supabase") {
                LabeledContent("Configured", value: supabaseClient.isConfigured ? "Yes" : "No")
                LabeledContent("Endpoint", value: supabaseClient.endpointURL?.absoluteString ?? "Missing")
                if let error = supabaseClient.lastErrorMessage {
                    Text(error)
                        .foregroundStyle(.red)
                        .font(.caption)
                }
            }

            Section("Sync") {
                LabeledContent("Status", value: syncEngine.statusText)
                LabeledContent("Last sync", value: syncEngine.lastSyncText)
                LabeledContent("Report", value: syncEngine.lastReportText)
            }
        }
    }
}
