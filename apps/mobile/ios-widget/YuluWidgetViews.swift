import SwiftUI
import WidgetKit

// Design tokens (mirror apps/mobile packages/ui theme/tokens.ts)
private enum Yulu {
    static let accent = Color(red: 0x2a/255, green: 0x8f/255, blue: 0x7a/255)
    static let accentSoft = Color(red: 0x2a/255, green: 0x8f/255, blue: 0x7a/255).opacity(0.14)
    static let fg = Color(red: 0x1a/255, green: 0x24/255, blue: 0x20/255)
    static let muted = Color(red: 0x64/255, green: 0x7a/255, blue: 0x70/255)
    static let border = Color(red: 0xdc/255, green: 0xe2/255, blue: 0xdc/255)
}

struct YuluWidgetView: View {
    let entry: YuluEntry

    @Environment(\.widgetFamily) private var family

    var body: some View {
        switch family {
        case .systemSmall: SmallWidget(entry: entry)
        default: MediumWidget(entry: entry)
        }
    }
}

// MARK: - Medium (360×170)

struct MediumWidget: View {
    let entry: YuluEntry

    var body: some View {
        HStack(alignment: .center, spacing: 16) {
            VStack(alignment: .leading, spacing: 6) {
                Text("渔路").font(.system(size: 13, weight: .bold)).foregroundColor(Yulu.accent)
                weatherLine
                if let spot = entry.nearestSpot {
                    Text("\(spot.name) \(formatDistance(spot.distance))")
                        .font(.system(size: 13)).foregroundColor(Yulu.muted)
                        .lineLimit(1)
                }
                Spacer(minLength: 0)
                navButton
            }
            Spacer(minLength: 0)
            VStack(spacing: 6) {
                miniMap
                Text("\(entry.nearbyCount) 附近钓点")
                    .font(.system(size: 10, design: .monospaced)).foregroundColor(Yulu.muted)
            }
        }
        .padding(16)
        .widgetURL(URL(string: "yulu://home"))
    }

    private var weatherLine: some View {
        let w = entry.weather
        return HStack(alignment: .firstTextBaseline, spacing: 4) {
            Text("\(w?.temperature ?? 0)°C").font(.system(size: 24, weight: .bold)).foregroundColor(Yulu.fg)
            if let c = w?.condition {
                Text("\(c) · \(w?.windDirection ?? "") \(w?.windLevel ?? 0)级")
                    .font(.system(size: 14, weight: .medium)).foregroundColor(Yulu.muted)
            }
        }
    }

    private var navButton: some View {
        HStack(spacing: 4) {
            Image(systemName: "location.north.line.fill").font(.system(size: 11))
            Text("开始导航").font(.system(size: 12, weight: .semibold))
        }
        .padding(.horizontal, 12).padding(.vertical, 6)
        .background(Yulu.accent).foregroundColor(.white)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var miniMap: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 16)
                .fill(LinearGradient(colors: [Yulu.accentSoft, Yulu.fg.opacity(0.06)], startPoint: .topLeading, endPoint: .bottomTrailing))
            Circle().stroke(Yulu.border.opacity(0.4), lineWidth: 0.5)
                .frame(width: 80, height: 80)
            Circle().fill(Yulu.accent).frame(width: 14, height: 14)
                .overlay(Circle().stroke(.white, lineWidth: 2))
        }
        .frame(width: 80, height: 80)
    }
}

// MARK: - Small (170×170)

struct SmallWidget: View {
    let entry: YuluEntry

    var body: some View {
        VStack(spacing: 6) {
            ZStack {
                RoundedRectangle(cornerRadius: 14).fill(Yulu.accent).frame(width: 44, height: 44)
                Image(systemName: "mappin.circle.fill")
                    .font(.system(size: 22, weight: .semibold)).foregroundColor(.white)
            }
            Text("渔路").font(.system(size: 13, weight: .bold)).foregroundColor(Yulu.accent)
            Text("\(entry.nearbyCount)")
                .font(.system(size: 36, weight: .bold, design: .monospaced)).foregroundColor(Yulu.fg)
            Text("附近钓点").font(.system(size: 11)).foregroundColor(Yulu.muted)
            if let w = entry.weather {
                Text("\(w.temperature)°C · \(w.fishingAdvice ?? "")")
                    .font(.system(size: 12)).foregroundColor(Yulu.muted)
            }
        }
        .widgetURL(URL(string: "yulu://home"))
    }
}
