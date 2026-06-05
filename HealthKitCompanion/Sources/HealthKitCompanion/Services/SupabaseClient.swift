import Foundation

@MainActor
final class SupabaseClient: ObservableObject {
    @Published var endpointURL: URL?
    @Published var lastErrorMessage: String?

    private let session: URLSession
    private let configuration: SupabaseBridgeConfiguration
    private let bridgeBuilder = HealthFoundationBridgeBuilder()

    init(
        configuration: SupabaseBridgeConfiguration? = SupabaseBridgeConfiguration.live(),
        session: URLSession = .shared
    ) {
        self.configuration = configuration ?? SupabaseBridgeConfiguration(
            baseURL: URL(string: "https://example.supabase.co")!,
            anonKey: "anon",
            userId: "00000000-0000-0000-0000-000000000001",
            deviceId: "unknown-device"
        )
        self.session = session
        self.endpointURL = self.configuration.baseURL
    }

    var isConfigured: Bool {
        endpointURL != nil && configuration.anonKey != "anon"
    }

    func pullLastSync() async throws -> Date? {
        let row = try await pullHealthStateRow()
        return row.flatMap { Self.isoDateFormatter.date(from: $0.updated_at) }
    }

    func pushMetrics(upload: SnapshotUpload) async throws -> Int {
        let bodyRows = upload.bodyMetricRows
        guard !bodyRows.isEmpty else { return 0 }

        let remoteRows: [FitnessBodyMetricRow] = try await pullRows(
            table: "fitness_body_metrics",
            select: "user_id,date,body_weight,sleep_hours,steps_count,hrv_ms,resting_hr,source,external_id,external_updated_at,metadata"
        )

        let filtered = filterIncomingRows(bodyRows, against: remoteRows)
        guard !filtered.isEmpty else { return 0 }

        try await upsertRows(
            table: "fitness_body_metrics",
            rows: filtered,
            onConflict: "user_id,external_id"
        )

        return filtered.count
    }

    func pushWorkouts(upload: SnapshotUpload) async throws -> Int {
        let workoutRows = upload.workoutRows
        guard !workoutRows.isEmpty else { return 0 }

        let remoteRows: [FitnessWorkoutRow] = try await pullRows(
            table: "fitness_workouts",
            select: "user_id,title,date,type,duration_minutes,intensity,notes,source,external_id,external_updated_at,metadata"
        )

        let filtered = filterIncomingRows(workoutRows, against: remoteRows)
        guard !filtered.isEmpty else { return 0 }

        try await upsertRows(
            table: "fitness_workouts",
            rows: filtered,
            onConflict: "user_id,external_id"
        )

        return filtered.count
    }

    func pushHealthState(upload: SnapshotUpload) async throws -> Bool {
        try await upsertRows(
            table: "health_states",
            rows: [upload.healthStateRow],
            onConflict: "id"
        )
        return true
    }

    func upload(snapshot: HealthSnapshot) async throws -> SyncReport {
        let startedAt = Date()
        let upload = bridgeBuilder.buildUpload(
            snapshot: snapshot,
            deviceId: configuration.deviceId,
            userId: configuration.userId
        )

        let healthStateUploaded = try await pushHealthState(upload: upload)
        let metricsUploaded = try await pushMetrics(upload: upload)
        let workoutsUploaded = try await pushWorkouts(upload: upload)
        let lastRemoteSyncAt = try await pullLastSync()
        let finishedAt = Date()
        let deduplicatedRows = (upload.bodyMetricRows.count - metricsUploaded) + (upload.workoutRows.count - workoutsUploaded)

        let status: SyncReport.Status
        let message: String
        if metricsUploaded == upload.bodyMetricRows.count && workoutsUploaded == upload.workoutRows.count && healthStateUploaded {
            status = .success
            message = "Synced \(metricsUploaded) metric rows and \(workoutsUploaded) workout rows."
        } else if metricsUploaded > 0 || workoutsUploaded > 0 || healthStateUploaded {
            status = .partial
            message = "Partial sync completed."
        } else {
            status = .error
            message = "No rows were uploaded."
        }

        return SyncReport(
            status: status,
            startedAt: isoString(startedAt),
            finishedAt: isoString(finishedAt),
            snapshotId: upload.snapshot.id,
            lastRemoteSyncAt: lastRemoteSyncAt.map(isoString),
            metricsUploaded: metricsUploaded,
            workoutsUploaded: workoutsUploaded,
            healthStateUploaded: healthStateUploaded,
            deduplicatedRows: deduplicatedRows,
            message: message
        )
    }

    func exportSnapshotJSON(for snapshot: HealthSnapshot) throws -> Data {
        let upload = bridgeBuilder.buildUpload(
            snapshot: snapshot,
            deviceId: configuration.deviceId,
            userId: configuration.userId
        )

        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        encoder.dateEncodingStrategy = .iso8601
        return try encoder.encode(upload)
    }

    private func pullHealthStateRow() async throws -> HealthStateRow? {
        let rows: [HealthStateRow] = try await pullRows(
            table: "health_states",
            select: "id,user_id,state,updated_at"
        )
        return rows.first
    }

    private func pullRows<T: Decodable>(table: String, select: String) async throws -> [T] {
        let url = try makeURL(path: "/rest/v1/\(table)", queryItems: [
            .init(name: "select", value: select),
            .init(name: "user_id", value: "eq.\(configuration.userId)")
        ])

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        addHeaders(&request)

        let (data, response) = try await session.data(for: request)
        try validate(response: response, data: data)

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode([T].self, from: data)
    }

    private func upsertRows<T: Encodable>(table: String, rows: [T], onConflict: String) async throws {
        guard !rows.isEmpty else { return }

        let url = try makeURL(path: "/rest/v1/\(table)", queryItems: [
            .init(name: "on_conflict", value: onConflict)
        ])

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        addHeaders(&request)
        request.setValue("resolution=merge-duplicates,return=minimal", forHTTPHeaderField: "Prefer")

        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        request.httpBody = try encoder.encode(rows)

        let (data, response) = try await session.data(for: request)
        try validate(response: response, data: data)
    }

    private func makeURL(path: String, queryItems: [URLQueryItem]) throws -> URL {
        guard var components = URLComponents(url: configuration.baseURL, resolvingAgainstBaseURL: false) else {
            throw SupabaseBridgeError(message: "Invalid Supabase base URL")
        }
        components.path = path
        components.queryItems = queryItems
        guard let url = components.url else {
            throw SupabaseBridgeError(message: "Unable to build Supabase request URL")
        }
        return url
    }

    private func addHeaders(_ request: inout URLRequest) {
        request.setValue(configuration.anonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(configuration.anonKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    }

    private func validate(response: URLResponse, data: Data) throws {
        guard let httpResponse = response as? HTTPURLResponse else {
            throw SupabaseBridgeError(message: "Invalid Supabase response")
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            let body = String(data: data, encoding: .utf8) ?? ""
            throw SupabaseBridgeError(message: "Supabase \(httpResponse.statusCode): \(body)")
        }
    }

    private func filterIncomingRows<Row: ExternalUpdateComparable>(_ incoming: [Row], against remote: [Row]) -> [Row] {
        let remoteById = Dictionary(uniqueKeysWithValues: remote.map { ($0.externalId, $0) })
        return incoming.filter { row in
            guard let remoteRow = remoteById[row.externalId] else { return true }
            return row.externalUpdatedAt >= remoteRow.externalUpdatedAt
        }
    }

    private func isoString(_ date: Date) -> String {
        Self.isoDateFormatter.string(from: date)
    }

    nonisolated(unsafe) static let isoDateFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()
}

protocol ExternalUpdateComparable {
    var externalId: String { get }
    var externalUpdatedAt: Date { get }
}

extension FitnessBodyMetricRow: ExternalUpdateComparable {
    var externalId: String { external_id }
    var externalUpdatedAt: Date {
        guard let external_updated_at, let date = SupabaseClient.isoDateFormatter.date(from: external_updated_at) else {
            return .distantPast
        }
        return date
    }
}

extension FitnessWorkoutRow: ExternalUpdateComparable {
    var externalId: String { external_id }
    var externalUpdatedAt: Date {
        guard let external_updated_at, let date = SupabaseClient.isoDateFormatter.date(from: external_updated_at) else {
            return .distantPast
        }
        return date
    }
}
