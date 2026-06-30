import Foundation
import OSLog

@MainActor
final class BrainStore: ObservableObject {
    @Published private(set) var items: [BrainItem] = []
    @Published var searchText: String = ""
    @Published var selectedFilter: BrainItemType? = nil
    @Published private(set) var lastUpdatedText: String = "Never"
    @Published private(set) var syncStatusText: String = "Local-first"

    private let store = LocalCodableStore<BrainPayload>(fileName: "brain-v1.json", category: "BrainStore")
    private let logger = Logger(subsystem: "Health_ebnjaOS_v2", category: "Brain")

    init() {
        restore()
    }

    var inboxCount: Int {
        items.filter { $0.type == .note || $0.type == .idea }.count
    }

    var filteredItems: [BrainItem] {
        items
            .filter { item in
                selectedFilter.map { item.type == $0 } ?? true
            }
            .filter { item in
                guard !searchText.isEmpty else { return true }
                let lowercased = searchText.lowercased()
                return item.title.lowercased().contains(lowercased) || item.content.lowercased().contains(lowercased)
            }
            .sorted { $0.createdAt > $1.createdAt }
    }

    var lastCaptureText: String {
        guard let item = items.first else { return "Inbox vacío" }
        return item.title
    }

    func addItem(title: String, content: String, type: BrainItemType, tags: [String] = [], linkedModule: String? = nil) {
        let item = BrainItem(
            id: UUID(),
            title: title,
            content: content,
            type: type,
            createdAt: .now,
            tags: tags,
            linkedModule: linkedModule
        )
        items.insert(item, at: 0)
        persist()
        logger.info("Brain item added type=\(type.rawValue, privacy: .public)")
    }

    func remove(_ item: BrainItem) {
        items.removeAll { $0.id == item.id }
        persist()
    }

    func toggleFilter(_ filter: BrainItemType?) {
        selectedFilter = filter
    }

    private func restore() {
        guard let payload = store.load() else { return }
        items = payload.items
        lastUpdatedText = Self.dateFormatter.string(from: payload.lastUpdatedAt)
        syncStatusText = "Local restored"
    }

    private func persist() {
        let payload = BrainPayload(items: items, lastUpdatedAt: .now)
        lastUpdatedText = Self.dateFormatter.string(from: payload.lastUpdatedAt)
        syncStatusText = "Local saved"
        store.save(payload)
    }

    private static let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter
    }()
}
