import Foundation

enum BrainItemType: String, Codable, CaseIterable, Identifiable, Hashable {
    case note
    case idea
    case decision
    case task
    case project

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .note: return "Note"
        case .idea: return "Idea"
        case .decision: return "Decision"
        case .task: return "Task"
        case .project: return "Project"
        }
    }
}

struct BrainItem: Codable, Hashable, Identifiable {
    let id: UUID
    var title: String
    var content: String
    var type: BrainItemType
    var createdAt: Date
    var tags: [String]
    var linkedModule: String?
}

struct BrainPayload: Codable, Hashable {
    var items: [BrainItem]
    var lastUpdatedAt: Date
}
