import Foundation
import OSLog

@MainActor
final class LocalCodableStore<Value: Codable> {
    private let fileName: String
    private let fileManager: FileManager
    private let encoder: JSONEncoder
    private let decoder: JSONDecoder
    private let logger: Logger

    init(fileName: String, subsystem: String = "Health_ebnjaOS_v2", category: String) {
        self.fileName = fileName
        self.fileManager = .default
        self.encoder = JSONEncoder()
        self.encoder.dateEncodingStrategy = .iso8601
        self.decoder = JSONDecoder()
        self.decoder.dateDecodingStrategy = .iso8601
        self.logger = Logger(subsystem: subsystem, category: category)
    }

    func load() -> Value? {
        guard let url = fileURL, fileManager.fileExists(atPath: url.path) else {
            return nil
        }

        do {
            let data = try Data(contentsOf: url)
            return try decoder.decode(Value.self, from: data)
        } catch {
            logger.error("Failed to load local store \(self.fileName, privacy: .public): \(error.localizedDescription, privacy: .public)")
            return nil
        }
    }

    func save(_ value: Value) {
        guard let url = fileURL else { return }

        do {
            try fileManager.createDirectory(
                at: url.deletingLastPathComponent(),
                withIntermediateDirectories: true
            )
            let data = try encoder.encode(value)
            try data.write(to: url, options: [.atomic])
        } catch {
            logger.error("Failed to save local store \(self.fileName, privacy: .public): \(error.localizedDescription, privacy: .public)")
        }
    }

    private var fileURL: URL? {
        do {
            let directory = try fileManager.url(
                for: .applicationSupportDirectory,
                in: .userDomainMask,
                appropriateFor: nil,
                create: true
            )
            return directory
                .appendingPathComponent("Health_ebnjaOS_v2", isDirectory: true)
                .appendingPathComponent(fileName)
        } catch {
            logger.error("Failed to resolve local store directory for \(self.fileName, privacy: .public): \(error.localizedDescription, privacy: .public)")
            return nil
        }
    }
}
