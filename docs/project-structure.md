# 渔路 YULU — 项目目录结构

## 顶层结构（工作区根：`渔路YULU/`）

```
渔路YULU/
├── yulu/          # 代码 monorepo（git 仓库，本文件的上级）
├── 原型/          # 全部产品原型 + 设计资产（HTML 原型、logo 设计稿/SVG、设计截图）
│   ├── design.md                # 设计规格书
│   ├── index.html               # 设计总览页
│   ├── landing.html / yulu-landing.html   # 营销落地页原型
│   ├── mobile-ios.html / mobile-android.html  # 移动端首页原型
│   ├── widget-ios.html          # iOS 桌面小组件原型
│   ├── screens/                 # iOS 各页面原型（route/learn/nav/profile）
│   ├── 渔路APP-logo设计.png      # logo 完整设计稿（2048²）
│   ├── 渔路APP-logo设计无边框.png # 桌面图标定稿（当前使用的版本）
│   └── yulu-logo.svg / yulu-logo-mark.svg  # logo 矢量源（鱼+虚线路径）
└── 安装包/        # 所有 EAS 构建出的 Android APK（不入 git，仅本地留存）
    └── 渔路-yulu-android-*.apk   # 按迭代命名：home=首页改造版（最新）、
                                  # origicon=原始图标版、rootfix=崩溃修复版 等
```

> 原型同时在 `yulu/prototypes/` 有一份（随 git 仓库走），两边内容保持一致；
> logo 设计稿也入仓于 `yulu/prototypes/`。新的 APK 统一下载到 `安装包/`。

---

## yulu/

---

## packages/shared — @yulu/shared

前后端共享的类型定义、验证器和工具函数。

```
packages/shared/src/
├── types/
│   ├── user.ts        # User(含 followingCount), UserProfile(isFollowing), AuthTokens, AuthUser
│   ├── spot.ts        # Spot(含 liked/favorited), SpotFilter
│   ├── route.ts       # Route, RouteSpot, RouteFilter
│   ├── tutorial.ts    # Tutorial, TutorialFilter, TutorialType
│   ├── feed.ts        # Feed(含 liked/favorited)
│   ├── weather.ts     # Weather（含 fishingAdvice 钓鱼建议）
│   ├── comment.ts     # Comment, CommentTargetType（多态评论）
│   ├── search.ts      # SearchResults（全局搜索分组结果集）
│   └── index.ts       # 统一导出
├── validators/
│   ├── auth.ts        # registerSchema, loginSchema, refreshTokenSchema
│   ├── spot.ts        # createSpotSchema(含 images), spotFilterSchema
│   ├── route.ts       # createRouteSchema
│   ├── feed.ts        # createFeedSchema（含 images）
│   └── index.ts       # 统一导出
├── utils/
│   ├── geo.ts         # haversineDistance(), formatDistance() 距离计算
│   ├── format.ts      # formatRelativeTime(), formatViewCount() 格式化
│   └── index.ts       # 统一导出
└── index.ts           # 包入口，导出所有类型/验证器/工具
```

---

## packages/ui — @yulu/ui

React Native 组件库，所有 UI 组件基于统一的 Design Tokens。

```
packages/ui/src/
├── theme/
│   └── tokens.ts      # Design Tokens：颜色、字号、间距、圆角
├── components/
│   ├── Button.tsx     # 按钮（primary/secondary/ghost）
│   ├── Card.tsx       # 卡片（default/accent/flat）
│   ├── Pill.tsx       # 强调色标签（如"精选路线"）
│   ├── Tag.tsx        # 边框标签（如鱼种标签）
│   ├── SearchBar.tsx  # 搜索框
│   ├── SectionHeader.tsx  # 区块标题 + 操作链接
│   ├── WeatherStrip.tsx   # 天气条（温度/风向/气压/钓鱼建议）
│   ├── SpotCard.tsx   # 钓点卡片 + SpotCardList 横向滚动容器
│   ├── RouteItem.tsx  # 路线列表项
│   ├── FeedItem.tsx   # 社区动态项（点赞/收藏/作者/内容可点）
│   ├── TabBar.tsx     # 5-Tab 底部导航栏
│   ├── FilterChips.tsx # 横向滚动筛选标签
│   └── Skeleton.tsx   # 骨架占位（Skeleton + SkeletonText，pulse 动画）
└── index.ts           # 统一导出所有组件和 tokens
```

---

## apps/mobile — @yulu/mobile

React Native 移动端应用，基于 Expo。数据层默认走 Mock，`app.json` 的 `extra.useMock` 可切换真实 API（详见 `docs/mobile-api-integration.md`）。

```
apps/mobile/
├── app.json           # Expo 配置 + extra.apiBaseUrl / extra.useMock
├── metro.config.js    # Metro 打包配置（monorepo 支持）
├── package.json
├── tsconfig.json
└── src/
    ├── App.tsx        # 入口：QueryClientProvider + 认证分流 + Tab + Overlay 浮层
    ├── config.ts      # 读取 apiBaseUrl / useMock
    ├── api/           # API 客户端层
    │   ├── client.ts        # axios + JWT + 401 静默刷新/重试
    │   ├── authToken.ts     # 解耦的 token holder（破除循环依赖）
    │   ├── transforms.ts    # snake_case DB 行 → camelCase shared 类型
    │   └── endpoints.ts     # authApi/spotsApi/routesApi/tutorialsApi/feedsApi/
    │                        # weatherApi/uploadsApi/usersApi/commentsApi/favoritesApi/searchApi
    ├── store/
    │   ├── auth.ts    # zustand 认证：login/register/logout/hydrate/refreshAccessToken
    │   ├── ui.ts      # zustand overlay 状态（含 feedId/userId payload）
    │   └── offline.ts # zustand persist + AsyncStorage 离线路线缓存
    ├── hooks/
    │   └── queries.ts # React Query 查询 + mutation hooks（USE_MOCK 分支 + 乐观更新）
    ├── components/
    │   ├── QueryState.tsx     # loading/error/空态 复用
    │   ├── ErrorBoundary.tsx  # 顶层渲染错误兜底（防白屏）
    │   ├── Skeletons.tsx      # 屏级骨架（SpotListSkeleton/RouteListSkeleton/FeedSkeleton）
    │   ├── FormControls.tsx   # Field/TextField/MultilineField/TagInput/SubmitButton/Header
    │   └── ImagePicker.tsx    # 多图选择（expo-image-picker）
    ├── screens/
    │   ├── HomeScreen.tsx       # 首页：天气、搜索、Banner、附近钓点、路线、动态（下拉刷新+骨架）
    │   ├── SpotsScreen.tsx      # 坑点：地图占位、筛选、路线详情、坑点列表、离线下载（下拉刷新）
    │   ├── NavigationScreen.tsx # 导航：全屏地图、转向提示、ETA、路点时间线
    │   ├── LearnScreen.tsx      # 学习：分类筛选、精选视频、教程列表、文章（下拉刷新）
    │   ├── ProfileScreen.tsx    # 我的：头像统计、分享按钮、我的内容、收藏/离线路线/退出登录
    │   ├── AuthScreen.tsx       # 登录/注册（手机号+密码）
    │   ├── CreateSpotScreen.tsx # 分享钓点表单（含选图上传）
    │   ├── ComposeFeedScreen.tsx# 发布动态表单（含选图上传）
    │   ├── FeedDetailScreen.tsx # 动态详情 + 评论列表 + 评论输入
    │   ├── UserScreen.tsx       # 用户主页 + 关注 + 其动态
    │   ├── FavoritesScreen.tsx  # 我的收藏（钓点/动态）
    │   ├── SearchScreen.tsx     # 全局搜索 overlay（防抖 + 钓点/路线/教程分组）
    │   └── OfflineRoutesScreen.tsx # 离线路线列表 + 删除
    └── mock/
        └── data.ts    # Mock 数据（USE_MOCK=true 时作为数据源）
```

---

## apps/web — @yulu/web

Next.js 营销落地页，基于 App Router。

```
apps/web/src/
├── app/
│   ├── globals.css    # 全局样式（CSS 变量、组件样式、手机 Mockup）
│   ├── layout.tsx     # 根布局（zh-CN、meta 信息）
│   └── page.tsx       # 落地页：TopNav、Hero、Features、AppPreview、HowItWorks、Community、CTA、Footer
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## apps/api — @yulu/api

Express 后端 REST API。

```
apps/api/src/
├── index.ts           # Express 入口，挂载所有路由到 /api/* + /uploads 静态服务
├── config/
│   ├── env.ts         # 环境变量加载（JWT 密钥、数据库连接等）
│   ├── database.ts    # PostgreSQL 连接池（pg Pool）
│   └── storage.ts     # multer 本地磁盘存储配置（可换 S3/Supabase）
├── middleware/
│   ├── auth.ts        # authMiddleware（强制）+ optionalAuth（有 token 才注入）
│   ├── validate.ts    # Zod Schema 验证中间件工厂
│   └── errorHandler.ts # 全局错误处理
├── routes/
│   ├── auth.ts        # POST register/login/refresh, GET /me
│   ├── spots.ts       # GET nearby（liked/favorited 个性化）, GET/:id, POST, POST /:id/like
│   ├── routes.ts      # GET list, GET/:id（含有序坑点）, POST download
│   ├── tutorials.ts   # GET list（分类筛选）, GET/:id
│   ├── feeds.ts       # GET feed（liked/favorited）, POST, POST /:id/like
│   ├── weather.ts     # GET weather（目前 mock，后续接第三方 API）
│   ├── uploads.ts     # POST /api/uploads（multer，返回图片 URL）
│   ├── users.ts       # GET /:id（主页）, POST/DELETE /:id/follow, GET /:id/feeds
│   ├── comments.ts    # GET ?targetType=&targetId=, POST（多态评论）
│   ├── favorites.ts   # POST, DELETE /:type/:id, GET ?type=
│   └── search.ts      # GET ?q=（spots/routes/tutorials 三段 ILIKE 分组搜索）
├── migrate.ts         # 数据库迁移：12 张表（含 PostGIS 空间索引 + feed_likes/follows/comments/favorites）
└── seed.ts            # 种子数据：测试用户、钓点、路线、教程、动态
```

---

## docs/ — 项目文档

| 文件 | 内容 |
|------|------|
| `development-plan.md` | 全栈 MVP 开发计划（4 个 Phase + 进度状态） |
| `project-structure.md` | 本文件 — 项目目录结构说明 |
| `project-architecture.md` | 项目技术架构说明 |
| `mobile-api-integration.md` | 移动端数据/认证/UGC/图片上传/社交互动 集成层说明 |
| `server-setup-guide.md` | 后端部署与数据库初始化指南 |

---

## prototypes/ — 产品原型

| 文件 | 对应内容 |
|------|----------|
| `design.md` | 从原型提取的设计规格书 |
| `index.html` | 设计总览页 |
| `landing.html` / `yulu-landing.html` | 营销落地页原型 |
| `mobile-ios.html` | iOS 首页原型 |
| `mobile-android.html` | Android 首页原型 |
| `widget-ios.html` | iOS 桌面小组件原型 |
| `screens/ios-route.html` | 坑点/路线页原型 |
| `screens/ios-learn.html` | 学习页原型 |
| `screens/ios-nav.html` | 导航页原型 |
| `screens/ios-profile.html` | 个人页原型 |
