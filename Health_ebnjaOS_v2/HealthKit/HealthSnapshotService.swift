import Foundation
import OSLog

@MainActor
final class HealthSnapshotService {
    private let logger = Logger(subsystem: "Health_ebnjaOS_v2", category: "HealthSnapshot")
    private let encoder: JSONEncoder
    private let decoder: JSONDecoder
    private let fileManager: FileManager

    init(fileManager: FileManager = .default) {
        self.fileManager = fileManager
        self.encoder = JSONEncoder()
        self.encoder.dateEncodingStrategy = .iso8601
        self.decoder = JSONDecoder()
        self.decoder.dateDecodingStrategy = .iso8601
    }

    func generateSnapshot(from snapshot: HealthSyncSnapshot) -> HealthSyncSnapshot {
        persist(snapshot)
        logger.info("Snapshot generated")
        return snapshot
    }

    func loadCachedSnapshot() -> HealthSyncSnapshot? {
        guard let url = cacheURL, fileManager.fileExists(atPath: url.path) else {
            return nil
        }

        do {
            let data = try Data(contentsOf: url)
            return try decoder.decode(HealthSyncSnapshot.self, from: data)
        } catch {
            logger.error("Failed to load cached snapshot: \(error.localizedDescription, privacy: .public)")
            return nil
        }
    }

    private func persist(_ snapshot: HealthSyncSnapshot) {
        guard let url = cacheURL else { return }

        do {
            try fileManager.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
            let data = try encoder.encode(snapshot)
            try data.write(to: url, options: [.atomic])
        } catch {
            logger.error("Failed to persist snapshot: \(error.localizedDescription, privacy: .public)")
        }
    }

    private var cacheURL: URL? {
        do {
            let directory = try fileManager.url(
                for: .applicationSupportDirectory,
                in: .userDomainMask,
                appropriateFor: nil,
                create: true
            )
            return directory
                .appendingPathComponent("Health_ebnjaOS_v2", isDirectory: true)
                .appendingPathComponent("health-snapshot-cache-v1.json")
        } catch {
            logger.error("Failed to resolve cache directory: \(error.localizedDescription, privacy: .public)")
            return nil
        }
    }
}
