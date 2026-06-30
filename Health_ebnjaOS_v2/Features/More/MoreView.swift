import SwiftUI

struct MoreView: View {
    @EnvironmentObject private var permissions: HealthKitPermissions
    @EnvironmentObject private var manager: HealthKitManager
    @EnvironmentObject private var syncManager: SyncManager
    @EnvironmentObject private var agendaService: AgendaService

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                header
                healthKitCard
                calendarCard
                supabaseCard
                diagnosticsCard
                actionsCard
            }
            .padding(.horizontal, 16)
            .padding(.top, 12)
            .padding(.bottom, 24)
        }
        .scrollIndicators(.hidden)
        .task {
            await syncManager.refreshLastSync()
        }
    }

    private var header: some View {
        CompactSectionHeader(
            title: "Más",
            subtitle: "Configuración técnica, estado y diagnósticos.",
            trailing: AnyView(
                Text(syncManager.lastSyncText)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            )
        )
    }

    private var healthKitCard: some View {
        SectionCard(title: "HealthKit", subtitle: "Solo aquí vive el panel técnico") {
            VStack(alignment: .leading, spacing: 8) {
                CompactStatusRow(label: "Estado", value: manager.authorizationStatusText, detail: manager.statusDetail)
                CompactStatusRow(label: "Modo", value: healthKitRuntimeMode, detail: manager.loadState.rawValue.capitalized)
            }
        }
    }

    private var calendarCard: some View {
        SectionCard(title: "EventKit / Tete", subtitle: "Calendar Celeste y calendario del sistema") {
            VStack(alignment: .leading, spacing: 8) {
                CompactStatusRow(label: "EventKit", value: agendaService.statusText, detail: agendaService.statusDetail)
                CompactStatusRow(label: "Tete source", value: agendaService.teteSourceText, detail: agendaService.teteWeekText)
            }
        }
    }

    private var supabaseCard: some View {
        SectionCard(title: "Supabase", subtitle: "Sync y respaldo DEV") {
            VStack(alignment: .leading, spacing: 8) {
                CompactStatusRow(label: "Sync", value: syncManager.syncStatus.displayName, detail: syncManager.lastSyncDetail)
                CompactStatusRow(label: "Última sincronización", value: syncManager.lastSyncText, detail: syncManager.lastSyncError)
            }
        }
    }

    private var diagnosticsCard: some View {
        SectionCard(title: "Diagnóstico", subtitle: "Simulator / device y salud de carga") {
            VStack(alignment: .leading, spacing: 8) {
                CompactStatusRow(label: "Runtime", value: healthKitRuntimeMode, detail: ProcessInfo.processInfo.isiOSAppOnMac ? "Mac Catalyst" : "iOS")
                CompactStatusRow(label: "Snapshot", value: manager.latestUpdatedText, detail: manager.hasData ? "Data disponible" : "Sin datos")
            }
        }
    }

    private var actionsCard: some View {
        SectionCard(title: "Acciones", subtitle: "Solicitud de permisos y carga") {
            VStack(spacing: 8) {
                Button {
                    Task { await permissions.requestAuthorization() }
                } label: {
                    Label("Request Health Access", systemImage: "heart.text.square")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)

                Button {
                    Task { await manager.loadLatestDataIfAuthorized() }
                } label: {
                    Label("Load Latest Data", systemImage: "arrow.down.circle")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)

                Button {
                    Task { _ = await agendaService.requestAccessIfNeeded() }
                } label: {
                    Label("Request Calendar Access", systemImage: "calendar.badge.plus")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)

                Button {
                    Task { await syncManager.syncNow() }
                } label: {
                    Label("Sync Now", systemImage: "arrow.triangle.2.circlepath")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
            }
        }
    }

    private var healthKitRuntimeMode: String {
        ProcessInfo.processInfo.environment["SIMULATOR_DEVICE_NAME"] != nil ? "Running on Simulator: using mock HealthKit data" : "Running on Device: requesting HealthKit permissions"
    }
}
