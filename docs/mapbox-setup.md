# 地图与航点导航 — 接入指南

渔路的地图层基于 [`@rnmapbox/maps`](https://github.com/rnmapbox/maps)（v10.1.x，CJS，原生实现 `mapbox`——注意该库已移除 maplibre 实现，构建会直接报错），底图用**免费高德栅格瓦片**以内联 style JSON 传入——不需要 Mapbox 账号、不需要 token、不需要代理，国内加载快。Mapbox SDK 只在请求 Mapbox 服务时校验 token，纯高德瓦片不触发任何 Mapbox 请求，空 token 安全（真机已验证）。导航形态为**航点引导**（绘制有序坑点连线 + 用户位置，按距离推进坑点，计算 ETA/进度），不接入道路级逐向导航——钓鱼坑点是水面点，路网算路不适用。

## 底图与坐标系（重要）

- 底图样式定义在 `src/components/map/mapStyle.ts`：`STREET_STYLE`（街道图，SpotsMap 用）与 `SATELLITE_STYLE`（卫星影像 + 道路标注层，RouteMap 导航用），以内联 style JSON 通过 `MapView` 的 `styleJSON` 传入。
- 高德瓦片是 **GCJ-02 坐标系**，而 GPS 定位与库里的钓点/路线数据是 **WGS-84**。若不转换，国内 pins 会偏移约 100–600 米。`src/utils/gcj02.ts` 的 `wgs84ToGcj02` 在**渲染时**转换所有传给地图的坐标（marker、连线、相机目标、bounds）；存储数据保持 WGS-84 不动。以后新增地图组件时记得同样转换。
- 高德瓦片域名（`webrd0{1-4}` / `webst0{1-4}.is.autonavi.com`）是非公开接口，多年稳定但无 SLA；若日后失效，只需改 `mapStyle.ts` 里的 tiles 数组。

## 前置条件

无需申请任何 token。`app.json` 的 `expo.extra.mapboxAccessToken` 已不再使用（App.tsx 仍会调一次 `setAccessToken('')` 做 SDK 初始化——Android 上跳过会触发 Fabric ViewTagResolver 崩溃）。

仍需**开发构建（Development Build）**：`@rnmapbox/maps` 含原生代码，**不能用 Expo Go**。首次运行需 prebuild 生成原生工程：

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
| `src/components/map/mapStyle.ts` | 高德栅格瓦片的 MapLibre style JSON（街道 / 卫星+道路层） |
| `src/utils/gcj02.ts` | WGS-84 → GCJ-02 渲染时坐标转换（高德瓦片专用） |
| `src/components/map/RouteMap.tsx` | 全屏卫星底图地图：done/remaining 双色连线、三态航点 pin、用户位置点；`forwardRef` 暴露 `zoomBy/flyTo/fitRoute` |
| `src/components/map/SpotsMap.tsx` | SpotsScreen 260px 街道底图地图：附近坑点真实坐标 pin |
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
