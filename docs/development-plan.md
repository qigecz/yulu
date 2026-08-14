# 渔路 YULU · 全栈 MVP 实施计划

## Context

基于 8 个 HTML 原型文件和 design.md 设计规格书，从零搭建钓鱼地点分享社区 App。用户确认技术栈为 **React Native + Next.js + Node.js/Express**，开发范围为 **全栈 MVP**。

---

## 进度状态（截至 2026-07-14）

### ✅ Phase 1：基础 + 核心
- **1A 基础设施**：pnpm monorepo、Expo/Next.js/Express 脚手架、shared 类型+Zod、ui Design Tokens、PostgreSQL+PostGIS 迁移（12 张表）
- **1B Web 落地页**：`landing.html` → Next.js 单页（TopNav/Hero/Features/AppPreview/HowItWorks/Community/CTA/Footer）
- **1C 后端 API**：auth/spots/routes/tutorials/feeds/weather 六模块 + JWT + Zod + 种子数据
- **1D 移动端核心**：5 屏（Home/Spots/Navigation/Learn/Profile）+ **AuthScreen + 认证**（zustand auth store + axios 客户端 + AsyncStorage 持久化 + Mock 免登录）

### ✅ Phase 2（部分）
- **API 集成替换 Mock**：React Query 数据层 + snake/camel 映射 + `USE_MOCK` 开关（默认 Mock，可切真实 API）
- **图片上传闭环**：后端 multer 本地存储 + `POST /uploads` + express.static；移动端 expo-image-picker 选图 + 上传；spots/feeds images 落库
- **Refresh token 静默刷新**：后端 `POST /auth/refresh`；客户端 401 拦截器换 token + 重试 + 并发排队
- ✅ **全局搜索**：后端 `GET /api/search?q=`（spots/routes/tutorials 三段 ILIKE）；移动端 `SearchScreen` overlay（防抖 + 分组结果，复用 SpotCard/RouteItem），Home/Spots/Learn 搜索框点击进入；mock 模式客户端过滤
- ✅ **离线路线下载**：`store/offline.ts`（zustand persist + AsyncStorage）持久化完整路线；SpotsScreen 下载按钮接 `useDownloadRoute`（real 取 detail+download，mock 直存）；`OfflineRoutesScreen` 列表 + 删除，ProfileScreen 菜单接入
- ✅ **Mapbox 地图 + 航点引导**：接入 `@rnmapbox/maps`（开发构建），`RouteMap` 组件（路线 done/remaining 双色连线 + 三态航点 pin + 用户位置点）、`SpotsMap`（附近坑点真实坐标 pin）；`NavigationScreen` 重写为数据驱动航点引导（ETA/进度/转向文案/航点推进：GPS 接近自动推进 + 手动「到达此坑点」）；`useLocation` hook（expo-location）；路线入口（SpotsScreen「开始导航」、OfflineRoutesScreen「导航」）；`utils/navigation.ts`（waypoints/progress/ETA）。详见 `docs/mapbox-setup.md`

### ✅ Phase 3：社区 + 社交
- **UGC**：创建钓点（CreateSpotScreen）、发布动态（ComposeFeedScreen），overlay 浮层 + Mock/Real 双模式
- **社交互动**：点赞（feeds/spots）、收藏（多态 favorites + 「我的收藏」页）、关注（follows + 用户主页）、评论（多态 comments + 动态详情页）
- ✅ **推送通知（Expo Push，全流程）**：后端 `push_tokens` 表 + `POST /users/push-token` + `services/notifications.ts`（调 Expo v2/send，尽力而为不阻塞）；社交事件触发推送——spot/feed 点赞、评论、关注（跳过本人）；移动端 `expo-notifications` + `usePushNotifications`（请求权限/注册 token/前台横幅/点击跳转）。详见 `docs/push-deeplink.md`
- ✅ **体验打磨**：`Skeleton`/`SkeletonText` 骨架组件（pulse）+ 屏级 `SpotListSkeleton/RouteListSkeleton/FeedSkeleton` 替代 spinner；Home/Spots/Learn/Profile 四屏接 `RefreshControl` 下拉刷新；`ErrorBoundary` 包裹 App 顶层防白屏

### ✅ Phase 4（部分）：iOS 小组件 + 深链
- ✅ **深度链接**：scheme `yulu://`；`utils/deeplink.ts` 分发（nav/route/feed/user/spot/home）；App.tsx 接 `Linking` 冷启动+运行时 URL；推送点击复用同一分发器（`buildDeepLink`）
- ✅ **iOS Widget 骨架**（`apps/mobile/ios-widget/`，Swift/WidgetKit）：Medium+Small 两尺寸、读 weather/附近钓点、`widgetURL` 深链；对照 `widget-ios.html`。**待 Mac/Xcode 编译验证**（见该目录 README）
- ⬜ TestFlight/上架 — 发布流程，需 Apple 开发者账号 + Xcode + App Store Connect

> 详细集成设计见 `docs/mobile-api-integration.md`。

---

## 📱 Android 真机测试进展（截至 2026-08-14）

### ✅ Release APK 已可正常启动运行
真机（vivo V2136A · Android 14）上从「安装即闪退」到「正常进首页」的修复记录，详见 `docs/build-android-device.md` 的「启动崩溃排查」：

- **真根因**：pnpm monorepo 下 `@yulu/ui` 的 dependencies 误装独立 react-native 0.74.7（mobile 为 0.74.5），bundle 内双 AppRegistry 实例 → release 启动 `n=0` 崩溃（开发模式不复现，极隐蔽）。修复：ui 只留 peerDependencies + metro `extraNodeModules` 强制单一副本 + `registerRootComponent`。
- 连带修复：标准 `index.js` 入口、expo-notifications 动态 import、启动期全局错误捕获。
- **底部 tab 图标**：emoji → Ionicons 线性图标（按 mobile-android.html 原型）。

### 真机测试工作流
- 出包：`eas build --platform android --profile preview --non-interactive --no-wait --json`（Windows 下必须 `--json`，否则卡死）
- 安装：adb push 到 `/sdcard/Download/` + VIEW intent 触发安装界面（vivo 对 adb install 有弹窗拦截）
- 反馈问题：现象 + 复现步骤 + 截图；崩溃类抓 `adb logcat -b crash -d`

---

## 🚀 部署进展（截至 2026-07-16）

### ✅ 已部署（开发/预览环境）
全栈已部署到阿里云 ECS `47.98.105.25`（Ubuntu 22.04 · 1.6G RAM + 4G swap）：

- **代码**：本地最新版（含 Mapbox）已 push 到 `github.com/qigecz/yulu`（commit `bd0a89c`），服务器从 GitHub clone 到 `/var/www/yulu`。
- **数据库**：PostgreSQL 16 + PostGIS 3.6，`yulu` 库，迁移建表 + 种子数据完成；`spots`/`routes` 接口返回真实经纬度（PostGIS `ST_Y/ST_X`）。
- **API**：pm2 托管 `yulu-api`（tsx 运行，开机自启 + 崩溃自动重启，~88MB），Nginx 反代 `/api/` → `127.0.0.1:3001`。
- **Web**：Next.js 静态导出（`output: 'export'`），Nginx 直接伺服 `apps/web/out/`。
- **安全**：UFW 仅开 22/80/443；DB 密码与 JWT 密钥随机生成，存于服务器 `/root/.yulu-secrets`（600 权限）。

**当前访问（HTTP 明文，按 IP）**：
- 落地页：`http://47.98.105.25/`
- API：`http://47.98.105.25/api/health`、`http://47.98.105.25/api/spots`

### ⬜ 待办：域名 + ICP 备案 + HTTPS（用户后续处理）

当前是 **HTTP 明文 + IP 访问** 的预览部署，**未上域名、未备案、无 HTTPS**。正式上线前需完成：

1. **购买域名**（`.com`/`.cn`）并完成实名认证。
2. **ICP 备案**（中国大陆服务器提供 Web 服务必须）：阿里云备案系统代办，约 7-20 工作日。**备案期间不得通过域名对外访问**，可继续用 IP 调试。
3. **DNS 解析**：A 记录 `@` / `www` / `api` → `47.98.105.25`。
4. **SSL 证书**：阿里云免费 DV 证书，Nginx 配 443 + HTTP→HTTPS 跳转。
5. **Nginx server_name 改域名**，API 的 `CORS_ORIGIN` 收窄到正式域名。
6. 备案通过后网站底部需展示 ICP 备案号并链 `https://beian.miit.gov.cn`。

> 完整步骤见 `docs/server-setup-guide.md`（购买清单、备案流程、Nginx HTTPS 配置）。

### 📌 部署相关待同步项
- 本地有 1 个 `apps/web/next.config.js`（启用静态导出）的 commit 因 GitHub 网络抖动未 push 成功，待网络恢复后 `git push`（服务器已用相同配置重建，不影响线上）。

---

---

## 项目结构：pnpm Monorepo

```
yulu/
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── packages/
│   ├── shared/          # @yulu/shared — 类型、验证器、工具函数
│   └── ui/              # @yulu/ui — RN 兼容组件库 + Design Tokens
├── apps/
│   ├── mobile/          # React Native (Expo) 移动端
│   ├── web/             # Next.js 落地页
│   └── api/             # Express 后端 API
└── docs/
```

---

## Phase 1：基础 + 核心（4-5 周）

### 1A. 基础设施搭建（第 1 周）

- 初始化 pnpm monorepo，配置 workspaces
- `apps/mobile/` — Expo + TypeScript 脚手架
- `apps/web/` — Next.js App Router 脚手架
- `apps/api/` — Express + Helmet + CORS 脚手架
- `packages/shared/` — TS 接口（User/Spot/Route/Tutorial/Feed）+ Zod 验证器 + 工具函数
- `packages/ui/` — Design Tokens（从 design.md 提取为 RN StyleSheet）
- PostgreSQL + PostGIS 连接，Knex.js 迁移

### 1B. Web 落地页（第 1-2 周）

将 `landing.html`（509 行）逐区块转换为 Next.js 组件：

| 组件 | 原型来源 |
|------|----------|
| `globals.css` | `:root` CSS 变量 + 工具类 |
| `TopNav.tsx` | 粘性导航 + 毛玻璃 |
| `Hero.tsx` | 主标题 + 副文案 + CTA |
| `Features.tsx` | 三列功能卡片 |
| `AppPreview.tsx` | 手机 Mockup 组件 |
| `HowItWorks.tsx` | 三步流程 |
| `Community.tsx` | 用户推荐语 |
| `CTA.tsx` | 下载引导 |
| `Footer.tsx` | 页脚 |

### 1C. 后端 API（第 2-3 周）

**数据库 6 张表**：users、spots（PostGIS）、routes（LineString）、route_spots、tutorials、feeds + 4 张互动表

**API 端点**：

| 模块 | 端点 |
|------|------|
| 认证 | POST register/login/refresh, GET me |
| 钓点 | GET nearby(空间查询), CRUD, POST like |
| 路线 | GET list, GET detail(含有序坑点), POST download |
| 教程 | GET list(分类筛选), CRUD, POST favorite |
| 动态 | GET feed(游标分页), POST create |
| 天气 | GET weather(代理第三方API) |

**认证**：JWT（access 15min + refresh 7day），bcrypt 密码哈希，手机号注册

**种子数据**：原型中的千岛湖碧溪湾、密云水库北岸环线等

### 1D. 移动端核心页面（第 3-5 周）

先用 Mock 数据（匹配原型内容），确保 UI 完整：

| 页面 | 参考原型 | 核心组件 |
|------|----------|----------|
| `HomeScreen` | `mobile-ios.html` | 天气条、搜索、商城 Banner、附近钓点横向滚动、路线列表、动态 Feed |
| `SpotsScreen` | `screens/ios-route.html` | 地图占位（网格+Pin）、筛选 Chips、路线详情卡、坑点列表 |
| `ProfileScreen` | `screens/ios-profile.html` | 头像统计、分享按钮、我的路线/技巧、菜单列表 |
| `TabNavigator` | `mobile-ios.html` 486-507行 | 5 Tab 底部导航（首页/坑点/导航/学习/我的） |
| `AuthScreen` | — | 登录/注册表单 |

**Phase 1 交付物**：
- 可部署的营销落地页
- 后端 API + 6 张数据表 + 种子数据
- 移动端 3 个完整页面（Home/Spots/Profile）+ 认证
- 所有数据 Mock fallback（无需 API 即可运行）

---

## Phase 2：地图 + 导航 + 学习（3-4 周）

- Mapbox 集成（`@rnmapbox/maps`），自定义地图样式匹配 `#2a8f7a` 色系
- `NavigationScreen`（全屏地图导航、转向提示、ETA、路点列表）
- `LearnScreen`（分类筛选、视频教程列表、文章卡片）
- API 集成替换所有 Mock 数据
- 路线离线下载（AsyncStorage + Mapbox 离线区域）
- 全局搜索、坑点创建流程

## Phase 3：社区 + 完善（2-3 周）

- Feed 发布（图片上传 + 位置标记）
- 社交互动（点赞/关注/收藏/评论）
- 推送通知（Expo Push）
- 分页、骨架屏、下拉刷新、错误边界

## Phase 4：iOS 小组件 + 上架（2-3 周）

- WidgetKit 小组件（Medium + Small，匹配 `widget-ios.html`）
- 深度链接、TestFlight/Beta 分发

---

## 关键技术选型

| 领域 | 方案 | 理由 |
|------|------|------|
| 地图 | Mapbox | 离线地图、自定义样式、导航 SDK |
| 状态管理 | Zustand + React Query | 轻量，服务端状态缓存 |
| 数据库 | PostgreSQL + PostGIS | 地理空间查询（附近钓点） |
| 文件存储 | S3 / Supabase Storage | 图片上传，视频外链 |
| 视频播放 | react-native-video | 教程视频 |
| 验证 | Zod（前后端共享） | 类型安全的请求验证 |

---

## 验证方式

1. **落地页**：`pnpm --filter @yulu/web dev` → 浏览器访问 localhost:3000，验证响应式（920px 断点）
2. **后端**：`pnpm --filter @yulu/api dev` → curl 测试各 API 端点，检查数据库种子数据
3. **移动端**：`pnpm --filter @yulu/mobile start` → Expo Go 扫码，验证三个核心页面 UI 与原型一致
4. **数据库**：运行迁移 `knex migrate:latest` + `knex seed:run`，验证 PostGIS 空间查询
