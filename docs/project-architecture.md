# 渔路 YULU — 项目技术架构

## 整体架构

```
┌─────────────────────────────────────────────────────┐
│                    客户端层                          │
│  ┌──────────────────┐  ┌──────────────────────────┐ │
│  │  React Native    │  │  Next.js (Static)        │ │
│  │  (Expo) 移动端   │  │  营销落地页              │ │
│  └────────┬─────────┘  └──────────┬───────────────┘ │
└───────────┼───────────────────────┼─────────────────┘
            │ REST API              │ 静态部署
            ▼                       ▼
┌─────────────────────────────────────────────────────┐
│                    服务端层                          │
│  ┌──────────────────────────────────────────────┐   │
│  │  Express.js REST API                         │   │
│  │  JWT 认证 · Zod 验证 · CORS · Helmet        │   │
│  └────────────────────┬─────────────────────────┘   │
└───────────────────────┼─────────────────────────────┘
                        │ SQL (pg)
                        ▼
┌─────────────────────────────────────────────────────┐
│                    数据层                            │
│  ┌──────────────────────────────────────────────┐   │
│  │  PostgreSQL + PostGIS                        │   │
│  │  8 张表 · 空间索引 · 种子数据               │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 技术栈

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 包管理 | pnpm + workspaces | 11.x | Monorepo 管理 |
| 语言 | TypeScript | 5.5+ | 全栈统一语言 |
| 移动端 | React Native (Expo) | RN 0.74 / Expo 51 | iOS + Android 应用 |
| 状态管理 | Zustand | 4.x | 客户端全局状态 |
| 网络请求 | Axios | 1.x | API 请求 |
| Web 前端 | Next.js (App Router) | 14.2 | 营销落地页（静态导出） |
| 后端 | Express.js | 4.x | REST API |
| 认证 | JWT (jsonwebtoken) | — | access 15min + refresh 7day |
| 密码 | bcryptjs | — | 密码哈希 |
| 验证 | Zod | 3.x | 前后端共享请求验证 |
| 数据库 | PostgreSQL + PostGIS | — | 地理空间查询 |
| 数据库驱动 | pg (node-postgres) | 8.x | 连接池 + 参数化查询 |
| 文件上传 | multer | 1.x | 图片上传 |
| 环境变量 | dotenv | 16.x | 配置管理 |

---

## Monorepo 架构

```
@yulu/shared  ◄── @yulu/ui  ◄── @yulu/mobile
     ▲                          @yulu/web
     │
     └──────────────────────── @yulu/api
```

- **@yulu/shared**：零依赖（仅 zod），被所有包引用
- **@yulu/ui**：依赖 shared（tokens），仅被 mobile 引用
- **@yulu/mobile**：依赖 ui + shared，通过 Metro 打包
- **@yulu/web**：独立，不依赖其他 workspace 包
- **@yulu/api**：依赖 shared（验证器），通过 tsx 运行

---

## 设计系统（Design Tokens）

定义在 `packages/ui/src/theme/tokens.ts`，所有 UI 组件统一引用。

### 颜色

| Token | 值 | 用途 |
|-------|----|------|
| `bg` | `#f3f5f2` | 页面背景 |
| `surface` | `#ffffff` | 卡片/弹窗背景 |
| `fg` | `#1a2420` | 主文字 |
| `muted` | `#647a70` | 次要文字 |
| `border` | `#dce2dc` | 分割线/边框 |
| `accent` | `#2a8f7a` | 品牌强调色（青绿） |
| `accentSoft` | accent 14% | 强调色浅底 |
| `danger` | `#c0392b` | 危险操作 |

### 间距

| Token | 值 | 用途 |
|-------|----|------|
| `xs` | 4px | 紧凑间距 |
| `sm` | 8px | 元素内部 |
| `md` | 12px | 元素间距 |
| `lg` | 20px | 卡片内边距 |
| `xl` | 32px | 区块间距 |
| `screenPadding` | 20px | 页面水平内边距 |

### 字号

| Token | 值 | 用途 |
|-------|----|------|
| `h1` | 26px | 页面标题（Georgia 衬线） |
| `h2` | 20px | 区块标题 |
| `body` | 15px | 正文 |
| `sm` | 13px | 辅助文字 |
| `xs` | 11px | 标签/角标 |

### 圆角

| Token | 值 | 用途 |
|-------|----|------|
| `sm` | 8px | 小元素 |
| `md` | 14px | 按钮/输入框 |
| `lg` | 18px | 卡片 |
| `pill` | 999px | 胶囊标签 |

---

## API 路由结构

所有 API 挂载在 `/api` 前缀下。

### 认证 `/api/auth`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | /register | 否 | 手机号+密码注册 |
| POST | /login | 否 | 登录，返回 access+refresh token |
| GET | /me | 是 | 获取当前用户信息 |

### 钓点 `/api/spots`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | / | 否 | 附近钓点（PostGIS ST_DWithin 空间查询） |
| GET | /:id | 否 | 钓点详情 |
| POST | / | 是 | 创建钓点 |

### 路线 `/api/routes`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | / | 否 | 路线列表 |
| GET | /:id | 否 | 路线详情（含有序坑点） |
| POST | /:id/download | 是 | 下载路线 |

### 教程 `/api/tutorials`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | / | 否 | 教程列表（支持 type/category 筛选） |
| GET | /:id | 否 | 教程详情 |

### 动态 `/api/feeds`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | / | 否 | 动态 Feed |
| POST | / | 是 | 发布动态 |

### 天气 `/api/weather`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | / | 否 | 天气+钓鱼建议 |

### 搜索 `/api/search`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | / | 否 | 全局搜索 `?q=`，spots/routes/tutorials 三段 ILIKE 分组返回 |

---

## 数据库设计

### 8 张表

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `users` | 用户 | phone, password_hash, nickname, avatar_url |
| `spots` | 钓点 | location(PostGIS Point), fish_species[], fishing_method |
| `routes` | 路线 | total_distance, best_season, featured |
| `route_spots` | 路线-坑点关联 | route_id, spot_id, sort_order, distance |
| `tutorials` | 教程 | type(video/article), category, duration |
| `feeds` | 社区动态 | user_id, content, location, images[] |
| `route_downloads` | 路线下载记录 | user_id, route_id |
| `spot_likes` | 钓点点赞 | user_id, spot_id |

### 空间查询

钓点表使用 PostGIS 地理位置：
- `location` 列类型为 `geography(Point, 4326)`
- 附近钓点查询使用 `ST_DWithin` + `ST_Distance`
- 创建钓点使用 `ST_SetSRID(ST_MakePoint(lng, lat), 4326)`

---

## 认证流程

```
客户端                         服务端
  │                              │
  ├─ POST /register ────────────►│ bcrypt.hash(password)
  │                              │ INSERT user
  │◄───── tokens ───────────────┤ jwt.sign(access + refresh)
  │                              │
  ├─ POST /login ───────────────►│ bcrypt.compare(password)
  │◄───── tokens ───────────────┤ jwt.sign(access + refresh)
  │                              │
  ├─ GET /api/spots ────────────►│
  │  Header: Authorization:      │ jwt.verify(access token)
  │  Bearer <access_token>       │
  │                              │
```

- **Access Token**：15 分钟过期，用于 API 请求认证
- **Refresh Token**：7 天过期，用于刷新 access token
- **中间件**：`authMiddleware` 验证 Bearer Token，将 `userId` 注入请求

---

## 地图与航点导航（Mapbox）

**SDK**：`@rnmapbox/maps`（Mapbox）。需 `expo prebuild` 转开发构建（不再用 Expo Go）；token 通过 `app.json` 的 `extra.mapboxAccessToken` 注入，`App.tsx` 启动时 `Mapbox.setAccessToken`。未填 token 则底图空白（pin 与连线仍渲染）。

**数据层**：
- `Spot.latitude/longitude` 为真实数值；`Route.spots[]` 有序含 `sortOrder`。
- 真实 API 经 PostGIS `ST_Y(location)/ST_X(location)` 拆出经纬度（`spots.ts`、`routes.ts`）；航段距离由客户端 `haversineDistance` 算连续点（后端不再返回空值的 distance）。
- 离线导航优先读 `store/offline.ts` 的 `get(routeId)`，无网络亦可用。

**核心模块**：
| 模块 | 作用 |
|------|------|
| `components/map/RouteMap.tsx` | 全屏地图：done/remaining 双色连线、三态航点 pin（visited/current/upcoming）、用户位置点；`forwardRef` 暴露 `zoomBy/flyTo/fitRoute` |
| `components/map/SpotsMap.tsx` | SpotsScreen 260px 地图：附近坑点真实坐标 pin |
| `hooks/useLocation.ts` | expo-location 权限 + `watchPositionAsync`，返回实时 `{coords, granted}` |
| `utils/navigation.ts` | `getWaypoints` / `computeProgress` / `estimateEta` / `formatClock`（复用 shared `haversineDistance`/`formatDistance`） |

**导航参数流**：`useUIStore.openNavigation(routeId)` 设 `navRouteId` 并切到 `nav` tab（`activeTab` 已上提进 store）。`NavigationScreen` 解析 route → `RouteMap` + ETA/进度/转向文案/航点列表；GPS 接近当前航点 <30m 自动推进，或「到达此坑点」手动推进；「标记坑点」调 `openCreateSpotAt(lat,lng)` 预填坐标。ETA 用固定速度假设（6km/h 步/船），非路况。

---

## 移动端页面架构

```
App.tsx (入口)
├── StatusBar（9:41 模拟）
├── Screen Area
│   ├── HomeScreen       ← mobile-ios.html
│   ├── SpotsScreen      ← ios-route.html
│   ├── NavigationScreen ← ios-nav.html（全屏模式，隐藏 StatusBar）
│   ├── LearnScreen      ← ios-learn.html
│   └── ProfileScreen    ← ios-profile.html
├── TabBar（5 个 Tab）
└── Home Indicator
```

当前默认走 Mock 数据（`src/mock/data.ts`），无需 API 即可运行。数据通过 React Query hooks（`src/hooks/queries.ts`）获取，按 `app.json` 的 `extra.useMock` 开关切换真实 API（详见 `docs/mobile-api-integration.md`）。

**体验层**：四屏（Home/Spots/Learn/Profile）支持 `RefreshControl` 下拉刷新；加载态由 `Skeleton`/`SkeletonText` 骨架屏替代转圈（屏级组合见 `components/Skeletons.tsx`）；顶层 `ErrorBoundary` 防止渲染崩溃白屏。

**Overlay 浮层**（`store/ui.ts` 管理，`App.tsx` 渲染器统一挂载）：创建钓点 / 发布动态 / 我的收藏 / 动态详情 / 用户主页 / **全局搜索**（`SearchScreen`，`useSearch` 防抖 + 钓点/路线/教程分组）/ **离线路线**（`OfflineRoutesScreen`）。

**离线**：`store/offline.ts`（zustand persist + AsyncStorage）持久化已下载的完整路线（含有序坑点），重启不丢；SpotsScreen 的下载按钮通过 `useDownloadRoute` 写入。

认证：未登录时 `App.tsx` 渲染 `AuthScreen`；zustand auth store（`src/store/auth.ts`）管理 token 与用户态，AsyncStorage 持久化。API 客户端（`src/api/client.ts`）自动注入 JWT，401 触发登出。

---

## 构建与运行

```bash
# 安装依赖
pnpm install

# 落地页开发
pnpm --filter @yulu/web dev        # http://localhost:3000

# 落地页构建（静态）
pnpm --filter @yulu/web build

# 后端 API 开发（需要 PostgreSQL）
pnpm --filter @yulu/api dev        # http://localhost:3001

# 数据库迁移
pnpm --filter @yulu/api migrate

# 种子数据
pnpm --filter @yulu/api seed

# 移动端开发
pnpm --filter @yulu/mobile start   # Expo Dev Server
```
