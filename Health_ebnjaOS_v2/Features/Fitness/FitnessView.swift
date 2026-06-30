import SwiftUI

struct FitnessView: View {
    @EnvironmentObject private var manager: HealthKitManager
    @EnvironmentObject private var store: FitnessExecutionStore
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                header
                healthStatusCard
                todayWorkoutCard
                routineFilterCard
                routinesCard
                activeSessionCard
                historyCard
            }
            .padding(.horizontal, 16)
            .padding(.top, 12)
            .padding(.bottom, 24)
        }
        .scrollIndicators(.hidden)
    }

    private var header: some View {
        CompactSectionHeader(
            title: "Fitness",
            subtitle: "Entrena, registra y sigue el siguiente bloque sin salir de ebnjaOS.",
            trailing: AnyView(
                Text(manager.latestUpdatedText)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            )
        )
    }

    private var healthStatusCard: some View {
        SectionCard(title: "Apple Health", subtitle: "Estado simple y claro") {
            VStack(alignment: .leading, spacing: 8) {
                CompactStatusRow(
                    label: "Estado",
                    value: fitnessHealthStatusText,
                    detail: manager.statusDetail
                )
                CompactStatusRow(
                    label: "Datos",
                    value: fitnessHealthModeText,
                    detail: manager.loadState == .ready ? "Última actualización \(manager.latestUpdatedText)" : "Se actualiza cuando hay autorización."
                )
            }
        }
    }

    private var todayWorkoutCard: some View {
        SectionCard(title: "Entrenamiento de hoy", subtitle: "Rutina recomendada") {
            VStack(alignment: .leading, spacing: 12) {
                if let recommended = store.recommendedTemplate {
                    VStack(alignment: .leading, spacing: 6) {
                        Text(recommended.name)
                            .font(.headline)
                            .lineLimit(2)
                        Text("\(recommended.workoutDay.estimatedMinutes) min · \(recommended.family.displayName)")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }

                    VStack(alignment: .leading, spacing: 8) {
                        ForEach(recommended.workoutDay.exercises.prefix(4)) { exercise in
                            CompactStatusRow(
                                label: exercise.name,
                                value: "\(exercise.sets)x\(exercise.reps)",
                                detail: detailText(for: exercise)
                            )
                        }
                    }

                    Button {
                        store.startSession(using: recommended)
                    } label: {
                        Label("Iniciar entrenamiento", systemImage: "play.fill")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                } else {
                    Text("No hay rutina disponible.")
                        .foregroundStyle(.secondary)
                }
            }
        }
    }

    private var routineFilterCard: some View {
        SectionCard(title: "Filtros", subtitle: "Gym, Casa o Todos") {
            Picker("Filter", selection: Binding(
                get: { store.routineFilter },
                set: { store.selectFilter($0) }
            )) {
                ForEach(FitnessRoutineFilter.allCases) { filter in
                    Text(filter.displayName).tag(filter)
                }
            }
            .pickerStyle(.segmented)
        }
    }

    private var routinesCard: some View {
        SectionCard(title: "Routines", subtitle: "Las 6 rutinas canónicas") {
            LazyVGrid(columns: columns, alignment: .leading, spacing: 10) {
                ForEach(store.availableTemplates) { template in
                    Button {
                        store.selectRoutine(template.id)
                    } label: {
                        CompactModuleCard(
                            title: template.name,
                            subtitle: template.description,
                            value: "\(template.workoutDay.exercises.count) ejercicios",
                            detail: "\(template.workoutDay.estimatedMinutes) min · \(template.family.displayName)",
                            icon: template.family == .gym ? "figure.strengthtraining.traditional" : "house.fill",
                            isSelected: template.id == store.selectedRoutineID
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private var activeSessionCard: some View {
        SectionCard(title: "Sesión activa", subtitle: "Persistencia local-first") {
            VStack(alignment: .leading, spacing: 8) {
                if let session = store.activeSession {
                    CompactStatusRow(label: "Inicio", value: formatted(date: session.startedAt), detail: session.routineID)
                    Button {
                        store.completeSession(durationMinutes: 50, notes: "Completed from Fitness")
                    } label: {
                        Label("Completar sesión", systemImage: "checkmark.circle.fill")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)
                } else {
                    Text("No hay sesión activa.")
                        .foregroundStyle(.secondary)
                }
            }
        }
    }

    private var historyCard: some View {
        SectionCard(title: "Historial", subtitle: "Último entrenamiento, streak y volumen") {
            VStack(alignment: .leading, spacing: 8) {
                CompactStatusRow(label: "Último entreno", value: store.lastWorkoutText, detail: nil)
                CompactStatusRow(label: "Streak", value: store.streakText, detail: nil)
                CompactStatusRow(label: "Volumen semanal", value: store.weeklyVolumeText, detail: nil)
                CompactStatusRow(label: "Siguiente", value: store.nextTrainingTemplate?.name ?? "—", detail: "No salta entrenamientos perdidos")
            }
        }
    }

    private var columns: [GridItem] {
        let count = horizontalSizeClass == .regular ? 2 : 1
        return Array(repeating: GridItem(.flexible(), spacing: 10), count: count)
    }

    private func detailText(for exercise: FitnessExercisePlan) -> String {
        var parts: [String] = []
        if let targetWeight = exercise.targetWeight {
            parts.append(targetWeight)
        }
        if exercise.restSeconds > 0 {
            parts.append("Descanso \(exercise.restSeconds)s")
        }
        return parts.joined(separator: " · ")
    }

    private var fitnessHealthStatusText: String {
        if manager.authorizationStatusText == HealthKitPermissions.AuthorizationState.authorized.displayName {
            return "Apple Health conectado"
        }
        if manager.authorizationStatusText == HealthKitPermissions.AuthorizationState.denied.displayName {
            return "Apple Health no disponible"
        }
        return "Apple Health pendiente"
    }

    private var fitnessHealthModeText: String {
        ProcessInfo.processInfo.environment["SIMULATOR_DEVICE_NAME"] != nil ? "Mock data en simulador" : "Datos reales en dispositivo"
    }

    private func formatted(date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}
