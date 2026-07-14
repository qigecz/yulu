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
- ⬜ **Mapbox 地图/真实导航**（NavigationScreen 全屏地图）— 未开始，需 Mapbox key
- ⬜ 离线路线下载、全局搜索 — 未开始

### ✅ Phase 3：社区 + 社交
- **UGC**：创建钓点（CreateSpotScreen）、发布动态（ComposeFeedScreen），overlay 浮层 + Mock/Real 双模式
- **社交互动**：点赞（feeds/spots）、收藏（多态 favorites + 「我的收藏」页）、关注（follows + 用户主页）、评论（多态 comments + 动态详情页）
- ⬜ 推送通知（Expo Push）— 未开始
- ⬜ 下拉刷新 / 骨架屏 / 错误边界等体验打磨 — 未开始

### ⬜ Phase 4：iOS 小组件 + 上架 — 未开始

> 详细集成设计见 `docs/mobile-api-integration.md`。

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
