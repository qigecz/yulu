import type { Spot, Route, Feed, Tutorial, User, Weather } from '@yulu/shared';

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
    content: '千岛湖碧溪湾今天爆护！用了亮片VIB，下午3点到5点连杆鲈鱼，最大的62cm。路线已分享。',
    location: '千岛湖', images: [], likesCount: 24, createdAt: new Date(Date.now() - 7200000).toISOString(),
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
