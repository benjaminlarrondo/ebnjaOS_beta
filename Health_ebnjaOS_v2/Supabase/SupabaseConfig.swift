import Foundation

struct SupabaseConfig: Hashable, Sendable {
    let url: URL
    let anonKey: String
    let userID: UUID
    let deviceID: String

    static let defaultUserID = UUID(uuidString: "00000000-0000-0000-0000-000000000001")!

    static func load(
        bundle: Bundle = .main,
        environment: [String: String] = ProcessInfo.processInfo.environment
    ) -> SupabaseConfig? {
        Config.loadSupabaseConfig(bundle: bundle, environment: environment)
    }
}
