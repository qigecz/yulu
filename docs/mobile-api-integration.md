# 渔路 YULU · 移动端 API 集成层

本文档描述 `apps/mobile` 如何获取数据与管理认证。对应 development-plan 的 Phase 1 收尾（AuthScreen + 认证）与 Phase 2 第一步（API 集成替换 Mock）。

## 总体架构

```
Screen（消费 @yulu/shared 类型，不变）
  │  调用 hooks
  ▼
hooks/queries.ts   React Query hooks（useNearbySpots / useRoutes / useFeeds …）
  │  queryFn 按 USE_MOCK 分支
  ├─ USE_MOCK=true   → mock/data.ts
  └─ USE_MOCK=false  → api/endpoints.ts → api/transforms.ts（snake→camel）→ api/client.ts（axios + JWT）
                           │  401 → onUnauthorized → store/auth.forceLogout()
                           ▼
                      store/auth.ts（zustand + AsyncStorage 持久化）
```

屏幕只依赖 shared 类型 + hooks，**与数据来自 Mock 还是后端完全无关**。

## 数据源开关

配置在 `app.json` 的 `expo.extra`，由 `src/config.ts` 读取：

```json
"extra": { "apiBaseUrl": "http://localhost:3001/api", "useMock": true }
```

- `useMock: true`（默认）—— 走 Mock，**无需后端即可运行**，启动时 auth store 自动注入 `mockUser` 免登录。
- `useMock: false` —— 走真实 API，需先运行 PostgreSQL+PostGIS 并启动 `@yulu/api`。

## 关键模块

| 路径 | 职责 |
|------|------|
| `src/config.ts` | 读取 `apiBaseUrl` / `useMock` |
| `src/api/client.ts` | axios 实例：注入 JWT、错误归一化为 `ApiError`、401 触发登出 |
| `src/api/authToken.ts` | 解耦的 token holder，避免 client↔store↔endpoints 循环依赖 |
| `src/api/transforms.ts` | 逐资源 snake_case→camelCase 映射（toSpot/toRoute/toFeed/toTutorial/toUser） |
| `src/api/endpoints.ts` | typed API 函数（authApi / spotsApi / routesApi / tutorialsApi / feedsApi / weatherApi） |
| `src/store/auth.ts` | zustand auth store：login/register/logout/hydrate + AsyncStorage 持久化 |
| `src/hooks/queries.ts` | React Query hooks，queryFn 内 Mock/Real 分支 |
| `src/components/QueryState.tsx` | loading/error/空态 复用组件 |
| `src/screens/AuthScreen.tsx` | 手机号+密码 登录/注册页 |

## 字段映射（snake → camel）

后端路由返回的是 **raw PostgreSQL 行（snake_case）**，而 shared 类型是 camelCase 且含嵌套对象。`transforms.ts` 负责转换，例如：

- Spot: `fish_species → fishSpecies`、`fishing_method/water_depth/bottom_type/uploader_id/likes_count/downloads_count/created_at → camelCase`
- Route: `total_distance → totalDistance` + `uploader_name → uploader.nickname`（嵌套）
- Feed: `user_id → userId` + `user_name → user.nickname`（嵌套）
- User (GET /me): `avatar_url/spots_count/routes_count/likes_count/followers_count → camelCase`

## 用户生成内容（UGC）流程

让 App 从只读变为真正的"分享社区"。两条发布流，均通过 `useUIStore`（overlay 状态）触发为全屏浮层，由 `App.tsx` 的 `<Overlay/>` 渲染在 Tab 外壳之上。

| 流程 | 触发入口 | 屏 | Mutation | 后端端点 |
|------|----------|----|----------|----------|
| 分享钓点 | SpotsScreen `+`、ProfileScreen「分享坑点」 | `CreateSpotScreen` | `useCreateSpot` | `POST /spots` |
| 发布动态 | HomeScreen「分享你的作钓动态」、ProfileScreen「发布动态」 | `ComposeFeedScreen` | `useCreateFeed` | `POST /feeds` |

**双模式支持**：mutation 的 `mutationFn` 按 `USE_MOCK` 分支——Mock 模式合成 shared 类型对象并 `unshift` 进 mock 数组，Real 模式调真实 API；`onSuccess` 统一更新/失效对应 React Query 缓存（`['spots']` / `['feeds']`），新内容立即出现在列表顶部。

表单复用组件 `src/components/FormControls.tsx`：`Field` / `TextField` / `MultilineField` / `TagInput`（鱼种、标签用）/ `OptionPicker`（钓法、底质快选）/ `SubmitButton` / `Header`。

> 注：路线创建（"分享路线"）暂未实现——后端无 `POST /routes`，待后续。

## 社交互动第二轮（关注 + 评论）

在点赞/收藏之上增加用户关系与内容讨论。

**后端**（`@yulu/api`）
- 新表：`follows(follower_id, following_id)`（含不能关注自己的 CHECK）、`comments(id, user_id, target_type ∈ {feed,spot}, target_id, content)`（多态，按 target 索引）。
- `src/routes/users.ts`（**新建**）：`GET /users/:id`（optionalAuth，返回 `is_following` + `following_count` 子查询）、`POST/DELETE /users/:id/follow`（toggle，维护 followers_count）、`GET /users/:id/feeds`。
- `src/routes/comments.ts`（**新建**）：`GET /comments?targetType=&targetId=`、`POST /comments`（鉴权 + Zod 校验）。

**shared + 移动端**
- `User` 加 `followingCount?`；新增 `Comment` 类型 + `toComment`/`toUserProfile` transforms。
- `endpoints.ts`：`usersApi`（get/follow/unfollow/feeds）、`commentsApi`（list/create）。
- `hooks/queries.ts`：`useUser`、`useUserFeeds`、`useToggleFollow`（乐观更新 isFollowing + followersCount）、`useFeedComments`、`useAddComment`（乐观追加评论）。
- UI（overlay）：
  - `FeedDetailScreen` —— 动态详情 + 评论列表 + 底部评论输入条；点击作者进主页。
  - `UserScreen` —— 用户主页（头像/简介/统计 + 关注按钮 + 其动态），点动态进详情。
  - `FeedItem`（`@yulu/ui`）作者名/内容可点，触发 `onOpenAuthor`/`onOpenFeed`。
- `ui store` 扩展 `feedId`/`userId` payload，支持 detail/user overlay 携带选中目标。

**闭环**：首页动态 → 点作者进用户主页 → 关注/看其动态 → 点动态进详情 → 看评论/发评论。

**双模式**：Real 走真实端点；Mock 模式关注即时翻转（内存）、评论本地追加展示。

## 社交互动（点赞 + 收藏）

让用户对内容表达态度并建立个人收藏库。

**后端**（`@yulu/api`）
- 新表：`feed_likes(user_id, feed_id)`、`favorites(user_id, target_type ∈ {spot,feed,route}, target_id)`（多态）。`spot_likes` 已存在。
- `optionalAuth` 中间件（`src/middleware/auth.ts`）：有 token 则注入 `userId`，无则放行。公开列表端点用它来个性化 `liked`/`favorited` 标记。
- `GET /spots`、`GET /spots/:id`、`GET /feeds`：LEFT JOIN `spot_likes`/`feed_likes` + `favorites`，返回每条记录的 `liked`/`favorited` 布尔。
- 点赞 toggle：`POST /spots/:id/like`、`POST /feeds/:id/like` → 返回 `{ liked, likesCount }`（存在则删除+减计数，否则插入+加计数）。
- 收藏 CRUD：`POST /favorites`、`DELETE /favorites/:type/:id`、`GET /favorites?type=spot|feed`（鉴权）。

**移动端**（`@yulu/mobile`）
- shared `Spot`/`Feed` 加 `liked?`/`favorited?`；transforms 读取。
- `endpoints.ts`：`spotsApi.like`、`feedsApi.like`、`favoritesApi`（add/remove/listSpots/listFeeds）。
- `hooks/queries.ts`：`useToggleSpotLike`、`useToggleFeedLike`、`useToggleFavorite`（**乐观更新**缓存 + Mock 模式同步内存数组）、`useFavoriteSpots`/`useFavoriteFeeds`。
- UI：`FeedItem`（`@yulu/ui`）加 点赞❤/收藏★ 行；SpotsScreen 坑点行加 点赞+收藏；`ProfileScreen`「我的收藏」打开 `FavoritesScreen`（overlay）。

**双模式**：Real 模式走真实端点；Mock 模式点赞即时反映（乐观更新内存），收藏不持久化（FavoritesScreen 提示）。

## 图片上传

UGC 流程支持图片：选图 → 上传 → 落库 → 展示。

**后端**（`@yulu/api`）
- `src/config/storage.ts`：multer 本地磁盘存储，落到 `uploads/`，限制 8MB / 仅图片、最多 9 张。存储层独立，便于后续切 S3 / Supabase。
- `src/routes/uploads.ts`：`POST /api/uploads`（鉴权，multipart `images`）→ 返回 `{ urls: [绝对URL] }`。
- `index.ts`：`app.use('/uploads', express.static(...))` 对外提供图片。
- `POST /spots`、`POST /feeds` 的 INSERT 已写入 `images` 列（之前漏写）；validator 加 `images` 可选数组（`@yulu/shared` 新增 `createFeedSchema`，`createSpotSchema` 补 `images`）。

**移动端**（`@yulu/mobile`）
- 依赖 `expo-image-picker`（SDK 51 → ~14.7.1）。
- `uploadsApi.upload(uris)`：FormData multipart 上传，返回 URL 数组。
- `src/components/ImagePicker.tsx`：多选图组件（缩略图 + 删除 + 添加），持有本地 URI。
- `CreateSpotScreen` / `ComposeFeedScreen`：提交时 **Real 模式先上传换 URL**，**Mock 模式直接用本地 URI** 预览。
- `FeedItem`（`@yulu/ui`）渲染首图；HomeScreen 动态区传入 `feed.images[0]`。

## 认证流程
1. App 启动 → `useAuthStore.hydrate()`：Mock 模式注入 mockUser；Real 模式从 AsyncStorage 恢复 token+user。
2. 未认证 → 渲染 `AuthScreen`；已认证 → 渲染主 Tab 界面（`App.tsx` 按 `status` 分流）。
3. 登录/注册 → `authApi` → 后端返回 `{accessToken, refreshToken, user}` → 存 AsyncStorage + 写入 `authToken` holder。
4. 每次请求 axios 拦截器自动注入 `Authorization: Bearer <token>`。
5. 401 → 清 token + `forceLogout()` 回到登录页。

Token：access 15min / refresh 7day（与后端一致）。

**静默刷新**：access token 过期时不再强制登出。axios 响应拦截器（`src/api/client.ts`）在收到 401 后调用注册的 `refreshAccessToken`（`src/store/auth.ts`），用 refresh token 换新 access token 并重试原请求；并发 401 排队在同一个刷新 Promise 上。仅当 refresh token 也失效（`/auth/refresh` 返回 401）时才 `forceLogout()` 回登录页。后端 `POST /auth/refresh` 验 refresh token 并签发新 access token。Mock 模式 token 为占位值，不触发真实刷新。

## 已知限制（后续迭代）

- **Refresh token 不轮换**：`/auth/refresh` 仅签发新 access token，不签发新 refresh token（不实现滑动会话）。refresh token 7 天后固定过期。
- **spots 列表不返回经纬度**：API 当前只 SELECT `distance`（PostGIS 几何列未拆分）。显示类屏幕不受影响；导航/地图需要时再在 SQL 加 `ST_X/ST_Y` 并在 `toSpot` 映射。
- **认证后无用户名/密码持久校验**：Mock 模式跳过校验。

## 验证

```bash
pnpm install
pnpm --filter @yulu/mobile typecheck   # 类型检查
pnpm --filter @yulu/mobile start        # Expo 启动
```

Mock 模式（默认）：启动即进主界面，5 屏数据由 hooks→mock 提供；切到「我的」可「退出登录」查看 AuthScreen。

Real API 模式：`app.json` 设 `useMock:false`，启动后端 `pnpm --filter @yulu/api dev`（需先 migrate + seed），AuthScreen 注册/登录走真实 JWT。
