# 推送通知 + 深度链接 — 接入指南

## 一、推送通知（Expo Push，全流程）

### 工作流
```
移动端登录 → expo-notifications 请求权限 → getExpoPushTokenAsync → POST /api/users/push-token（落 push_tokens 表）
   ↓
社交事件（点赞/评论/关注）→ services/notifications.ts notifyUser → 查收件人 token → Expo v2/send → 对方收到推送
   ↓
点推送 → data{type,targetId} → buildDeepLink → dispatchDeepLink → 跳对应屏
```

### 前置：申请 EXPO_ACCESS_TOKEN
1. 登录 https://expo.dev → 账户设置 → Access Tokens → Create。
2. 分别配置：
   - **本机开发**：`apps/api/.env` 加 `EXPO_ACCESS_TOKEN=xxxx`
   - **服务器**：`/var/www/yulu/apps/api/.env` 加同名变量，`pm2 restart yulu-api`
3. 未配置时 `notifyUser` 只 `console.warn` 不报错，社交功能不受影响。

### 端点
- `POST /api/users/push-token` — body `{ token, platform:'ios'|'android'|'web' }`，需 Bearer JWT，幂等（`ON CONFLICT DO NOTHING`）。

### 触发点与文案
| 事件 | 触发条件 | 收件人 | 文案 |
|------|----------|--------|------|
| 钓点点赞 | `liked===true` | `spots.uploader_id` | 「{actor} 赞了你的钓点{name}」 |
| 动态点赞 | `liked===true` | `feeds.user_id` | 「{actor} 赞了你的动态」 |
| 评论 | 插入后 | feed→作者 / spot→上传者 | 「{actor} 评论了你：{content}」 |
| 关注 | 新关注 | 被关注者 | 「{actor} 关注了你」 |

均跳过「收件人=操作者本人」。

### 移动端调试
- **需 dev build**（已具备，Mapbox 已要求）。Expo Go 不支持真实推送。
- 模拟器收不到真实推送，只能验证权限/注册逻辑（DB `push_tokens` 见行即注册成功）。
- 真机：登录后授予权限 → 后台触发一次点赞 → 收到推送 → 点击跳转。

## 二、深度链接

### Scheme
`yulu://`（`app.json` 的 `expo.scheme`）。

### 支持的 URL
| URL | 行为 |
|-----|------|
| `yulu://route/<id>` / `yulu://nav/<id>` | 进导航 tab，开始该路线航点引导 |
| `yulu://feed/<id>` | 打开动态详情 overlay |
| `yulu://user/<id>` | 打开用户主页 overlay |
| `yulu://spot/...` | 切到坑点 tab |
| `yulu://home` | 切到首页 |

### 入口
- `apps/mobile/src/App.tsx`：`Linking.getInitialURL()`（冷启动）+ `addEventListener('url')`（运行时）。
- 推送点击：`usePushNotifications` 的 `addNotificationResponseReceivedListener` → `buildDeepLink(data)` → `dispatchDeepLink`。
- iOS Widget 的 `.widgetURL`。

### 真机测试深链
```bash
xcrun simctl openurl booted yulu://route/r1
```

## 三、iOS Widget（Mac/Xcode 接入）

见 `apps/mobile/ios-widget/README.md`。Widget 是独立 Swift Extension，不经 RN/Metro，直接 URLSession 调 `/api/weather` 与 `/api/spots`。
