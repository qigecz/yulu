# Mapbox 地图与航点导航 — 接入指南

渔路的地图层基于 [`@rnmapbox/maps`](https://github.com/rnmapbox/maps)（Mapbox）。导航形态为**航点引导**（绘制有序坑点连线 + 用户位置，按距离推进坑点，计算 ETA/进度），不接入道路级逐向导航——钓鱼坑点是水面点，路网算路不适用。

## 前置条件

1. **Mapbox 访问令牌**：到 [mapbox.com](https://account.mapbox.com/) 申请一个公开 token，填入 `apps/mobile/app.json` 的 `expo.extra.mapboxAccessToken`。未填则底图空白（pin 与连线仍会渲染）。
2. **开发构建（Development Build）**：`@rnmapbox/maps` 含原生代码，**不能用 Expo Go**。首次运行需 prebuild 生成原生工程：

```bash
# 安装依赖（已在 package.json 声明 @rnmapbox/maps）
pnpm install

# 生成 ios / android 原生工程
pnpm --filter @yulu/mobile exec expo prebuild

# 运行（开发构建，替代 Expo Go）
pnpm --filter @yulu/mobile run:ios      # 需 Apple 开发者账号 / 模拟器
pnpm --filter @yulu/mobile run:android  # 需 Android 模拟器或真机
```

后续修改 TS 代码用 `pnpm --filter @yulu/mobile start` 走 Metro 热更新即可；只有改动原生插件/`app.json` 的 `plugins` 才需要重新 prebuild。

## 权限

`app.json` 已配置：
- iOS `NSLocationWhenInUseUsageDescription`
- Android `ACCESS_COARSE_LOCATION` / `ACCESS_FINE_LOCATION`
- `expo-location` 插件

运行时由 `hooks/useLocation.ts` 的 `requestForegroundPermissionsAsync` 弹窗请求；拒绝后回退到路线首个坑点坐标，地图仍可显示。

## 模块速览

| 文件 | 作用 |
|------|------|
| `src/components/map/RouteMap.tsx` | 全屏地图：done/remaining 双色连线、三态航点 pin、用户位置点；`forwardRef` 暴露 `zoomBy/flyTo/fitRoute` |
| `src/components/map/SpotsMap.tsx` | SpotsScreen 260px 地图：附近坑点真实坐标 pin |
| `src/hooks/useLocation.ts` | expo-location 权限 + 位置监听 |
| `src/utils/navigation.ts` | 航点/进度/ETA 计算（复用 shared `haversineDistance`/`formatDistance`） |
| `src/screens/NavigationScreen.tsx` | 航点引导主屏：解析 route → RouteMap + ETA/进度/转向/航点列表/推进 |
| `src/store/ui.ts` | `openNavigation(routeId)` / `openCreateSpotAt(lat,lng)` / `activeTab` |

## 进入导航的入口

- **SpotsScreen**：下载路线后出现「🧭 开始导航」按钮。
- **OfflineRoutesScreen**：每条离线路线右侧「🧭 导航」按钮。
- 两者都调 `openNavigation(routeId)`，它会设 `navRouteId`、关闭 overlay 并切到 `nav` tab。

## 后端经纬度（真实 API 模式）

切换 `app.json` 的 `extra.useMock=false` 跑真实后端时，钓点经纬度由 PostGIS 拆出：
- `apps/api/src/routes/spots.ts` — `GET /` 与 `GET /:id` 返回 `ST_Y(location) AS latitude, ST_X(location) AS longitude`。
- `apps/api/src/routes/routes.ts` — `GET /:id` 嵌套 spots 同样补这两列。

mock 模式自带真实坐标（千岛湖 / 密云水库集群），开箱即用。

## ETA 说明

剩余时间/到达时间用固定速度假设 **6 km/h**（步/船速）估算，非路况数据。常量在 `utils/navigation.ts` 的 `NAV_SPEED_KMH`，可按需调整。
