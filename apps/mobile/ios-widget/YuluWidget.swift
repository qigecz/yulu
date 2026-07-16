import WidgetKit
import SwiftUI

// MARK: - Config
// Configure per environment. The widget runs in its own process, so it talks to
// the public API directly (no shared React Native state).
enum YuluConfig {
    static let apiBase = "http://47.98.105.25/api"
    // Fallback location when no user location is available (Miyun reservoir).
    static let defaultLat = 40.52
    static let defaultLng = 116.92
}

// MARK: - Timeline Entry
struct YuluEntry: TimelineEntry {
    let date: Date
    let weather: WidgetWeather?
    let nearestSpot: WidgetSpot?
    let nearbyCount: Int
    let loading: Bool
}

// MARK: - Provider
struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> YuluEntry {
        YuluEntry(date: Date(), weather: .preview, nearestSpot: .preview, nearbyCount: 3, loading: false)
    }

    func getSnapshot(in context: Context, completion: @escaping (YuluEntry) -> Void) {
        completion(YuluEntry(date: Date(), weather: .preview, nearestSpot: .preview, nearbyCount: 3, loading: false))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<YuluEntry>) -> Void) {
        Task {
            let entry = await fetchEntry()
            // Refresh every 30 minutes.
            let next = Date().addingTimeInterval(30 * 60)
            completion(Timeline(entries: [entry], policy: .after(next)))
        }
    }

    private func fetchEntry() async -> YuluEntry {
        async let weather = YuluAPI.fetchWeather()
        async let spots = YuluAPI.fetchNearbySpots()
        let (w, s) = await (weather, spots)
        let nearest = s.first
        return YuluEntry(date: Date(), weather: w, nearestSpot: nearest, nearbyCount: s.count, loading: false)
    }
}

// MARK: - Widget bundle
@main
struct YuluWidgetBundle: WidgetBundle {
    var body: some Widget { YuluWidget() }
}

struct YuluWidget: Widget {
    let kind = "YuluWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            YuluWidgetView(entry: entry)
                .containerBackground(for: .widget) { Color.white }
        }
        .configurationDisplayName("渔路")
        .description("查看附近钓点、天气，一键开始导航。")
        .supportedFamilies([.systemMedium, .systemSmall])
    }
}
