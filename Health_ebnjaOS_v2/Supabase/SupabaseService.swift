import Foundation
import OSLog

struct SupabaseMutationResult: Hashable {
    let statusCode: Int
    let responseBody: String
    let rowCount: Int
}

@MainActor
final class SupabaseService {
    private let logger = Logger(subsystem: "Health_ebnjaOS_v2", category: "Supabase")
    private let config: SupabaseConfig
    private let session: URLSession
    private let encoder: JSONEncoder

    init(config: SupabaseConfig, session: URLSession = .shared) {
        self.config = config
        self.session = session
        self.encoder = JSONEncoder()
        self.encoder.dateEncodingStrategy = .iso8601
        self.encoder.keyEncodingStrategy = .convertToSnakeCase
    }

    func upsertBodyMetrics(_ records: [HealthBodyMetricPayload]) async throws -> SupabaseMutationResult {
        try await upsertFiltered(
            table: "fitness_body_metrics",
            conflictColumns: "id",
            select: "id,user_id,date,body_weight,sleep_hours,energy_level,steps_count,hrv_ms,resting_hr,source,external_id,external_updated_at,metadata",
            records: records
        )
    }

    func upsertHealthState(_ record: HealthStatePayload) async throws -> SupabaseMutationResult {
        try await upsert(
            table: "health_states",
            conflictColumns: "id",
            records: [record]
        )
    }

    func upsertWorkouts(_ records: [HealthWorkoutPayload]) async throws -> SupabaseMutationResult {
        try await upsertFiltered(
            table: "fitness_workouts",
            conflictColumns: "id",
            select: "id,user_id,title,date,type,duration_minutes,intensity,notes,source,external_id,external_updated_at,metadata",
            records: records
        )
    }

    func pullLastSync() async throws -> Date? {
        let rows: [HealthStateRemoteRow] = try await pullRows(
            table: "health_states",
            select: "updated_at",
            order: "updated_at.desc",
            limit: 1
        )
        return rows.first?.updatedAt
    }

    private func upsert<T: Encodable>(
        table: String,
        conflictColumns: String,
        records: [T]
    ) async throws -> SupabaseMutationResult {
        guard !records.isEmpty else {
            return SupabaseMutationResult(statusCode: 200, responseBody: "[]", rowCount: 0)
        }

        var request = URLRequest(
            url: config.url
                .appendingPathComponent("rest/v1")
                .appendingPathComponent(table)
                .appending(queryItems: [URLQueryItem(name: "on_conflict", value: conflictColumns)])
        )
        request.httpMethod = "POST"
        addHeaders(&request)
        request.setValue("return=representation,resolution=merge-duplicates", forHTTPHeaderField: "Prefer")
        request.httpBody = try encoder.encode(records)

        logger.info("Supabase upsert request table=\(table, privacy: .public) rows=\(records.count, privacy: .public)")
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            let message = "Supabase response missing HTTP status for table \(table)."
            logger.error("\(message, privacy: .public)")
            throw SupabaseServiceError.invalidResponse(message)
        }

        let body = String(data: data, encoding: .utf8) ?? ""
        logger.info("Supabase upsert response table=\(table, privacy: .public) status=\(httpResponse.statusCode, privacy: .public)")

        guard (200...299).contains(httpResponse.statusCode) else {
            let message = "Supabase upsert failed for \(table) with status \(httpResponse.statusCode): \(body)"
            logger.error("\(message, privacy: .public)")
            throw SupabaseServiceError.requestFailed(message)
        }

        return SupabaseMutationResult(statusCode: httpResponse.statusCode, responseBody: body, rowCount: records.count)
    }

    private func upsertFiltered<T: Encodable & Decodable & ExternalUpdateComparable>(
        table: String,
        conflictColumns: String,
        select: String,
        records: [T]
    ) async throws -> SupabaseMutationResult {
        guard !records.isEmpty else {
            return SupabaseMutationResult(statusCode: 200, responseBody: "[]", rowCount: 0)
        }

        let remoteRows: [T] = try await pullRows(table: table, select: select)
        let filtered = filterIncomingRows(records, against: remoteRows)

        guard !filtered.isEmpty else {
            return SupabaseMutationResult(statusCode: 200, responseBody: "[]", rowCount: 0)
        }

        return try await upsert(
            table: table,
            conflictColumns: conflictColumns,
            records: filtered
        )
    }

    private func pullRows<T: Decodable>(
        table: String,
        select: String,
        order: String? = nil,
        limit: Int? = nil
    ) async throws -> [T] {
        var queryItems = [
            URLQueryItem(name: "select", value: select),
            URLQueryItem(name: "user_id", value: "eq.\(config.userID.uuidString)")
        ]
        if let order {
            queryItems.append(URLQueryItem(name: "order", value: order))
        }
        if let limit {
            queryItems.append(URLQueryItem(name: "limit", value: String(limit)))
        }

        let url = try makeURL(path: "/rest/v1/\(table)", queryItems: queryItems)
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        addHeaders(&request)

        logger.info("Supabase pull request table=\(table, privacy: .public)")
        let (data, response) = try await session.data(for: request)
        try validate(response: response, data: data, table: table)

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        let rows = try decoder.decode([T].self, from: data)
        logger.info("Supabase pull response table=\(table, privacy: .public) rows=\(rows.count, privacy: .public)")
        return rows
    }

    private func validate(response: URLResponse, data: Data, table: String) throws {
        guard let httpResponse = response as? HTTPURLResponse else {
            throw SupabaseServiceError.invalidResponse("Invalid Supabase response for \(table).")
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            let body = String(data: data, encoding: .utf8) ?? ""
            let message = "Supabase \(table) failed with status \(httpResponse.statusCode): \(body)"
            logger.error("\(message, privacy: .public)")
            throw SupabaseServiceError.requestFailed(message)
        }
    }

    private func makeURL(path: String, queryItems: [URLQueryItem]) throws -> URL {
        guard var components = URLComponents(url: config.url, resolvingAgainstBaseURL: false) else {
            throw SupabaseServiceError.invalidConfiguration
        }
        components.path = path
        components.queryItems = queryItems
        guard let url = components.url else {
            throw SupabaseServiceError.invalidConfiguration
        }
        return url
    }

    private func addHeaders(_ request: inout URLRequest) {
        request.setValue(config.anonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(config.anonKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    }

    private func filterIncomingRows<Row: ExternalUpdateComparable>(_ incoming: [Row], against remote: [Row]) -> [Row] {
        let remoteById = Dictionary(uniqueKeysWithValues: remote.map { ($0.externalId, $0) })
        return incoming.filter { row in
            guard let remoteRow = remoteById[row.externalId] else { return true }
            return row.externalUpdatedAt >= remoteRow.externalUpdatedAt
        }
    }
}

protocol ExternalUpdateComparable {
    var externalId: String { get }
    var externalUpdatedAt: Date { get }
}

extension HealthBodyMetricPayload: ExternalUpdateComparable {}
extension HealthWorkoutPayload: ExternalUpdateComparable {}

struct HealthStateRemoteRow: Decodable {
    let updatedAt: Date

    private enum CodingKeys: String, CodingKey {
        case updatedAt = "updated_at"
    }
}

enum SupabaseServiceError: LocalizedError {
    case invalidConfiguration
    case invalidResponse(String)
    case requestFailed(String)

    var errorDescription: String? {
        switch self {
        case .invalidConfiguration:
            return "Supabase configuration is incomplete."
        case .invalidResponse(let message), .requestFailed(let message):
            return message
        }
    }
}

private extension URL {
    func appending(queryItems: [URLQueryItem]) -> URL {
        guard var components = URLComponents(url: self, resolvingAgainstBaseURL: false) else {
            return self
        }

        let existingItems = components.queryItems ?? []
        components.queryItems = existingItems + queryItems
        return components.url ?? self
    }
}
