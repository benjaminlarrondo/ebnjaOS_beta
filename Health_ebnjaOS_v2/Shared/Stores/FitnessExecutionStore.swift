import Foundation
import OSLog

@MainActor
final class FitnessExecutionStore: ObservableObject {
    @Published private(set) var routineFilter: FitnessRoutineFilter = .all
    @Published private(set) var selectedRoutineID: String
    @Published private(set) var lastCompletedRoutineID: String?
    @Published private(set) var lastCompletedAt: Date?
    @Published private(set) var activeSession: FitnessSessionLog?
    @Published private(set) var sessions: [FitnessSessionLog] = []
    @Published private(set) var setLogs: [FitnessSetLog] = []
    @Published private(set) var syncStatusText: String = "Local-first"
    @Published private(set) var lastUpdatedText: String = "Never"

    private let store = LocalCodableStore<FitnessExecutionPayload>(fileName: "fitness-execution-v3.json", category: "FitnessExecutionStore")
    private let logger = Logger(subsystem: "Health_ebnjaOS_v2", category: "FitnessExecution")

    init() {
        let initialRoutine = FitnessRoutineSeed.templates.first?.id ?? UUID().uuidString
        self.selectedRoutineID = initialRoutine
        restore()
    }

    var availableTemplates: [FitnessRoutineTemplate] {
        FitnessRoutineSeed.templates(for: routineFilter)
    }

    var recommendedTemplate: FitnessRoutineTemplate? {
        if let selected = FitnessRoutineSeed.template(for: selectedRoutineID), availableTemplates.contains(selected) {
            return selected
        }
        if let lastCompletedRoutineID, let next = FitnessRoutineSeed.nextTemplate(after: lastCompletedRoutineID), availableTemplates.contains(next) {
            return next
        }
        return availableTemplates.first
    }

    var nextTrainingTemplate: FitnessRoutineTemplate? {
        if let lastCompletedRoutineID, let next = FitnessRoutineSeed.nextTemplate(after: lastCompletedRoutineID), availableTemplates.contains(next) {
            return next
        }
        return availableTemplates.first
    }

    var lastWorkoutText: String {
        guard let lastCompletedAt else { return "No entrenos completados todavía" }
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return "Último entrenamiento · \(formatter.string(from: lastCompletedAt))"
    }

    var streakText: String {
        let count = sessions.count
        return count > 0 ? "\(count) sesiones registradas" : "Inicia tu primera sesión"
    }

    var weeklyVolumeText: String {
        let minutes = sessions.suffix(7).compactMap(\.durationMinutes).reduce(0, +)
        return "\(minutes) min"
    }

    func selectFilter(_ filter: FitnessRoutineFilter) {
        routineFilter = filter
        if let selected = FitnessRoutineSeed.template(for: selectedRoutineID), filter == .all || selected.family.rawValue == filter.rawValue {
            persist()
            return
        }

        if let first = availableTemplates.first {
            selectedRoutineID = first.id
        }
        persist()
    }

    func selectRoutine(_ routineID: String) {
        guard FitnessRoutineSeed.template(for: routineID) != nil else { return }
        selectedRoutineID = routineID
        persist()
    }

    func startSession(using template: FitnessRoutineTemplate? = nil) {
        let template = template ?? recommendedTemplate ?? FitnessRoutineSeed.templates.first!
        selectedRoutineID = template.id
        let session = FitnessSessionLog(
            id: UUID().uuidString,
            workoutDayID: template.workoutDay.id,
            routineID: template.id,
            startedAt: .now,
            finishedAt: nil,
            durationMinutes: nil,
            notes: nil
        )
        activeSession = session
        sessions.append(session)
        lastUpdatedText = Self.dateFormatter.string(from: .now)
        syncStatusText = "Pending sync"
        persist()
        logger.info("Started fitness session routine=\(template.id, privacy: .public)")
    }

    func completeSession(durationMinutes: Int? = nil, notes: String? = nil) {
        guard var session = activeSession else { return }
        session = FitnessSessionLog(
            id: session.id,
            workoutDayID: session.workoutDayID,
            routineID: session.routineID,
            startedAt: session.startedAt,
            finishedAt: .now,
            durationMinutes: durationMinutes,
            notes: notes
        )

        if let index = sessions.firstIndex(where: { $0.id == session.id }) {
            sessions[index] = session
        }

        activeSession = nil
        lastCompletedRoutineID = session.routineID
        lastCompletedAt = session.finishedAt
        selectedRoutineID = FitnessRoutineSeed.nextTemplate(after: session.routineID)?.id ?? session.routineID
        lastUpdatedText = Self.dateFormatter.string(from: .now)
        syncStatusText = "Local saved"
        persist()
        logger.info("Completed fitness session routine=\(session.routineID, privacy: .public)")
    }

    func logSet(_ set: FitnessSetLog) {
        setLogs.append(set)
        lastUpdatedText = Self.dateFormatter.string(from: .now)
        syncStatusText = "Local saved"
        persist()
    }

    private func restore() {
        guard let payload = store.load() else {
            selectedRoutineID = FitnessRoutineSeed.templates.first?.id ?? UUID().uuidString
            return
        }

        routineFilter = FitnessRoutineFilter(rawValue: payload.selectedFilter) ?? .all
        selectedRoutineID = payload.selectedRoutineID ?? FitnessRoutineSeed.templates.first?.id ?? UUID().uuidString
        lastCompletedRoutineID = payload.lastCompletedRoutineID
        lastCompletedAt = payload.lastCompletedAt
        activeSession = payload.activeSession
        sessions = payload.sessions
        setLogs = payload.setLogs
        syncStatusText = "Local restored"
        if let updatedAt = payload.activeSession?.startedAt ?? payload.sessions.last?.startedAt {
            lastUpdatedText = Self.dateFormatter.string(from: updatedAt)
        }
    }

    private func persist() {
        let payload = FitnessExecutionPayload(
            selectedFilter: routineFilter.rawValue,
            selectedRoutineID: selectedRoutineID,
            lastCompletedRoutineID: lastCompletedRoutineID,
            lastCompletedAt: lastCompletedAt,
            activeSession: activeSession,
            sessions: sessions,
            setLogs: setLogs
        )
        store.save(payload)
    }

    private static let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter
    }()
}
