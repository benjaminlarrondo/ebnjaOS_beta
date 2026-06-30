import Foundation

enum FitnessRoutineSeed {
    static let templates: [FitnessRoutineTemplate] = [
        makeGymPower(),
        makeGymUpper(),
        makeGymFullBody(),
        makeHomeStrengthA(),
        makeHomeMetabolic(),
        makeHomeStrengthB()
    ]

    static let canonicalOrder: [String] = templates.map(\.id)

    static var activeProgramName: String {
        "BenjaOS Training System"
    }

    static func template(for id: String) -> FitnessRoutineTemplate? {
        templates.first { $0.id == id }
    }

    static func nextTemplate(after routineID: String?) -> FitnessRoutineTemplate? {
        guard let routineID, let index = canonicalOrder.firstIndex(of: routineID) else {
            return templates.first
        }
        let nextIndex = canonicalOrder.index(after: index)
        return canonicalOrder.indices.contains(nextIndex) ? template(for: canonicalOrder[nextIndex]) : templates.first
    }

    static func templates(for filter: FitnessRoutineFilter) -> [FitnessRoutineTemplate] {
        switch filter {
        case .all: return templates
        case .gym: return templates.filter { $0.family == .gym }
        case .home: return templates.filter { $0.family == .home }
        }
    }

    private static func makeGymPower() -> FitnessRoutineTemplate {
        let day = FitnessWorkoutDay(
            id: "gym-1",
            dayNumber: 1,
            name: "Entrenamiento 1 — Gym / Fuerza principal",
            description: "Foco en squat, peso muerto y básicos pesados.",
            family: .gym,
            exercises: [
                .init(id: "gym-1-1", name: "Back squat", sets: 1, reps: "Calentamiento progresivo", targetWeight: nil, restSeconds: 90, sortOrder: 1),
                .init(id: "gym-1-2", name: "Back squat", sets: 6, reps: "6–8", targetWeight: "Progresivo", restSeconds: 180, sortOrder: 2),
                .init(id: "gym-1-3", name: "Peso muerto rumano o convencional", sets: 4, reps: "6–8", targetWeight: nil, restSeconds: 150, sortOrder: 3),
                .init(id: "gym-1-4", name: "Press banca", sets: 5, reps: "6–8", targetWeight: nil, restSeconds: 150, sortOrder: 4),
                .init(id: "gym-1-5", name: "Remo barra o máquina", sets: 4, reps: "8–10", targetWeight: nil, restSeconds: 120, sortOrder: 5),
                .init(id: "gym-1-6", name: "Elevaciones laterales", sets: 3, reps: "15", targetWeight: nil, restSeconds: 60, sortOrder: 6),
                .init(id: "gym-1-7", name: "Curl bíceps", sets: 3, reps: "12", targetWeight: nil, restSeconds: 60, sortOrder: 7),
                .init(id: "gym-1-8", name: "Tríceps polea", sets: 3, reps: "12", targetWeight: nil, restSeconds: 60, sortOrder: 8),
                .init(id: "gym-1-9", name: "Crunch polea o hanging knee raises", sets: 4, reps: "12–15", targetWeight: nil, restSeconds: 45, sortOrder: 9)
            ],
            estimatedMinutes: 50
        )
        return .init(id: day.id, name: day.name, family: .gym, description: day.description, workoutDay: day)
    }

    private static func makeGymUpper() -> FitnessRoutineTemplate {
        let day = FitnessWorkoutDay(
            id: "gym-2",
            dayNumber: 2,
            name: "Entrenamiento 2 — Gym / Tren superior + Fuerza",
            description: "Potencia, empuje y tirón para tren superior.",
            family: .gym,
            exercises: [
                .init(id: "gym-2-1", name: "Clean técnico / potencia", sets: 6, reps: "3", targetWeight: "Liviano-moderado", restSeconds: 90, sortOrder: 1),
                .init(id: "gym-2-2", name: "Press militar", sets: 5, reps: "6–8", targetWeight: nil, restSeconds: 150, sortOrder: 2),
                .init(id: "gym-2-3", name: "Dominadas / jalón al pecho", sets: 5, reps: "8–10", targetWeight: nil, restSeconds: 120, sortOrder: 3),
                .init(id: "gym-2-4", name: "Press inclinado mancuernas", sets: 4, reps: "8–10", targetWeight: nil, restSeconds: 120, sortOrder: 4),
                .init(id: "gym-2-5", name: "Remo sentado", sets: 4, reps: "10", targetWeight: nil, restSeconds: 120, sortOrder: 5),
                .init(id: "gym-2-6", name: "Curl barra o mancuerna", sets: 4, reps: "10–12", targetWeight: nil, restSeconds: 60, sortOrder: 6),
                .init(id: "gym-2-7", name: "Fondos o tríceps cuerda", sets: 4, reps: "10–12", targetWeight: nil, restSeconds: 60, sortOrder: 7),
                .init(id: "gym-2-8", name: "Ab wheel", sets: 4, reps: "8–12", targetWeight: nil, restSeconds: 45, sortOrder: 8),
                .init(id: "gym-2-9", name: "Pallof press", sets: 3, reps: "12 por lado", targetWeight: nil, restSeconds: 45, sortOrder: 9)
            ],
            estimatedMinutes: 50
        )
        return .init(id: day.id, name: day.name, family: .gym, description: day.description, workoutDay: day)
    }

    private static func makeGymFullBody() -> FitnessRoutineTemplate {
        let day = FitnessWorkoutDay(
            id: "gym-3",
            dayNumber: 3,
            name: "Entrenamiento 3 — Gym / Full body pesado",
            description: "Carga alta, básicos y volumen moderado.",
            family: .gym,
            exercises: [
                .init(id: "gym-3-1", name: "Front squat", sets: 5, reps: "5", targetWeight: nil, restSeconds: 180, sortOrder: 1),
                .init(id: "gym-3-2", name: "Bench press", sets: 5, reps: "5", targetWeight: nil, restSeconds: 180, sortOrder: 2),
                .init(id: "gym-3-3", name: "Peso muerto", sets: 4, reps: "5", targetWeight: nil, restSeconds: 180, sortOrder: 3),
                .init(id: "gym-3-4", name: "Dominadas", sets: 4, reps: "Series", targetWeight: nil, restSeconds: 120, sortOrder: 4),
                .init(id: "gym-3-5", name: "Farmer walk", sets: 4, reps: "40 m", targetWeight: nil, restSeconds: 90, sortOrder: 5),
                .init(id: "gym-3-6", name: "Hanging raises", sets: 4, reps: "10–12", targetWeight: nil, restSeconds: 45, sortOrder: 6)
            ],
            estimatedMinutes: 45
        )
        return .init(id: day.id, name: day.name, family: .gym, description: day.description, workoutDay: day)
    }

    private static func makeHomeStrengthA() -> FitnessRoutineTemplate {
        let day = FitnessWorkoutDay(
            id: "home-4",
            dayNumber: 4,
            name: "Entrenamiento 4 — Casa / Fuerza A + Brazos + Core",
            description: "Calentamiento, fuerza unilateral y core.",
            family: .home,
            exercises: [
                .init(id: "home-4-1", name: "Movilidad hombros/cadera", sets: 1, reps: "8 min", targetWeight: nil, restSeconds: 0, sortOrder: 1),
                .init(id: "home-4-2", name: "Sentadillas aire", sets: 1, reps: "20", targetWeight: nil, restSeconds: 20, sortOrder: 2),
                .init(id: "home-4-3", name: "Flexiones", sets: 1, reps: "10", targetWeight: nil, restSeconds: 20, sortOrder: 3),
                .init(id: "home-4-4", name: "Band pull-aparts", sets: 1, reps: "20", targetWeight: nil, restSeconds: 20, sortOrder: 4),
                .init(id: "home-4-5", name: "Goblet squat con mancuerna + chaleco", sets: 5, reps: "10", targetWeight: nil, restSeconds: 90, sortOrder: 5),
                .init(id: "home-4-6", name: "Bulgarian split squat", sets: 4, reps: "8 por pierna", targetWeight: nil, restSeconds: 90, sortOrder: 6),
                .init(id: "home-4-7", name: "Press banca con mancuernas", sets: 5, reps: "8–10", targetWeight: nil, restSeconds: 90, sortOrder: 7),
                .init(id: "home-4-8", name: "Flexiones con chaleco", sets: 4, reps: "AMRAP controlado", targetWeight: nil, restSeconds: 90, sortOrder: 8),
                .init(id: "home-4-9", name: "Peso muerto rumano con mancuernas", sets: 5, reps: "10", targetWeight: nil, restSeconds: 90, sortOrder: 9),
                .init(id: "home-4-10", name: "Remo mancuerna a una mano", sets: 4, reps: "10 por lado", targetWeight: nil, restSeconds: 75, sortOrder: 10),
                .init(id: "home-4-11", name: "Dominadas o negativas", sets: 4, reps: "Series", targetWeight: nil, restSeconds: 90, sortOrder: 11),
                .init(id: "home-4-12", name: "Face pulls con banda", sets: 4, reps: "20", targetWeight: nil, restSeconds: 45, sortOrder: 12),
                .init(id: "home-4-13", name: "Ab wheel", sets: 4, reps: "8–12", targetWeight: nil, restSeconds: 45, sortOrder: 13),
                .init(id: "home-4-14", name: "Plancha", sets: 3, reps: "45–60 seg", targetWeight: nil, restSeconds: 45, sortOrder: 14)
            ],
            estimatedMinutes: 50
        )
        return .init(id: day.id, name: day.name, family: .home, description: day.description, workoutDay: day)
    }

    private static func makeHomeMetabolic() -> FitnessRoutineTemplate {
        let day = FitnessWorkoutDay(
            id: "home-5",
            dayNumber: 5,
            name: "Entrenamiento 5 — Casa / Metabólico + Brazos",
            description: "Circuitos, brazos y core con buen ritmo.",
            family: .home,
            exercises: [
                .init(id: "home-5-1", name: "Calentamiento", sets: 1, reps: "8 min", targetWeight: nil, restSeconds: 0, sortOrder: 1),
                .init(id: "home-5-2", name: "Thrusters con mancuernas", sets: 5, reps: "10", targetWeight: nil, restSeconds: 90, sortOrder: 2),
                .init(id: "home-5-3", name: "Remo renegado", sets: 5, reps: "8 por lado", targetWeight: nil, restSeconds: 90, sortOrder: 3),
                .init(id: "home-5-4", name: "Zancadas con chaleco", sets: 5, reps: "12 por pierna", targetWeight: nil, restSeconds: 90, sortOrder: 4),
                .init(id: "home-5-5", name: "Push press mancuernas", sets: 5, reps: "10", targetWeight: nil, restSeconds: 90, sortOrder: 5),
                .init(id: "home-5-6", name: "Curl bíceps banda", sets: 4, reps: "15–20", targetWeight: nil, restSeconds: 45, sortOrder: 6),
                .init(id: "home-5-7", name: "Extensión tríceps banda", sets: 4, reps: "15–20", targetWeight: nil, restSeconds: 45, sortOrder: 7),
                .init(id: "home-5-8", name: "Curl concentrado mancuerna", sets: 3, reps: "12 por lado", targetWeight: nil, restSeconds: 45, sortOrder: 8),
                .init(id: "home-5-9", name: "Dead bug", sets: 3, reps: "12", targetWeight: nil, restSeconds: 30, sortOrder: 9),
                .init(id: "home-5-10", name: "Russian twist con mancuerna", sets: 3, reps: "20", targetWeight: nil, restSeconds: 30, sortOrder: 10),
                .init(id: "home-5-11", name: "Plancha lateral", sets: 3, reps: "30 seg por lado", targetWeight: nil, restSeconds: 30, sortOrder: 11)
            ],
            estimatedMinutes: 50
        )
        return .init(id: day.id, name: day.name, family: .home, description: day.description, workoutDay: day)
    }

    private static func makeHomeStrengthB() -> FitnessRoutineTemplate {
        let day = FitnessWorkoutDay(
            id: "home-6",
            dayNumber: 6,
            name: "Entrenamiento 6 — Casa / Fuerza B + WOD",
            description: "Fuerza, WOD corto y brazos bandas.",
            family: .home,
            exercises: [
                .init(id: "home-6-1", name: "Sentadilla con chaleco", sets: 5, reps: "15", targetWeight: nil, restSeconds: 75, sortOrder: 1),
                .init(id: "home-6-2", name: "Peso muerto rumano mancuernas", sets: 5, reps: "10", targetWeight: nil, restSeconds: 75, sortOrder: 2),
                .init(id: "home-6-3", name: "Press piso mancuernas", sets: 5, reps: "10", targetWeight: nil, restSeconds: 75, sortOrder: 3),
                .init(id: "home-6-4", name: "Remo inclinado mancuernas", sets: 5, reps: "10", targetWeight: nil, restSeconds: 75, sortOrder: 4),
                .init(id: "home-6-5", name: "Burpees", sets: 1, reps: "10", targetWeight: nil, restSeconds: 0, sortOrder: 5),
                .init(id: "home-6-6", name: "Swings con mancuerna", sets: 1, reps: "12", targetWeight: nil, restSeconds: 0, sortOrder: 6),
                .init(id: "home-6-7", name: "Flexiones", sets: 1, reps: "10", targetWeight: nil, restSeconds: 0, sortOrder: 7),
                .init(id: "home-6-8", name: "Goblet squats", sets: 1, reps: "12", targetWeight: nil, restSeconds: 0, sortOrder: 8),
                .init(id: "home-6-9", name: "Mountain climbers", sets: 1, reps: "20", targetWeight: nil, restSeconds: 0, sortOrder: 9),
                .init(id: "home-6-10", name: "Curl banda", sets: 3, reps: "20", targetWeight: nil, restSeconds: 30, sortOrder: 10),
                .init(id: "home-6-11", name: "Tríceps banda", sets: 3, reps: "20", targetWeight: nil, restSeconds: 30, sortOrder: 11),
                .init(id: "home-6-12", name: "Face pulls", sets: 3, reps: "20", targetWeight: nil, restSeconds: 30, sortOrder: 12),
                .init(id: "home-6-13", name: "Hollow hold", sets: 4, reps: "30 seg", targetWeight: nil, restSeconds: 30, sortOrder: 13),
                .init(id: "home-6-14", name: "Bicycle crunch", sets: 3, reps: "30", targetWeight: nil, restSeconds: 30, sortOrder: 14)
            ],
            estimatedMinutes: 50
        )
        return .init(id: day.id, name: day.name, family: .home, description: day.description, workoutDay: day)
    }
}
