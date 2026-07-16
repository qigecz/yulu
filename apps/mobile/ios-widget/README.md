# 渔路 iOS 桌面小组件（WidgetKit）

这是 **原生 Swift/WidgetKit** 实现，对照根目录 `widget-ios.html` 原型。包含 Medium（360×170）与 Small（170×170）两个尺寸：显示天气、最近钓点、附近坑点数，Medium 带「开始导航」深链按钮。

> ⚠️ **此代码在 Mac + Xcode 上构建验证。** Windows/Expo 环境无法编译 WidgetKit。下面是接入步骤。

## 文件

| 文件 | 作用 |
|------|------|
| `YuluWidget.swift` | `@main` Widget Bundle + `Provider`（TimelineProvider，每 30 分钟刷新）+ Entry |
| `YuluModels.swift` | Weather/Spot Codable 模型 + `YuluAPI`（URLSession 拉 `/api/weather`、`/api/spots`）+ `formatDistance` |
| `YuluWidgetViews.swift` | Medium/Small 两个 SwiftUI 视图，设计 token 内联（accent `#2a8f7a` 等） |

## 在 Xcode 接入（Mac）

1. 打开 Expo 生成的 iOS 工程：在项目根 `pnpm --filter @yulu/mobile exec expo prebuild` 后，用 Xcode 打开 `apps/mobile/ios/*.xcworkspace`。
2. **File → New → Target → Widget Extension**，命名 `YuluWidget`，语言 Swift，**不**勾 “Include Configuration App Intent”。
3. 删除 Xcode 生成的默认 `.swift`，把本目录三个 `.swift` 拖进新 Target（勾选目标 membership = YuluWidget）。
4. 改 `YuluConfig.apiBase` 指向你的 API（默认 `http://47.98.105.25/api`；iOS 需 HTTPS，正式上线域名+SSL 后改 `https://`）。
5. 在主 App 的 Info.plist 与 Widget 的 Info.plist 都开启 **App Groups**（如 `group.app.yulu`）以共享位置/数据（可选，当前用默认坐标 Miyun）。
6. 如需真实定位：在 Widget 里用 `CLLocationManager`（需 Widget target 勾选 Location capabilities）。
7. 编译运行 → 长按桌面添加「渔路」小组件。

## 深度链接

Medium/Small 的 `.widgetURL` 均指向 `yulu://home`，点击进 App。如需直达导航，改成 `yulu://route/<routeId>`——App 端 `apps/mobile/src/utils/deeplink.ts` 已处理该 scheme。

## 与 RN App 的关系

Widget 是独立的 iOS Extension，**不经过 React Native/Metro 打包**，直接用 SwiftUI + URLSession 调公共 API。数据来源与 App 一致（`/api/weather`、`/api/spots`）。
