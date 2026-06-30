import Foundation

enum FitnessRoutineFamily: String, Codable, CaseIterable, Identifiable, Hashable {
    case gym
    case home
    case recovery

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .gym: return "Gym"
        case .home: return "Casa"
        case .recovery: return "Recuperación"
        }
    }
}

struct FitnessExercisePlan: Codable, Hashable, Identifiable {
    let id: String
    let name: String
    let sets: Int
    let reps: String
    let targetWeight: String?
    let restSeconds: Int
    let sortOrder: Int
}

struct FitnessWorkoutDay: Codable, Hashable, Identifiable {
    let id: String
    let dayNumber: Int
    let name: String
    let description: String
    let family: FitnessRoutineFamily
    let exercises: [FitnessExercisePlan]
    let estimatedMinutes: Int
}

struct FitnessRoutineTemplate: Codable, Hashable, Identifiable {
    let id: String
    let name: String
    let family: FitnessRoutineFamily
    let description: String
    let workoutDay: FitnessWorkoutDay
}

struct FitnessSessionLog: Codable, Hashable, Identifiable {
    let id: String
    let workoutDayID: String
    let routineID: String
    let startedAt: Date
    let finishedAt: Date?
    let durationMinutes: Int?
    let notes: String?
}

struct FitnessSetLog: Codable, Hashable, Identifiable {
    let id: String
    let sessionID: String
    let exerciseName: String
    let setNumber: Int
    let weight: Double?
    let reps: Int?
    let completed: Bool
}

struct FitnessExecutionPayload: Codable, Hashable {
    let selectedFilter: String
    let selectedRoutineID: String?
    let lastCompletedRoutineID: String?
    let lastCompletedAt: Date?
    let activeSession: FitnessSessionLog?
    let sessions: [FitnessSessionLog]
    let setLogs: [FitnessSetLog]
}

enum FitnessRoutineFilter: String, Codable, CaseIterable, Identifiable {
    case all
    case gym
    case home

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .all: return "Todos"
        case .gym: return "Gym"
        case .home: return "Casa"
        }
    }
}
