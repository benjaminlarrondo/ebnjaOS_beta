import Foundation
import OSLog

enum Config {
    private static let logger = Logger(subsystem: "Health_ebnjaOS_v2", category: "Config")

    static func loadSupabaseConfig(
        bundle: Bundle = .main,
        environment: [String: String] = ProcessInfo.processInfo.environment
    ) -> SupabaseConfig? {
        do {
            return try validatedSupabaseConfig(bundle: bundle, environment: environment)
        } catch {
            logger.error("Supabase configuration error: \(error.localizedDescription, privacy: .public)")
            return nil
        }
    }

    static func validatedSupabaseConfig(
        bundle: Bundle = .main,
        environment: [String: String] = ProcessInfo.processInfo.environment
    ) throws -> SupabaseConfig {
        guard let anonKey = readValue(for: "SUPABASE_ANON_KEY", bundle: bundle, environment: environment) else {
            throw ConfigError.missing("SUPABASE_ANON_KEY")
        }

        guard let url = readURL(bundle: bundle, environment: environment) else {
            throw ConfigError.missing("SUPABASE_URL")
        }

        let userID = readValue(for: "SUPABASE_USER_ID", bundle: bundle, environment: environment)
            .flatMap(UUID.init(uuidString:))
            ?? readValue(for: "VITE_SINGLE_USER_ID", bundle: bundle, environment: environment).flatMap(UUID.init(uuidString:))
            ?? SupabaseConfig.defaultUserID

        let deviceID = readValue(for: "SUPABASE_DEVICE_ID", bundle: bundle, environment: environment)
            ?? "unknown-device"

        return SupabaseConfig(url: url, anonKey: anonKey, userID: userID, deviceID: deviceID)
    }

    private static func readURL(bundle: Bundle, environment: [String: String]) -> URL? {
        if let rawURL = readValue(for: "SUPABASE_URL", bundle: bundle, environment: environment),
           let url = normalizedBaseURL(from: rawURL) {
            return url
        }

        guard
            let scheme = readValue(for: "SUPABASE_SCHEME", bundle: bundle, environment: environment),
            let host = readValue(for: "SUPABASE_HOST", bundle: bundle, environment: environment)
        else {
            return nil
        }

        let path = readValue(for: "SUPABASE_PATH", bundle: bundle, environment: environment) ?? "/"
        return normalizedBaseURL(from: "\(scheme)://\(host)\(path)")
    }

    private static func normalizedBaseURL(from string: String?) -> URL? {
        guard let string, !string.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            return nil
        }
        guard var components = URLComponents(string: string) else { return nil }
        guard let host = components.host, !host.isEmpty else { return nil }
        let trimmedPath = components.path.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        if trimmedPath == "rest/v1" {
            components.path = "/"
        } else if components.path.isEmpty {
            components.path = "/"
        }
        components.query = nil
        components.fragment = nil
        return components.url
    }

    private static func readValue(
        for key: String,
        bundle: Bundle,
        environment: [String: String]
    ) -> String? {
        if let environmentValue = environment[key]?.trimmingCharacters(in: .whitespacesAndNewlines),
           !environmentValue.isEmpty {
            return environmentValue
        }

        if let plistValue = bundle.object(forInfoDictionaryKey: key) as? String {
            let trimmed = plistValue.trimmingCharacters(in: .whitespacesAndNewlines)
            if !trimmed.isEmpty {
                return trimmed
            }
        }

        return nil
    }
}

enum ConfigError: LocalizedError {
    case missing(String)

    var errorDescription: String? {
        switch self {
        case .missing(let key):
            return "Missing required Supabase configuration value: \(key). Add it to Secrets.xcconfig, Info.plist, or environment variables."
        }
    }
}
