# 渔路 YULU — 项目目录结构

## 顶层结构

```
yulu/
├── packages/          # 共享包（workspace packages）
│   ├── shared/        # @yulu/shared — 类型、验证器、工具函数
│   └── ui/            # @yulu/ui — RN 组件库 + Design Tokens
├── apps/              # 应用层
│   ├── mobile/        # @yulu/mobile — React Native (Expo) 移动端
│   ├── web/           # @yulu/web — Next.js 营销落地页
│   └── api/           # @yulu/api — Express 后端 API
├── docs/              # 项目文档
├── prototypes/        # 产品原型（HTML）+ 设计规格书
├── package.json       # 根 monorepo 配置
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── .env.example       # 环境变量模板
```

---

## packages/shared — @yulu/shared

前后端共享的类型定义、验证器和工具函数。

```
packages/shared/src/
├── types/
│   ├── user.ts        # User, UserProfile, AuthTokens, AuthUser
│   ├── spot.ts        # Spot, SpotFilter（含地理坐标、鱼种、钓法）
│   ├── route.ts       # Route, RouteSpot, RouteFilter
│   ├── tutorial.ts    # Tutorial, TutorialFilter, TutorialType
│   ├── feed.ts        # Feed（社区动态）
│   ├── weather.ts     # Weather（含 fishingAdvice 钓鱼建议）
│   └── index.ts       # 统一导出
├── validators/
│   ├── auth.ts        # registerSchema, loginSchema（手机号+密码）
│   ├── spot.ts        # createSpotSchema, spotFilterSchema（含经纬度+半径）
│   ├── route.ts       # createRouteSchema（含坑点数组）
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
│   ├── FeedItem.tsx   # 社区动态项
│   ├── TabBar.tsx     # 5-Tab 底部导航栏
│   └── FilterChips.tsx # 横向滚动筛选标签
└── index.ts           # 统一导出所有组件和 tokens
```

---

## apps/mobile — @yulu/mobile

React Native 移动端应用，基于 Expo。

```
apps/mobile/
├── app.json           # Expo 配置（应用名、Bundle ID）
├── metro.config.js    # Metro 打包配置（monorepo 支持）
├── package.json
├── tsconfig.json
└── src/
    ├── App.tsx        # 应用入口：状态栏 + Tab 导航 + 5 个页面
    ├── screens/
    │   ├── HomeScreen.tsx       # 首页：天气、搜索、Banner、附近钓点、路线、动态
    │   ├── SpotsScreen.tsx      # 坑点：地图占位、筛选、路线详情、坑点列表
    │   ├── NavigationScreen.tsx # 导航：全屏地图、转向提示、ETA、路点时间线
    │   ├── LearnScreen.tsx      # 学习：分类筛选、精选视频、教程列表、文章
    │   └── ProfileScreen.tsx    # 我的：头像统计、分享按钮、我的内容、菜单
    └── mock/
        └── data.ts    # Mock 数据（匹配原型内容，无需 API 即可运行）
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
├── index.ts           # Express 入口，挂载所有路由到 /api/*
├── config/
│   ├── env.ts         # 环境变量加载（JWT 密钥、数据库连接等）
│   └── database.ts    # PostgreSQL 连接池（pg Pool）
├── middleware/
│   ├── auth.ts        # JWT Bearer Token 认证中间件
│   ├── validate.ts    # Zod Schema 验证中间件工厂
│   └── errorHandler.ts # 全局错误处理
├── routes/
│   ├── auth.ts        # POST register/login, GET /me
│   ├── spots.ts       # GET nearby（PostGIS 空间查询）, GET/:id, POST
│   ├── routes.ts      # GET list, GET/:id（含有序坑点）, POST download
│   ├── tutorials.ts   # GET list（分类筛选）, GET/:id
│   ├── feeds.ts       # GET feed, POST create
│   └── weather.ts     # GET weather（目前 mock，后续接第三方 API）
├── migrate.ts         # 数据库迁移：创建 8 张表（含 PostGIS 空间索引）
└── seed.ts            # 种子数据：测试用户、钓点、路线、教程、动态
```

---

## docs/ — 项目文档

| 文件 | 内容 |
|------|------|
| `development-plan.md` | 全栈 MVP 开发计划（4 个 Phase） |
| `project-structure.md` | 本文件 — 项目目录结构说明 |
| `project-architecture.md` | 项目技术架构说明 |

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
