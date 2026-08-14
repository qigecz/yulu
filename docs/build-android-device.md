# 渔路 YULU · Android 真机测试构建（EAS 云构建）

用 Expo EAS 在云端打包出 `.apk`，侧载到 Android 手机测试。无需在本机装 Android Studio / JDK。

> 项目含原生模块（曾用 `@rnmapbox/maps`），**不能用 Expo Go**，必须打安装包。
> 当前测试构建**临时移除了地图模块**（见文末「地图模块临时移除说明」）。

---

## 快速构建（环境已配好）

```bash
cd apps/mobile
eas build --platform android --profile preview --non-interactive --no-wait
```

- 云端耗时约 7–15 分钟。完成后 `eas build:view <buildId>` 或构建页给 APK 下载链接。
- `eas.json` 的 `preview` profile：`buildType: apk` + `distribution: internal`，可直接侧载。
- 国内网络：上传/下载走 Google Cloud Storage，偶尔 ECONNRESET/SSL 失败——**重试几次即可**，或挂代理。

## 首次配置（已完成，备查）

1. `npm install -g eas-cli` → `eas login`（浏览器授权登录）。
2. `eas init --force` 创建 Expo 项目，`projectId` 写回 `app.json` 的 `extra.eas`。
3. `app.json` 补齐 `android.adaptiveIcon` 等；`apps/mobile/eas.json` 已建。
4. App 图标由根目录 logo SVG 生成在 `apps/mobile/assets/`（`icon.png` / `adaptive-icon-fg.png` / `splash.png`）。

---

## 配置说明

| 项 | 当前值 | 含义 |
|----|--------|------|
| `extra.useMock` | `true` | 用内置 Mock 数据，离线可跑 |
| `extra.apiBaseUrl` | `http://localhost:3001/api` | Mock 模式下不生效；切真实数据时改这里 |
| `extra.mapboxAccessToken` | `""` | 空则地图底图空白；要真实地图去 https://mapbox.com 申请免费 token |

### 想用真实后端数据？

把 `extra.useMock` 改为 `false`，`apiBaseUrl` 指向已部署服务器 `http://47.98.105.25/api`，
并给 Android 开启明文 HTTP（`app.json` 的 `android` 下加 `"usesCleartextTraffic": true`），重新构建即可。**初测建议保持 Mock。**

---

## 构建过程中遇到的问题与修复（2026-07-24 实战记录）

从「无法构建」到「出 APK」，依次踩了 4 个坑：

### 1. `expo config` 报错：`@rnmapbox/maps` ESM 解析失败
- 现象：`expo config --json` 退出码 1，无法读配置，EAS 提交阶段就挂。
- 根因：lockfile 把 `@rnmapbox/maps` 漂移到了 `10.3.2`，该版本默认入口指向 `lib/module/index.js`（ESM，含无扩展名 `import './Mapbox'`），Node 的 ESM 解析器不认，pnpm 配置阶段 import 它时崩。
- 修复：把 `@rnmapbox/maps` **锁回 `10.1.x`**（其 `main` 是 CommonJS）。当前最终方案是直接移除（见文末），但若恢复地图，须用 `10.1.39` 这类 CJS 版本，**不要用 10.3.x**。

### 2. Gradle：`Error resolving plugin [id 'com.facebook.react.settings']`
- 根因：pnpm 默认符号链接布局下，RN 0.74 的 gradle composite build（`includeBuild node_modules/@react-native/gradle-plugin`）跟随不了 pnpm 虚拟存储。
- 修复：`pnpm-workspace.yaml` 加 **`nodeLinker: hoisted`**（React Native 官方对 pnpm 的推荐；注意 pnpm v11 已不读 `.npmrc`，必须写在 `pnpm-workspace.yaml`）。

### 3. Gradle：`:expo-image-loader` 配置失败 / `compileSdkVersion is not specified`
- 根因：`expo-image-picker@14.7.1` 是 **SDK 50** 的版本（项目是 SDK 51），它带的 `expo-image-loader@4.6.0` 的 gradle 读 `compileSdkVersion` 方式与 SDK 51 不兼容，连锁导致 `ExpoModulesCorePlugin.gradle:85` 的 `components.release` 找不到。
- 修复：`expo-image-picker` 升到 **`~15.1.0`**（`npx expo install expo-image-picker` 自动选版）。

### 4. Gradle：`:rnmapbox_maps:compileReleaseKotlin` 失败 — `Cannot access 'ViewManagerWithGeneratedInterface'`
- 根因：React Native codegen 生成的基类，rnmapbox 的 Kotlin 找不到，属 codegen/类路径在 pnpm monorepo 下的错配（同报错见 gesture-handler / lottie 社区 issue）。
- 修复（当前采用）：**临时移除地图模块**优先出包（见下）。彻底修法见「地图恢复方案」。

> 排查技巧：EAS 失败后 `eas build:view <id> --json` 的 `logFiles` 是签名 GCS 链接，`curl --compressed` 下载（偶尔被截断/SSL 失败就重取新链接重试），内容是每行 JSON，取 `msg` 字段 grep `What went wrong` / `e: file:`。

---

## 地图模块临时移除说明

为优先拿到可安装的测试包，本次构建**临时去掉了 `@rnmapbox/maps`**。影响范围有限：Mock 模式下本就无 Mapbox token、地图底图本就是空白，所以移除不影响主流程体验。

具体改动：
- `package.json`：移除 `@rnmapbox/maps` 依赖。
- `app.json`：移除 `@rnmapbox/maps` config plugin。
- `src/App.tsx`：移除 `Mapbox` 导入与 `setAccessToken` 调用。
- `src/components/map/RouteMap.tsx`：保留 `RouteMapHandle` 接口（方法改 no-op），渲染占位。
- `src/components/map/SpotsMap.tsx`：改为钓点列表占位。

### 🗺️ 地图恢复方案（后续做）

目标：把原生 Mapbox 加回来并让 EAS Android 构建通过。建议步骤：

1. **加回依赖与插件**（用 CJS 版本，避免坑 1）：
   ```bash
   cd apps/mobile
   pnpm add @rnmapbox/maps@10.1.39
   ```
   并在 `app.json` 的 `plugins` 重新加：
   ```json
   ["@rnmapbox/maps", { "RNMapboxMapsImpl": "mapbox", "RNMapboxMapsDownloadToken": "<可选 token>" }]
   ```
2. **恢复三个文件的 Mapbox 实现**：从 git 历史（移除前的 commit）取回 `RouteMap.tsx` / `SpotsMap.tsx` 原内容，以及 `App.tsx` 的 `setAccessToken` 调用。建议先把本次移除改动提交，再单独建分支恢复，便于对比。
3. **解决坑 4（codegen/类路径）**，按优先级试：
   - a. **开启新架构**让 codegen 生成 `ViewManagerWithGeneratedInterface`：`app.json` 加 `"newArchEnabled": true`（或 `expo-build-properties` 插件配置），重新构建验证。
   - b. 若 a 无效，试 rnmapbox 其它版本：`10.1.33`（社区反馈对较新 RN 稳定）、或最新 `10.1.x`。
   - c. 仍不行则改 `RNMapboxMapsImpl` 为 `"maplibre"`（maplibre 的 native 构建通常更顺）。
   - d. 实在绕不过去，考虑**脱离 pnpm monorepo 单独构建 mobile**：把 mobile 的 `node_modules` 用 npm/yarn 装出扁平真实目录（坑 2 的根源就是 pnpm 布局），或本机用 Android Studio 直接 `expo run:android`。
4. **填真实 token**：`extra.mapboxAccessToken` 填 Mapbox 免费-token，地图才有底图。
5. 验证：`eas build --platform android --profile preview`，确认 `:rnmapbox_maps:compileReleaseKotlin` 通过、出 APK，地图屏幕显示底图+航点。

> 恢复时务必保留 `nodeLinker: hoisted`（坑 2 修复）和 `expo-image-picker@~15.1.0`（坑 3 修复），否则会重新踩坑。

---

## 出包成功后的启动崩溃排查（2026-08-14 实战记录）

APK 能构建、能安装，但**一点开就闪退**。logcat（`adb logcat -b crash -d`）报：

```
Invariant Violation: Failed to call into JavaScript module method
AppRegistry.runApplication(). Module has not been registered as callable.
Bridgeless Mode: false. Registered callable JavaScript modules (n = 0).
```

### 坑 5（真根因）：pnpm monorepo 下 react-native 双副本

- **现象**：bundle 完整（模块、组件都在）、`index.js` 执行了、`registerComponent('main')` 调了，但 native 报 callable modules n=0，启动即崩。开发模式（Metro dev server）完全不复现，只有 release 出包才崩。
- **根因**：`packages/ui/package.json` 曾把 `react-native: ^0.74.0` 写进 **dependencies**（应只写 peerDependencies），pnpm 在 `packages/ui/node_modules/` 下装了独立的 **0.74.7**，与 apps/mobile 的 **0.74.5** 不一致。Metro 打包时 `@yulu/ui` 组件的 `import 'react-native'` 就近解析到 0.74.7 副本 → **bundle 里出现两个 AppRegistry 实例**，`registerComponent` 注册到了 native 看不到的那份。
- **修复**（commit `8f13213` + `3b5444e`）：
  1. `packages/ui` 的 react / react-native 从 dependencies 移除，**只保留 peerDependencies**（由消费方 mobile 提供唯一副本）。
  2. 清理残留孤儿目录（`packages/ui/node_modules/react-native`、`@react-native`——lockfile 里没有但物理存在，`pnpm install` 不会自动删，需手动 `rm -rf`）。
  3. `apps/mobile/metro.config.js` 加 `resolver.extraNodeModules`，把 `react-native` / `react` 强制指向 monorepo 根的唯一副本（深度防御）。
  4. `index.js` 用 `expo` 的 `registerRootComponent(App)` 代替手写 `AppRegistry.registerComponent`。

### 坑 6（连带修复）：expo-notifications 顶层 import

`usePushNotifications.ts` 顶层 `import * as Notifications from 'expo-notifications'` 会在 bundle 加载期触发 `requireNativeModule`。虽非本次崩溃根因，但改为 hook 内 `await import('expo-notifications')` 动态导入（推迟原生模块访问到启动后）更安全，推送功能不受影响（commit `64be885`）。

### 其它配套修复

- `package.json` 的 `main` 曾指向 `src/App.tsx`——改为标准 `index.js` 入口（commit `85cd62b`）。
- **图标**：底部 tab 由 emoji 改为 `@expo/vector-icons` Ionicons（home/location/compass/book/person，未选 outline / 选中 filled，accent 双态），组件 `packages/ui/src/components/TabIcon.tsx`（commit `79c18eb`）。`@expo/vector-icons` 随 Expo SDK 内置、无原生链接风险。
- `index.js` 保留全局错误捕获（`ErrorUtils.setGlobalHandler` 把启动期错误打到 logcat），冷启动崩溃不再表现为玄学 n=0。

### 真机调试备忘（Windows + vivo）

| 事项 | 要点 |
|------|------|
| adb 安装 | platform-tools 解压到 `C:\platform-tools`，用 `/c/platform-tools/adb.exe` |
| vivo 安装拦截 | `adb install` 需手机弹窗确认，锁屏不弹；更稳的方式是 `adb push` 到 `/sdcard/Download/` 后用 `am start -a android.intent.action.VIEW` 触发安装界面手动点 |
| Git Bash 路径坑 | `adb shell` 里的 `/sdcard/...` 会被 MSYS 转成 Windows 路径，需 `export MSYS_NO_PATHCONV=1` |
| eas 命令卡死 | Windows 下 `eas build` 不带 `--json` 常在环境解析后挂起等 stdin；**加 `--json` 即正常** |
| 抓启动崩溃 | `adb logcat -c && adb shell am start -n app.yulu.android/.MainActivity`，等 10s 后 `adb logcat -b crash -d` + `adb logcat -s ReactNativeJS:V` |
| 诊断技巧 | 白屏但进程存活时先 `adb shell am force-stop` 后冷启动再抓——热启动日志可能是假的 |

- `development`：dev client 包，配合本地 dev server 热更新开发用。
- `production`：`.aab`（App Bundle），用于上架 Google Play。
