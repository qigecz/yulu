# 已知问题清单（下次构建一并处理）

## 2026-10-08 坑点页 pin 点不响应

**现象**：坑点页（SpotsScreen 重设计版，构建 896c4503）地图上的坑点 pin 点击无任何反应
（adb 复现：tap pin 坐标后屏幕零变化），抽屉卡片点击是否正常待验证。
不崩溃、渲染正常（截图确认全部元素就位）。

**已修待生效**（同一版顺带）：定位点脉冲动画原生驱动不支持 width/height，已改 scale/opacity（commit cc214a0，未构建）。

**排查方向**（按嫌疑排序）：
1. pin 的 TouchableOpacity 位于 Animated.View(mapLayer) 内部；mapWrap 内多个 absolute
   浮层（chipRow 外层普通 View 包裹 absolute ScrollView / topOverlay / mapCtl / sheet）。
   Android 触摸分发按视图树顺序——**chipRow 的外层 View 是普通流式布局**（非 absolute），
   占据 mapWrap 顶部条带，但需确认它实际占位高度是否异常（如被内容撑高拦截中下部触摸）。
   处理：把 chipRow 的 absolute 从 contentContainerStyle 移到 ScrollView 本身 + 删掉外层 View。
2. pin transform（translateX/-13）与触摸命中区：改为负 margin（marginLeft: -13, marginTop: -13）
   定位更稳，规避 transform 命中区差异。
3. 兜底验证：给 mapLayer 加 pointerEvents="box-none"、浮层容器统一 box-none，
   确保空区域不拦截。

**复现/验证方式**：装包后 adb tap pin（碧溪湾 mapX34/mapY52.5 ≈ 屏幕 367,1224），
对比前后截图；或真机点 pin 看抽屉卡片是否滚动高亮。

**相关**：ios-route.html 原型的 pin 点击 → select() 高亮联动 + 卡片滚动。
