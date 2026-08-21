import type { Spot, Route, Feed, Tutorial, User, Weather, SpotReview, RouteReview, PostComment } from '@yulu/shared';

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
    id: 's2', name: '富春江 · 钓台', latitude: 29.9, longitude: 119.7,
    fishSpecies: ['鲫鱼'], fishingMethod: '台钓', waterDepth: '2-3m', bottomType: '沙底',
    tags: ['缓流', '沙底'], uploaderId: 'u1', images: [], likesCount: 35,
    downloadsCount: 89, distance: 5100, createdAt: '', updatedAt: '',
  },
  {
    id: 's3', name: '太湖 · 东山半岛', latitude: 31.1, longitude: 120.5,
    fishSpecies: ['综合'], fishingMethod: '湖钓', waterDepth: '1-2m', bottomType: '水草',
    tags: ['浅滩', '水草'], uploaderId: 'u1', images: [], likesCount: 28,
    downloadsCount: 67, distance: 8700, createdAt: '', updatedAt: '',
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
    spots: [
      { spot: mockSpots.find(s => s.id === 's4')!, sortOrder: 1, distance: 0 },
      { spot: mockSpots.find(s => s.id === 's5')!, sortOrder: 2, distance: 0 },
      { spot: mockSpots.find(s => s.id === 's6')!, sortOrder: 3, distance: 0 },
      { spot: mockSpots.find(s => s.id === 's7')!, sortOrder: 4, distance: 0 },
      { spot: mockSpots.find(s => s.id === 's8')!, sortOrder: 5, distance: 0 },
    ],
    createdAt: '', updatedAt: '',
  },
  {
    id: 'r2', name: '太湖东山半岛路线',
    totalDistance: 9.2, tags: ['鲫鱼', '湖钓'],
    uploaderId: 'u1', uploader: { id: 'u3', nickname: '小王' },
    downloadsCount: 890, likesCount: 56, featured: false,
    spots: [], createdAt: '', updatedAt: '',
  },
  {
    id: 'r3', name: '千岛湖西南湾探钓路线',
    totalDistance: 7.8, tags: ['路亚', '鲈鱼'],
    uploaderId: 'u1', uploader: { id: 'u1', nickname: '路亚阿杰' },
    downloadsCount: 340, likesCount: 42, featured: false,
    spots: [], createdAt: '', updatedAt: '',
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
  },
  {
    id: 'f2', userId: 'u2', user: { id: 'u2', nickname: '台钓老张' },
    content: '富春江钓台水位下降了半米，鲫鱼偏小，建议用 1.5 号线组。水深在 2.5-3 米比较好。',
    location: '富春江', images: [], likesCount: 18, createdAt: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    id: 'f3', userId: 'u3', user: { id: 'u3', nickname: '新手小王' },
    content: '第一次去太湖东山，跟着下载的路线走，顺利找到三个坑点。感谢分享路线的前辈！',
    location: '太湖', images: [], likesCount: 12, createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const mockTutorials: Tutorial[] = [
  {
    id: 't1', type: 'video', title: '路亚入门必看：五种常用假饵的选择与操作手法',
    duration: '18:42', category: '路亚', tags: ['路亚', '新手', '假饵'],
    authorId: 'u1', author: { id: 'u1', nickname: '路亚阿杰' },
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
