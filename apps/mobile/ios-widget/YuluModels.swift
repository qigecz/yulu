import Foundation

// MARK: - Models (mirror the API JSON shapes)

struct WidgetWeather: Codable {
    let temperature: Int
    let condition: String?
    let windDirection: String?
    let windLevel: Int?
    let fishingAdvice: String?

    static let preview = WidgetWeather(temperature: 26, condition: "晴", windDirection: "东南风", windLevel: 2, fishingAdvice: "宜出钓")
}

struct WidgetSpot: Codable {
    let id: String
    let name: String
    let distance: Double? // meters from the query point

    static let preview = WidgetSpot(id: "s1", name: "千岛湖 · 碧溪湾", distance: 2300)
}

// MARK: - API

enum YuluAPI {
    static func fetchWeather() async -> WidgetWeather? {
        await get("\(YuluConfig.apiBase)/weather")
    }

    static func fetchNearbySpots() async -> [WidgetSpot] {
        let lat = YuluConfig.defaultLat
        let lng = YuluConfig.defaultLng
        struct Wrapper: Codable { let data: [WidgetSpot] }
        // Pass lat/lng as query; the spots endpoint returns `distance` in meters.
        let result: Wrapper? = await get("\(YuluConfig.apiBase)/spots?lat=\(lat)&lng=\(lng)&radius=50000")
        return result?.data ?? []
    }

    private static func get<T: Decodable>(_ urlString: String) async -> T? {
        guard let url = URL(string: urlString) else { return nil }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            return try JSONDecoder().decode(T.self, from: data)
        } catch {
            return nil
        }
    }
}

// MARK: - Formatting helpers

/// "2.3km" or "350m", matching the app's formatDistance.
func formatDistance(_ meters: Double?) -> String {
    guard let m = meters else { return "" }
    return m >= 1000 ? String(format: "%.1fkm", m / 1000) : "\(Int(m))m"
}
