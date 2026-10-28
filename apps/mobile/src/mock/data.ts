import type { Spot, Route, Feed, Tutorial, User, Weather, SpotReview, RouteReview, PostComment, MallProduct } from '@yulu/shared';

export const mockUser: User = {
  id: 'u1',
  nickname: '路亚阿杰',
  bio: '路亚爱好者 · 浙江 · 千岛湖',
  spotsCount: 23,
  routesCount: 8,
  likesCount: 156,
  followersCount: 89,
  createdAt: '',
  updatedAt: '',
};

export const mockWeather: Weather = {
  temperature: 26,
  condition: '晴',
  windDirection: '东南风',
  windLevel: 2,
  pressure: 1013,
  fishingAdvice: '宜出钓',
};

export const mockSpots: Spot[] = [
  {
    id: 's1', name: '千岛湖 · 碧溪湾', latitude: 29.6, longitude: 118.9,
    fishSpecies: ['鲈鱼'], fishingMethod: '路亚', waterDepth: '4-6m', bottomType: '岩石底',
    tags: ['深水', '岩石底'], uploaderId: 'u1', images: [], likesCount: 42,
    downloadsCount: 120, distance: 2300, createdAt: '', updatedAt: '',
    mapX: 34, mapY: 52.5,
    region: '杭州 · 淳安', rating: 4.8, ratingCount: 326, anglersToday: 17,
    mainSpecies: '鲈鱼', waterTemp: 24, catchRate7d: 86,
    info: [
      { label: '水域类型', value: '湖泊 · 库湾（支流汇入口）' },
      { label: '底部结构', value: '岩石底为主，湾口有碎石与倒树' },
      { label: '岸钓位', value: '23 个天然钓位，西岸可停车' },
      { label: '适钓季节', value: '3–11 月，夏季清晨与黄昏最佳' },
      { label: '交通方式', value: '自驾（湾口停车场免费）· 步行 300m' },
      { label: '费用', value: '免费 · 无需预约' },
    ],
    catchByHour: [32, 88, 22, 14, 56, 48],
    featuredRoute: { id: 'r1', name: '碧溪湾 · 坑点巡钓路线', spotsCount: 6, totalDistance: 4.2, downloads: 128, uploader: '路亚阿杰' },
    pits: [
      { name: '湾口乱石堆', desc: '水深 3.5m · 鲈鱼标点 · 距停车场 300m' },
      { name: '西岸倒树区', desc: '水深 2–4m · 障碍钓法 · 小心挂底' },
      { name: '湾心深坑', desc: '水深 8m · 大物概率高 · 建议船钓' },
      { name: '东岸水草边', desc: '水深 1.5–2.5m · 清晨活性高' },
      { name: '支流汇入口', desc: '水深 3–5m · 鲴鱼翘嘴集群区' },
      { name: '南湾网箱边', desc: '水深 4m · 夜钓翘嘴好去处' },
    ],
  },
  {
    id: 's2', name: '富春江 · 钓台', latitude: 29.9, longitude: 119.7, mapX: 15, mapY: 43.5,
    fishSpecies: ['鲫鱼'], fishingMethod: '台钓', waterDepth: '2-3m', bottomType: '沙底',
    tags: ['缓流', '沙底'], uploaderId: 'u1', images: [], likesCount: 35,
    downloadsCount: 89, distance: 5100, createdAt: '', updatedAt: '',
    rating: 4.6, catchRate7d: 42,
  },
  {
    id: 's3', name: '太湖 · 东山半岛', latitude: 31.1, longitude: 120.5, mapX: 68, mapY: 38.5,
    fishSpecies: ['综合'], fishingMethod: '湖钓', waterDepth: '1-2m', bottomType: '水草',
    tags: ['浅滩', '水草'], uploaderId: 'u1', images: [], likesCount: 28,
    downloadsCount: 67, distance: 8700, createdAt: '', updatedAt: '',
    rating: 4.5, catchRate7d: 37,
  },
  // 坑点地图页钓点（ios-route.html 原型）
  {
    id: 's14', name: '碧溪湖 · 入库口', latitude: 29.63, longitude: 118.95, mapX: 47, mapY: 63.5,
    fishSpecies: ['综合'], fishingMethod: '湖钓', waterDepth: '1-3m', bottomType: '库汊',
    tags: ['库汊', '浅水'], uploaderId: 'u2', images: [], likesCount: 18,
    downloadsCount: 44, distance: 3400, createdAt: '', updatedAt: '',
    rating: 4.2, catchRate7d: 28,
  },
  {
    id: 's15', name: '龙溪 · 筏钓湾', latitude: 29.55, longitude: 118.82, mapX: 78, mapY: 57.5,
    fishSpecies: ['鳜鱼'], fishingMethod: '筏钓', waterDepth: '6-9m', bottomType: '深湾',
    tags: ['深湾', '深水'], uploaderId: 'u2', images: [], likesCount: 21,
    downloadsCount: 52, distance: 8600, createdAt: '', updatedAt: '',
    rating: 4.5, catchRate7d: 19,
  },
  {
    id: 's16', name: '云溪涧', latitude: 29.68, longitude: 119.05, mapX: 24, mapY: 68.5,
    fishSpecies: ['溪石斑'], fishingMethod: '溪流', waterDepth: '0.5-1m', bottomType: '山涧',
    tags: ['山涧', '浅滩'], uploaderId: 'u2', images: [], likesCount: 15,
    downloadsCount: 38, distance: 6200, createdAt: '', updatedAt: '',
    rating: 4.3, catchRate7d: 23,
  },
  // 附近钓点列表页扩充（ios-spot-list 原型）
  {
    id: 's9', name: '青山湖 · 西坝', latitude: 30.24, longitude: 119.72,
    fishSpecies: ['翘嘴'], fishingMethod: '路亚', waterDepth: '4-8m', bottomType: '网箱边',
    tags: ['深水', '网箱边'], uploaderId: 'u2', images: [], likesCount: 47,
    downloadsCount: 130, distance: 12400, createdAt: '', updatedAt: '',
    rating: 4.7, catchRate7d: 51,
  },
  {
    id: 's10', name: '苕溪 · 古埠段', latitude: 30.85, longitude: 119.97,
    fishSpecies: ['马口'], fishingMethod: '溪流', waterDepth: '0.5-1.5m', bottomType: '碎石',
    tags: ['浅滩', '碎石底'], uploaderId: 'u2', images: [], likesCount: 39,
    downloadsCount: 96, distance: 15200, createdAt: '', updatedAt: '',
    rating: 4.9, catchRate7d: 64,
  },
  {
    id: 's11', name: '新安江 · 白沙湾', latitude: 29.47, longitude: 119.28,
    fishSpecies: ['鳊鱼'], fishingMethod: '筏钓', waterDepth: '3-6m', bottomType: '缓流',
    tags: ['缓流', '网箱边'], uploaderId: 'u2', images: [], likesCount: 26,
    downloadsCount: 71, distance: 23800, createdAt: '', updatedAt: '',
    rating: 4.4, catchRate7d: 28,
  },
  {
    id: 's12', name: '东苕溪 · 闸口', latitude: 30.42, longitude: 119.98,
    fishSpecies: ['鲤鱼'], fishingMethod: '台钓', waterDepth: '2-4m', bottomType: '桥墩',
    tags: ['缓流', '桥墩'], uploaderId: 'u2', images: [], likesCount: 22,
    downloadsCount: 58, distance: 26500, createdAt: '', updatedAt: '',
    rating: 4.3, catchRate7d: 19,
  },
  {
    id: 's13', name: '富春江 · 七里泷', latitude: 29.55, longitude: 119.43,
    fishSpecies: ['鳜鱼'], fishingMethod: '路亚', waterDepth: '5-10m', bottomType: '礁石',
    tags: ['急流', '礁石'], uploaderId: 'u2', images: [], likesCount: 33,
    downloadsCount: 88, distance: 31000, createdAt: '', updatedAt: '',
    rating: 4.8, catchRate7d: 45,
  },
  // 密云水库北岸环线航点集群（导航演示用，坐标紧凑成一条路线）
  {
    id: 's4', name: '密云水库 · 碧溪湾东岸', latitude: 40.50, longitude: 116.90,
    fishSpecies: ['鲈鱼', '翘嘴'], fishingMethod: '路亚', waterDepth: '4-6m', bottomType: '岩石底',
    tags: ['深水', '岩石底'], uploaderId: 'u2', images: [], likesCount: 51,
    downloadsCount: 210, distance: 3200, createdAt: '', updatedAt: '',
  },
  {
    id: 's5', name: '密云水库 · 北岸碎石滩', latitude: 40.52, longitude: 116.92,
    fishSpecies: ['翘嘴'], fishingMethod: '路亚', waterDepth: '3-5m', bottomType: '碎石',
    tags: ['碎石', '缓坡'], uploaderId: 'u2', images: [], likesCount: 38,
    downloadsCount: 160, distance: 4100, createdAt: '', updatedAt: '',
  },
  {
    id: 's6', name: '密云水库 · 杨树林浅滩', latitude: 40.54, longitude: 116.94,
    fishSpecies: ['鲫鱼', '白条'], fishingMethod: '台钓', waterDepth: '1-2m', bottomType: '泥底',
    tags: ['浅滩', '水草'], uploaderId: 'u2', images: [], likesCount: 44,
    downloadsCount: 180, distance: 5300, createdAt: '', updatedAt: '',
  },
  {
    id: 's7', name: '密云水库 · 西汊深潭', latitude: 40.53, longitude: 116.97,
    fishSpecies: ['鲈鱼'], fishingMethod: '路亚', waterDepth: '6-8m', bottomType: '岩石底',
    tags: ['深潭', '深水'], uploaderId: 'u2', images: [], likesCount: 33,
    downloadsCount: 140, distance: 6200, createdAt: '', updatedAt: '',
  },
  {
    id: 's8', name: '密云水库 · 出水口洄湾', latitude: 40.51, longitude: 116.99,
    fishSpecies: ['翘嘴', '鳜鱼'], fishingMethod: '路亚', waterDepth: '3-4m', bottomType: '碎石',
    tags: ['洄湾', '流水'], uploaderId: 'u2', images: [], likesCount: 29,
    downloadsCount: 120, distance: 7400, createdAt: '', updatedAt: '',
  },
];

export const mockRoutes: Route[] = [
  {
    id: 'r1', name: '密云水库北岸环线', description: '密云水库北岸经典路亚路线，涵盖12个优质坑点。',
    totalDistance: 18.5, bestSeason: '4-10月', tags: ['鲈鱼', '翘嘴', '路亚', '水库'],
    uploaderId: 'u1', uploader: { id: 'u2', nickname: '老张' },
    downloadsCount: 2340, likesCount: 180, featured: true,
    region: '北京 · 密云水库',
    routeTags: [
      { label: '环线' },
      { label: '岸钓 + 船钓', plain: true },
      { label: '中等难度', plain: true },
    ],
    startEnd: '起终点 · 北岸停车场 · 全程沿湖岸土路 + 两段乡道',
    durationHours: 5.5, elevationGain: 358,
    rating: 4.6, ratingCount: 96,
    authorBadge: '金牌探路者', authorShares: 23, authorDownloads: 4120,
    info: [
      { label: '路线类型', value: '环线 · 顺时针巡钓' },
      { label: '途经', value: '溪翁庄镇 · 不老屯 · 高岭镇北岸段' },
      { label: '路面情况', value: '湖岸土路 70% · 乡道 30%，雨后泥泞' },
      { label: '适钓方式', value: '路亚 · 台钓 · 筏钓（3 个坑点需船）' },
      { label: '最佳季节', value: '4–6 月、9–10 月（禁渔期勿入）' },
      { label: '数据大小', value: '离线包 24MB · 含坑点坐标与高程' },
    ],
    elevation: [180, 186, 198, 214, 228, 240, 252, 262, 275, 288, 290, 282, 268, 252, 236, 222, 208, 196, 188],
    elevationNote: '最高点 290m 位于 15km 处的望湖坡，整体坡度平缓，适合推车携带装备。',
    supplyInfo: [
      { label: '补水点', value: '溪翁庄加油站便利店（3km）· 高岭镇口小卖部（14km）' },
      { label: '紧急联系', value: '水库管理站 010-6901 xxxx · 全程有巡库道路可撤离' },
      { label: '停车', value: '北岸停车场免费 · 周末 7 点后基本满位' },
    ],
    warning: '高岭镇以北 6km 无手机信号，且水库部分区域为一级保护区禁止垂钓，请沿路线标注的开放段作钓。',
    sequence: [
      { title: '北岸停车场', tag: '起终点', kind: 'start', desc: '免费停车 · 建议清晨 5 点前到达占位，装备整理后沿湖岸土路出发。', dist: '出发 · 0.0km' },
      { title: '溪翁庄芦苇荡', tag: '路亚', desc: '水深 1.5–2.5m，清晨翘嘴活性高，水面系效果好。注意芦苇区抛竿方向。', dist: '步行 1.8km · 建议停留 45 分钟' },
      { title: '不老屯石梁', tag: '台钓', desc: '水深 3–4m，鲫鱼鲤鱼密度高，是全程最稳的台钓点。石底易挂，备铅。', dist: '步行 3.2km · 建议停留 90 分钟' },
      { title: '湖心暗岛', tag: '需船', desc: '水深 6m 下的隆起地形，船钓大物点，路亚深潜米诺可搜边。无船可跳过。', dist: '离岸 400m · 建议停留 60 分钟' },
      { title: '高岭湾口', tag: '筏钓', desc: '湾口洄流区，筏钓玉米打窝守鲤鱼，下午上口率持续走高。', dist: '步行 5.1km · 建议停留 2 小时' },
      { title: '返回北岸停车场', kind: 'end', desc: '沿巡库路南行 4.2km 返回，途经补给点可补水。', dist: '返程 4.2km · 全程结束' },
    ],
    offlineMb: 24,
    routeType: '环线', difficulty: '中等',
    spots: [
      { spot: mockSpots.find(s => s.id === 's4')!, sortOrder: 1, distance: 0 },
      { spot: mockSpots.find(s => s.id === 's5')!, sortOrder: 2, distance: 0 },
      { spot: mockSpots.find(s => s.id === 's6')!, sortOrder: 3, distance: 0 },
      { spot: mockSpots.find(s => s.id === 's7')!, sortOrder: 4, distance: 0 },
      { spot: mockSpots.find(s => s.id === 's8')!, sortOrder: 5, distance: 0 },
    ],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), updatedAt: '',
  },
  {
    id: 'r4', name: '碧溪湾 · 坑点巡钓路线',
    totalDistance: 4.2, tags: ['路亚', '鲈鱼'],
    uploaderId: 'u1', uploader: { id: 'u1', nickname: '路亚阿杰' },
    downloadsCount: 128, likesCount: 42, featured: false,
    routeType: '往返', difficulty: '休闲',
    spots: [], createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), updatedAt: '',
  },
  {
    id: 'r2', name: '太湖东山半岛路线',
    totalDistance: 9.2, tags: ['鲫鱼', '湖钓'],
    uploaderId: 'u1', uploader: { id: 'u3', nickname: '小王' },
    downloadsCount: 964, likesCount: 56, featured: false,
    routeType: '环线', difficulty: '休闲',
    spots: [], createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), updatedAt: '',
  },
  {
    id: 'r3', name: '千岛湖西南湾探钓路线',
    totalDistance: 7.8, tags: ['路亚', '鲈鱼'],
    uploaderId: 'u1', uploader: { id: 'u1', nickname: '路亚阿杰' },
    downloadsCount: 753, likesCount: 42, featured: false,
    routeType: '往返', difficulty: '休闲',
    spots: [], createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), updatedAt: '',
  },
  // 路线列表页扩充（ios-route-list 原型）
  {
    id: 'r5', name: '青山湖西坝夜钓环线',
    totalDistance: 11.2, tags: ['夜钓', '翘嘴'],
    uploaderId: 'u2', uploader: { id: 'u2', nickname: '老张' },
    downloadsCount: 588, likesCount: 71, featured: false,
    routeType: '环线', difficulty: '休闲',
    spots: [], createdAt: new Date(Date.now() - 4 * 86400000).toISOString(), updatedAt: '',
  },
  {
    id: 'r6', name: '苕溪古埠溪流穿越',
    totalDistance: 14.6, tags: ['溪流', '马口'],
    uploaderId: 'u5', uploader: { id: 'u5', nickname: '夜钓小分队' },
    downloadsCount: 412, likesCount: 50, featured: false,
    routeType: '穿越', difficulty: '中等',
    spots: [], createdAt: new Date(Date.now() - 14 * 86400000).toISOString(), updatedAt: '',
  },
  {
    id: 'r7', name: '富春江七里泷探钓线',
    totalDistance: 6.8, tags: ['路亚', '鳜鱼'],
    uploaderId: 'u4', uploader: { id: 'u4', nickname: '路亚老徐' },
    downloadsCount: 341, likesCount: 44, featured: false,
    routeType: '往返', difficulty: '挑战',
    spots: [], createdAt: new Date(Date.now() - 21 * 86400000).toISOString(), updatedAt: '',
  },
  {
    id: 'r8', name: '新安江白沙湾筏钓线',
    totalDistance: 3.5, tags: ['筏钓', '鳊鱼'],
    uploaderId: 'u6', uploader: { id: 'u6', nickname: '筏钓阿强' },
    downloadsCount: 176, likesCount: 30, featured: false,
    routeType: '往返', difficulty: '休闲',
    spots: [], createdAt: new Date(Date.now() - 30 * 86400000).toISOString(), updatedAt: '',
  },
];

export const mockFeeds: Feed[] = [
  {
    id: 'f1', userId: 'u1', user: { id: 'u1', nickname: '路亚阿杰' },
    content: '千岛湖#碧溪湾#今天爆护！下午 3 点到 5 点，亮片 VIB 慢收加停顿，湾口乱石堆连续起鱼。连杆鲈鱼 14 条，最大的一条 62cm，手感直接拉满。\n\n水温 24°C 东南风 2 级，窗口期非常准。坑点 1 和坑点 2 都出鱼，坑点 3 水深大建议搜底。作钓路线和标点我已经整理好分享在下面，兄弟们直接下载就能用。',
    location: '千岛湖', images: [], likesCount: 328, createdAt: new Date(Date.now() - 7200000).toISOString(),
    spotId: 's1', spot: { id: 's1', name: '千岛湖 · 碧溪湾' },
    locationDetail: '杭州 · 淳安 · 千岛湖碧溪湾 · 坑点1 湾口乱石堆',
    authorBadge: '金牌探路者', authorFollowers: 1204,
    photoLabels: ['渔获 62cm', '湾口标点', '作钓环境'],
    catchStats: { fish: '14 尾', maxLenCm: 62, hours: 2 },
    linkedRoute: { id: 'r1', name: '碧溪湾 · 坑点巡钓路线', spotsCount: 6, totalDistance: 4.2 },
    commentsCount: 46, sharesCount: 12,
    category: '爆护', authorFollowed: true,
  },
  {
    id: 'f2', userId: 'u2', user: { id: 'u2', nickname: '台钓老张' },
    content: '富春江钓台水位下降了半米，鲫鱼偏小，建议用 1.5 号线组。水深在 2.5-3 米比较好。',
    location: '富春江', images: [], likesCount: 96, createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    category: '坑点报告', authorFollowed: true, authorBadge: '坑点报告员',
    commentsCount: 18,
  },
  {
    id: 'f3', userId: 'u3', user: { id: 'u3', nickname: '新手小王' },
    content: '第一次去太湖东山，跟着下载的路线走，顺利找到三个坑点。感谢分享路线的前辈！整理了几点新手跟线心得。',
    location: '太湖', images: [], likesCount: 45, createdAt: new Date(Date.now() - 26 * 3600000).toISOString(),
    category: '技巧分享', commentsCount: 12,
  },
  // 动态列表页扩充（ios-feed-list 原型）
  {
    id: 'f4', userId: 'u5', user: { id: 'u5', nickname: '夜钓小分队' },
    content: '昨晚南湾网箱边翘嘴疯了，米诺匀收停顿就有口，12点前上了7条。注意防蚊，路线和夜钓点位已整理。',
    location: '千岛湖', images: [], likesCount: 210, createdAt: new Date(Date.now() - 34 * 3600000).toISOString(),
    category: '爆护', commentsCount: 33,
  },
  {
    id: 'f5', userId: 'u7', user: { id: 'u7', nickname: '库钓老周' },
    content: '湾心深坑船钓上过 12 斤青鱼，大物区名不虚传。湾口西段确实没信号，离线地图一定要提前下好。',
    location: '密云水库', images: [], likesCount: 189, createdAt: new Date(Date.now() - 50 * 3600000).toISOString(),
    category: '坑点报告', commentsCount: 21,
  },
  {
    id: 'f6', userId: 'u8', user: { id: 'u8', nickname: '溪流路亚人' },
    content: '溪流马口亮片攻略：2.5g 亮片逆流斜抛，收线略快于流速，重点搜碎石滩下游的缓水区。附标点示意。',
    location: '苕溪', images: [], likesCount: 156, createdAt: new Date(Date.now() - 72 * 3600000).toISOString(),
    category: '技巧分享', commentsCount: 27,
  },
  {
    id: 'f7', userId: 'u4', user: { id: 'u4', nickname: '路亚老徐' },
    content: '七里泷急流礁石区鳜鱼开口，深潜米诺贴底搜礁石背面，中了 4 条，最大 51cm。防挂建议用铅头钩。',
    location: '富春江', images: [], likesCount: 134, createdAt: new Date(Date.now() - 120 * 3600000).toISOString(),
    category: '爆护', commentsCount: 15,
  },
  {
    id: 'f8', userId: 'u6', user: { id: 'u6', nickname: '筏钓阿强' },
    content: '白沙湾筏钓点水位稳定，玉米打窝两小时后连上三条大鲤。筏钓路线已上传，共 4 个坑点。',
    location: '新安江', images: [], likesCount: 77, createdAt: new Date(Date.now() - 150 * 3600000).toISOString(),
    category: '坑点报告', commentsCount: 9,
  },
];

export const mockTutorials: Tutorial[] = [
  {
    id: 't1', type: 'video', title: '路亚入门必看：五种常用假饵的选择与操作手法',
    duration: '18:42', category: '路亚', tags: ['路亚', '新手', '假饵'],
    authorId: 'u1', author: { id: 'u1', nickname: '路亚阿杰' },
    // 公共示例视频源（w3.org sintel 预告片）：验证 expo-av 真实播放链路用。
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    viewsCount: 21000, likesCount: 320, featured: true,
    publishedAt: '', createdAt: '', updatedAt: '',
  },
  {
    id: 't2', type: 'video', title: '台钓调漂详解：从零到精准找底',
    duration: '12:35', category: '台钓', tags: ['台钓', '调漂'],
    authorId: 'u2', author: { id: 'u2', nickname: '台钓老张' },
    viewsCount: 8620, likesCount: 180, featured: false,
    publishedAt: '', createdAt: '', updatedAt: '',
  },
];

/** Spot detail reviews (评价 tab) — mirrors the ios-spot-detail prototype. */
export const mockSpotReviews: SpotReview[] = [
  {
    id: 'rv1', spotId: 's1', user: { id: 'u3', nickname: '溪流路亚人' },
    rating: 5, text: '标点清晰，跟着巡钓路线走很顺。湾口乱石堆中了一条 58cm 的鲈鱼，体验拉满。西岸停车确实方便，就是周末人多。',
    tags: ['标点准确', '适合路亚', '停车方便'],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'rv2', spotId: 's1', user: { id: 'u4', nickname: '新手小王' },
    rating: 4, text: '第一次来，下载路线后直达坑点，没走冤枉路。东岸水草边清晨口很好，就是蚊虫多，记得带驱蚊液。',
    tags: ['路线好找', '适合新手', '蚊虫多'],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'rv3', spotId: 's1', user: { id: 'u2', nickname: '库钓老周' },
    rating: 5, text: '湾心深坑船钓上过 12 斤青鱼，大物区名不虚传。但湾口西段确实没信号，离线地图一定要提前下好。',
    tags: ['大物区', '需船钓', '信号弱'],
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
];

/** Route detail reviews (评价 tab) — mirrors the ios-route-detail prototype. */
export const mockRouteReviews: RouteReview[] = [
  {
    id: 'rr1', routeId: 'r1', user: { id: 'u3', nickname: '环湖老李' },
    rating: 5, text: '路线标注非常细，连哪个点需要船都写了。按顺序走完 5 个点，不老屯石梁上了 20 多条鲫鱼。离线导航在高岭镇没信号段照样能用。',
    tags: ['标注细致', '离线可用', '强度适中'],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'rr2', routeId: 'r1', user: { id: 'u4', nickname: '路亚新手小陈' },
    rating: 4, text: '第一次跑全程，18.5km 走下来比想象中累，建议电动车或自行车。湖心暗岛那段没有船只能看别人上鱼，眼馋。其余坑点都好找。',
    tags: ['路线清晰', '建议骑行', '部分需船'],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'rr3', routeId: 'r1', user: { id: 'u2', nickname: '筏钓阿强' },
    rating: 5, text: '高岭湾口打窝两小时后连上三条大鲤，这条路线对筏钓党很友好。就是雨后土路泥得走不动，出发前看好天气。',
    tags: ['大物概率高', '雨后难行'],
    createdAt: new Date(Date.now() - 21 * 86400000).toISOString(),
  },
];

/** Post-detail comments (含作者楼中楼回复) — mirrors the ios-post-detail prototype. */
export const mockPostComments: PostComment[] = [
  {
    id: 'pc1', feedId: 'f1', user: { id: 'u2', nickname: '台钓老张' },
    content: '下午湾口风不小，你们那边抛竿没受影响？',
    likesCount: 12, createdAt: new Date(Date.now() - 7200000).toISOString(),
    reply: { content: '湾口背风面没事，VIB 自重大风天反而更好抛。你可以站坑点 2 西侧试。' },
  },
  {
    // 楼层回复示例：挂在 pc1 下的钓友回复。
    id: 'pc1-r1', feedId: 'f1', parentId: 'pc1', user: { id: 'u6', nickname: '路亚小新' },
    content: '确实，我上周也是站西侧，逆风也能打到乱石区边上。',
    likesCount: 3, createdAt: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    id: 'pc2', feedId: 'f1', user: { id: 'u3', nickname: '新手小王' },
    content: 'VIB 用的多少克？匀收速度有讲究吗，每次我收太快感觉没口。',
    likesCount: 8, createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'pc3', feedId: 'f1', user: { id: 'u4', nickname: '路亚老徐' },
    content: '62cm 的湾区鲈鱼相当可以了，密度明显起来了。周末去蹲一波。',
    likesCount: 5, createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'pc4', feedId: 'f1', user: { id: 'u5', nickname: '夜钓小分队' },
    content: '白天都这口了，晚上南湾网箱边不敢想。路线已下载，感谢分享！',
    likesCount: 3, createdAt: new Date(Date.now() - 2700000).toISOString(),
  },
];

/** Mall products (渔具商城) — mirrors the ios-mall prototype. */
export const mockMallProducts: MallProduct[] = [
  { id: 'm1', name: '碧溪路亚竿 · M调直柄', spec: '2.1m · 7-18g · 快调', category: '路亚竿', price: 329, sold: 2100, flag: '新品' },
  { id: 'm2', name: '竞技直柄竿 · ML调', spec: '1.98m · 4-12g · 超快调', category: '路亚竿', price: 588, sold: 864, flag: '专场' },
  { id: 'm3', name: '纺车轮 · 3000型浅线杯', spec: '5+1 轴承 · 4.9:1', category: '渔轮', price: 199, sold: 3400, flag: '热销' },
  { id: 'm4', name: '金属VIB亮片 · 7g 六件套', spec: '夜光/金色/银色 各 2', category: '假饵', price: 45, sold: 5200, flag: '热销' },
  { id: 'm5', name: '深潜米诺 · 9cm 悬浮款', spec: '1.2-1.8m 潜深', category: '假饵', price: 38, sold: 1800 },
  { id: 'm6', name: '台钓竿 · 5.4m 超轻碳素', spec: '28调 · 98g', category: '台钓', price: 268, sold: 1200 },
  { id: 'm7', name: '折叠钓椅 · 带靠背', spec: '承重 150kg · 1.9kg', category: '台钓', price: 98, sold: 980 },
  { id: 'm8', name: 'PE 编织线 · 0.8 编 150m', spec: '8股 · 磨灰色', category: '配件', price: 56, sold: 2700 },
  { id: 'm9', name: '钓鱼防晒衣 · UPF50+', spec: '冰感 · 连帽款', category: '配件', price: 129, sold: 4600, flag: '热销' },
  { id: 'm10', name: '铝合金抄网 · 2m 伸缩', spec: '网口 45cm · 无结网布', category: '配件', price: 69, sold: 1500 },
];

/* ────────────────────────────────────────────────────────────
 * 以下数据对照 2026-10-28 新增原型页（订单/地址/消息/技巧列表/
 * 文章详情/购物车/商品详情），商城与消息链路暂为端上 mock。
 * ──────────────────────────────────────────────────────────── */

/** 商城订单（ios-orders.html）。icon 为 Ionicons 图标名。 */
export interface MockOrder {
  id: string;
  status: 'unpaid' | 'shipping' | 'done';
  statusLabel: string;
  name: string;
  spec: string;
  price: number;
  icon: string;
  /** 物流信息（待收货显示）。 */
  logi?: string;
  time: string;
}

export const mockOrders: MockOrder[] = [
  {
    id: 'OD10261024', status: 'shipping', statusLabel: '待收货 · 运输中',
    name: '碧溪路亚竿 · M调直柄', spec: '2.1m · M调 × 1', price: 329, icon: 'color-filter-outline',
    logi: '顺丰速运 · 已到【杭州转运中心】，预计明日送达',
    time: '2026-10-24 下单',
  },
  {
    id: 'OD10261018', status: 'unpaid', statusLabel: '待付款',
    name: '金属VIB亮片 · 7g 六件套', spec: '夜光/金色/银色 各 2 × 2', price: 90, icon: 'fish-outline',
    time: '2026-10-18 下单 · 剩余 22:41:05 自动关闭',
  },
  {
    id: 'OD10260930', status: 'done', statusLabel: '已完成',
    name: '钓鱼防晒衣 · UPF50+', spec: '冰感 · 连帽款 · L码 × 1', price: 129, icon: 'shirt-outline',
    time: '2026-09-30 下单 · 10-03 签收',
  },
  {
    id: 'OD10260912', status: 'done', statusLabel: '已完成',
    name: '折叠钓椅 · 带靠背', spec: '承重 150kg · 1.9kg × 1', price: 98, icon: 'chair-outline',
    time: '2026-09-12 下单 · 09-14 签收',
  },
];

/** 收货地址（ios-address.html）。 */
export interface MockAddress {
  id: number;
  name: string;
  tel: string;
  region: string;
  detail: string;
  def: boolean;
}

export const mockAddresses: MockAddress[] = [
  { id: 1, name: '路亚阿杰', tel: '13857666688', region: '浙江省 杭州市 滨江区', detail: '江南大道 588 号滨江钓具城 3 幢 210 室', def: true },
  { id: 2, name: '路亚阿杰', tel: '13857666688', region: '浙江省 杭州市 淳安县', detail: '千岛湖镇秀水街 76 号（湖畔驿站代收）', def: false },
];

/** 消息中心（ios-messages.html）。cat: bite 出鱼提醒 / star 赞与收藏 / cmt 评论与@ / sys 系统通知。 */
export interface MockMessage {
  id: number;
  cat: 'bite' | 'star' | 'cmt' | 'sys';
  title: string;
  text: string;
  time: string;
  unread: boolean;
}

export const mockMessages: MockMessage[] = [
  {
    id: 1, cat: 'bite', unread: true, time: '3分钟前',
    title: '碧溪湾 16:00-18:00 进入出鱼窗口',
    text: '当前水温 18.5℃，符合翘嘴活跃区间，你收藏的标点「碧溪湾东岸乱石区」预计半小时后开口。',
  },
  {
    id: 2, cat: 'star', unread: true, time: '1小时前',
    title: '龙溪筏客 收藏了你的路线',
    text: '你的路线「密云水库北岸环线（12 坑点）」被收藏，累计下载 2,148 次。',
  },
  {
    id: 3, cat: 'cmt', unread: true, time: '2小时前',
    title: '老张 评论了你的技巧《VIB 收线速度与水深的关系》',
    text: '「收线速度那段讲得透，上周末照着钓，中层果然搜到翘嘴。」',
  },
  {
    id: 4, cat: 'bite', unread: false, time: '昨天 19:20',
    title: '富春江钓台明日 05:30 迎来晨口窗口',
    text: '根据近 7 天出鱼记录与气压变化，明晨窗口预计 05:30-07:00，记得提前到点打窝。',
  },
  {
    id: 5, cat: 'sys', unread: false, time: '昨天 10:00',
    title: '渔路 v1.2.0 更新说明',
    text: '新增坑点路线离线下载、出鱼窗口智能提醒；优化坑点地图缩放手感。',
  },
  {
    id: 6, cat: 'star', unread: false, time: '2天前',
    title: '小王 赞了你的动态',
    text: '你的动态「千岛湖碧溪湾爆护全记录 · 86 尾」收到新的点赞。',
  },
];

/** 我的技巧分享列表（ios-tips-list.html）。 */
export interface MockTip {
  id: string;
  cat: string;
  title: string;
  note: string;
  fav: number;
  cmt: number;
  time: string;
  hot: boolean;
}

export const mockMyTips: MockTip[] = [
  { id: 'vib-speed', cat: '路亚', title: 'VIB 收线速度与水深的关系', hot: true, fav: 128, cmt: 42, time: '5天前', note: '匀速慢收藏底、抽停诱攻击，7g VIB 实测三档速度对应泳层' },
  { id: 'bixi-log', cat: '路亚', title: '千岛湖碧溪湾爆护全记录', hot: false, fav: 86, cmt: 35, time: '2周前', note: '86 尾翘嘴的完整作钓日志：标点、饵色与窗口期复盘' },
  { id: 'autumn-window', cat: '路亚', title: '秋季翘嘴窗口期作钓笔记', hot: false, fav: 54, cmt: 18, time: '3周前', note: '换季温差下早晚窗口的变化规律，附 10 月实测水温' },
  { id: 'grass-hole', cat: '台钓', title: '长竿短线钓草洞的经验总结', hot: false, fav: 47, cmt: 12, time: '1月前', note: '草洞选位三要素与逗钓手法，跑鱼率直降一半' },
  { id: 'night-light', cat: '装备', title: '夜钓灯选择与摆放位置', hot: false, fav: 33, cmt: 9, time: '1月前', note: '蓝光/白光/紫光的取舍，灯位与钓位的夹角讲究' },
  { id: 'double-hook', cat: '绑钩', title: '子线双钩绑法图解', hot: false, fav: 61, cmt: 23, time: '2月前', note: '内绑式与外绑式的强度对比，新手一次成功率更高的绑法' },
];

/** 精选文章正文块（ios-article-detail.html / ios-article-night.html）。 */
export type ArticleBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'table'; caption?: string; header: string[]; rows: string[][] };

export interface MockArticle {
  id: string;
  eyebrow: string;
  title: string;
  author: string;
  authorSub: string;
  readMeta: string;
  /** hero 示意类型：temp 水温鱼层 / night 夜钓场景。 */
  heroKind: 'temp' | 'night';
  blocks: ArticleBlock[];
  related: { title: string; sub: string; dur: string }[];
}

export const mockArticles: MockArticle[] = [
  {
    id: 'a1', eyebrow: '经验分享', title: '如何通过水温判断当天鱼层位置',
    author: '老张', authorSub: '台钓 12 年 · 碧溪湾常驻 · 89 篇分享',
    readMeta: '阅读 5 分钟 · 3,200 次阅读', heroKind: 'temp',
    blocks: [
      { type: 'p', text: '水温是影响鱼层分布最关键的因素之一。多数钓友看天气、看风问，却常常忽略一件最简单的事：先测水温，再定钓深。本文结合碧溪湾全年的作钓记录，把不同温度区间的鱼层规律整理成一张表，帮你少走弯路。' },
      { type: 'h2', text: '一、为什么水温决定鱼层' },
      { type: 'p', text: '淡水鱼是变温动物，体温随水温浮动，水温直接决定它们的活性与停留水层。水温偏低时鱼会退向深水保温，偏高时又会浮向中上层避暑——鱼不是固定在某个水层，而是跟着舒适温度带移动。找到当天的舒适带，就找到了鱼层。' },
      { type: 'h2', text: '二、三个关键温度区间' },
      { type: 'table', caption: '碧溪湾全年记录整理 · 水面下 0.5m 测温', header: ['水温区间', '活跃鱼层', '建议钓法'], rows: [
        ['8-12℃', '深层 3-4.5m', '慢节奏底层，饵料贴底'],
        ['15-20℃', '中层 1.5-3m', '全泳层搜索，窗口最稳'],
        ['25℃ 以上', '表层-上层 0-1.5m', '早晚窗口，浅水标点'],
      ] },
      { type: 'p', text: '15-20℃ 是碧溪湾一年中出鱼最稳的区间，几乎全天有口；两头的极端温度则要把重心压到早晚两个窗口。' },
      { type: 'h2', text: '三、实战：把规律用起来' },
      { type: 'p', text: '到钓点后先别急着开竿。用测温线组测三个深度：0.5m、2m、4m，哪一层最接近 16-19℃，就先把搜索重心放在哪一层。秋季降温期尤其明显——别迷信昨天的渔获水深，温差 3℃ 鱼层可能整层上移或下移一米。' },
      { type: 'quote', text: '口诀：春钓滩、夏钓潭、秋钓荫、冬钓深——本质都是跟着水温的舒适带走。' },
      { type: 'h2', text: '四、两个常见误区' },
      { type: 'p', text: '误区一：只看气温。气温 28℃ 的晴天，深层水温可能才 16℃，鱼仍在深水。水温和气温经常相差 5℃ 以上，别被体感骗了。' },
      { type: 'p', text: '误区二：一个钓深钓全天。上午出鱼的深度，午后往往就空了。水温随日照变化，鱼层也在变，两三个小时复测一次水温并不麻烦。' },
      { type: 'p', text: '水温计几十块钱，却是回报率最高的一件小装备。下次出钓，先测水温、再定鱼层，祝你爆护。' },
    ],
    related: [
      { title: '四季鱼情与水温关系详解', sub: '老张 · 专题课 · 1.2 万次学习', dur: '08:32' },
      { title: '碧溪湾四季作钓全攻略', sub: '路亚阿杰 · 路亚系列 · 8,600 次学习', dur: '12:05' },
    ],
  },
  {
    id: 'a2', eyebrow: '装备指南', title: '夏季夜钓装备清单：从照明到安全防护',
    author: '阿杰', authorSub: '路亚 8 年 · 千岛湖常驻 · 56 篇分享',
    readMeta: '阅读 8 分钟 · 2,100 次阅读', heroKind: 'night',
    blocks: [
      { type: 'p', text: '夜钓是夏季最爽的作钓方式——白天躲人的大鱼敢靠边，水温回落鱼口更实。但夜间环境复杂，安全和装备缺一不可。这份清单按「照明、防蚊、安全、作钓」四类整理，照着备齐再出门。' },
      { type: 'h2', text: '一、照明：一主二辅，蓝光为主' },
      { type: 'p', text: '夜钓灯是夜钓的灵魂。建议蓝光为主灯（穿透好、不惊鱼、诱虫少），白光头灯做辅助（走位、解鱼、收线时用），再加一盏小型营地灯放在钓箱旁。蓝光注意选可调档位的产品，直射水面反而压口。' },
      { type: 'p', text: '灯位讲究：钓灯放在侧后方，与浮漂呈 60° 左右夹角，既看得清漂又不把光柱砸在窝点上。' },
      { type: 'h2', text: '二、防蚊防晒：别让蚊子毁了口' },
      { type: 'p', text: '水边蚊虫傍晚最凶。长袖长裤是基础，驱蚊液选避蚊胺浓度 15% 以上的，每 3-4 小时补一次；钓位周围点一盘蚊香做底线。防晒别松懈——夏夜 18-19 点的紫外线依然能晒伤，防晒衣直接当夜钓外套穿，一举两得。' },
      { type: 'h2', text: '三、安全防护：三条红线不能碰' },
      { type: 'p', text: '红线一：救生衣。夜钓近水，落水看不见、喊不应，充气救生衣一百多块，比什么都值。红线二：防滑鞋。夜露让石头和苔藓像抹了油，溯溪鞋或钉底鞋必备。红线三：结伴或报备。独自夜钓要把钓位发给家人，手机充满电并带充电宝。' },
      { type: 'h2', text: '四、完整清单（勾选版）' },
      { type: 'table', header: ['类别', '装备', '要点'], rows: [
        ['照明', '蓝光钓灯 · 头灯 · 营地灯', '必备 · 可调档、备用电池'],
        ['安全', '充气救生衣 · 防滑鞋', '必备 · 近水红线'],
        ['防蚊', '驱蚊液 · 蚊香 · 长袖长裤', '避蚊胺 ≥15%'],
        ['作钓', '夜光漂 · 夜钓竿 · 备线组', '漂尾加亮豆更醒目'],
        ['辅助', '充电宝 · 防水包 · 保温水壶', '手机防水袋别忘'],
      ] },
    ],
    related: [
      { title: '夜钓翘嘴：窗口与标点选择', sub: '龙溪筏客 · 实战系列 · 6,300 次学习', dur: '10:18' },
    ],
  },
  /* ── 法律文案（设置页协议/隐私入口，模板草案，正式文案待法务审订） ── */
  {
    id: 'terms', eyebrow: '用户协议', title: '渔路 YULU 用户服务协议',
    author: '渔路团队', authorSub: '更新日期 2026-10-28 · 模板草案',
    readMeta: '阅读 3 分钟 · v0.1', heroKind: 'temp',
    blocks: [
      { type: 'p', text: '欢迎使用渔路 YULU。本协议是您与渔路团队之间关于使用本 App 所订立的契约。请您在注册与使用前仔细阅读，一旦注册或使用即视为同意本协议全部条款。' },
      { type: 'h2', text: '一、账号与注册' },
      { type: 'p', text: '您需使用真实有效的手机号注册，并妥善保管账号与密码。通过账号进行的一切操作均视为您本人行为。若发现账号被盗用，请立即联系客服处理。' },
      { type: 'h2', text: '二、用户内容' },
      { type: 'p', text: '您在渔路发布的坑点、路线、技巧与动态等内容，著作权归您所有；您授权渔路在提供服务的范围内展示与传播这些内容。请勿发布虚假钓况、违法信息或侵犯他人权益的内容，渔路有权对违规内容下架并对账号处置。' },
      { type: 'h2', text: '三、安全提示' },
      { type: 'p', text: '垂钓活动本身存在风险。渔路提供的钓点信息、天气与出鱼建议仅供参考，不构成安全保证。请在合法水域、遵守当地禁渔规定的前提下作钓，并注意人身安全。' },
      { type: 'h2', text: '四、服务变更与终止' },
      { type: 'p', text: '渔路可能对服务内容进行调整、暂停或终止。您可以随时注销账号；注销后您的数据将按隐私政策处理。' },
      { type: 'quote', text: '本文案为模板草案，正式版本将由法务审订后在应用上架前发布。' },
    ],
    related: [],
  },
  {
    id: 'privacy', eyebrow: '隐私政策', title: '渔路 YULU 隐私政策',
    author: '渔路团队', authorSub: '更新日期 2026-10-28 · 模板草案',
    readMeta: '阅读 4 分钟 · v0.1', heroKind: 'night',
    blocks: [
      { type: 'p', text: '渔路非常重视您的个人信息保护。本政策说明我们收集哪些信息、如何使用与保护它们。' },
      { type: 'h2', text: '一、我们收集的信息' },
      { type: 'table', header: ['信息类型', '内容', '用途'], rows: [
        ['账号信息', '手机号、昵称、头像', '注册登录与身份识别'],
        ['位置信息', '仅用于附近钓点与导航', '您可在系统设置中关闭'],
        ['设备信息', '推送令牌、设备型号', '消息推送与故障排查'],
        ['内容数据', '您发布的坑点/路线/动态', '按您的意愿公开展示'],
      ] },
      { type: 'h2', text: '二、信息的使用' },
      { type: 'p', text: '我们仅在提供垂钓社区服务所必需的范围内使用您的信息：展示附近钓点、计算路线导航、推送您订阅的出鱼提醒与互动消息。我们不会将您的个人信息出售给任何第三方。' },
      { type: 'h2', text: '三、信息的存储与保护' },
      { type: 'p', text: '您的数据存储于境内的服务器，传输过程使用 HTTPS 加密。我们采取业界通行的安全措施防止数据泄露、篡改与丢失。' },
      { type: 'h2', text: '四、您的权利' },
      { type: 'p', text: '您可以在「设置」中修改资料、修改密码或注销账号。注销后我们将在合理期限内删除或匿名化您的个人信息，法律法规要求保留的除外。' },
      { type: 'quote', text: '本文案为模板草案，正式版本将由法务审订后在应用上架前发布。' },
    ],
    related: [],
  },
];
