import { query } from './config/database';

async function seed() {
  console.log('Seeding database...');

  // Create test user
  const userRes = await query(`
    INSERT INTO users (phone, password_hash, nickname, bio, spots_count, routes_count, likes_count, followers_count)
    VALUES ('13800000001', '$2a$12$placeholder', '路亚阿杰', '路亚爱好者 · 浙江 · 千岛湖', 23, 8, 156, 89)
    ON CONFLICT (phone) DO UPDATE SET nickname = EXCLUDED.nickname
    RETURNING id
  `);
  const userId = userRes.rows[0].id;

  // Seed spots
  const spots = [
    { name: '千岛湖 · 碧溪湾', lat: 29.6, lng: 118.9, species: ['鲈鱼'], method: '路亚', depth: '4-6m', bottom: '岩石底', tags: ['深水', '岩石底'] },
    { name: '富春江 · 钓台', lat: 29.9, lng: 119.7, species: ['鲫鱼'], method: '台钓', depth: '2-3m', bottom: '沙底', tags: ['缓流', '沙底'] },
    { name: '太湖 · 东山半岛', lat: 31.1, lng: 120.5, species: ['综合'], method: '湖钓', depth: '1-2m', bottom: '水草', tags: ['浅滩', '水草'] },
    { name: '密云水库 · 碧溪湾东岸深水区', lat: 40.5, lng: 116.9, species: ['鲈鱼'], method: '路亚', depth: '4-6m', bottom: '岩石底', tags: ['深水'] },
    { name: '密云水库 · 北岸碎石滩', lat: 40.52, lng: 116.92, species: ['翘嘴'], method: '路亚', depth: '2-3m', bottom: '碎石', tags: ['碎石'] },
    { name: '密云水库 · 杨树林浅滩', lat: 40.54, lng: 116.94, species: ['鲫鱼'], method: '台钓', depth: '1-2m', bottom: '水草', tags: ['水草'] },
  ];

  const spotIds: string[] = [];
  for (const s of spots) {
    const res = await query(
      `INSERT INTO spots (name, location, fish_species, fishing_method, water_depth, bottom_type, tags, uploader_id)
       VALUES ($1, ST_SetSRID(ST_MakePoint($3, $2), 4326), $4, $5, $6, $7, $8, $9) RETURNING id`,
      [s.name, s.lat, s.lng, s.species, s.method, s.depth, s.bottom, s.tags, userId]
    );
    spotIds.push(res.rows[0].id);
  }

  // Seed route
  const routeRes = await query(
    `INSERT INTO routes (name, description, total_distance, best_season, tags, uploader_id, downloads_count, featured)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    ['密云水库北岸环线', '密云水库北岸经典路亚路线，涵盖12个优质坑点。从东岸出发，沿北岸绕行，覆盖深水区和浅滩。', 18.5, '4-10月', ['鲈鱼', '翘嘴', '路亚', '水库'], userId, 2340, true]
  );
  const routeId = routeRes.rows[0].id;

  // Link spots to route
  for (let i = 0; i < spotIds.length; i++) {
    await query(
      `INSERT INTO route_spots (route_id, spot_id, sort_order) VALUES ($1, $2, $3)`,
      [routeId, spotIds[i], i + 1]
    );
  }

  // Seed tutorials
  await query(
    `INSERT INTO tutorials (type, title, duration, category, tags, author_id, views_count, featured, published_at)
     VALUES ('video', '路亚入门必看：五种常用假饵的选择与操作手法', '18:42', '路亚', ARRAY['路亚','新手','假饵'], $1, 21000, true, NOW())`,
    [userId]
  );
  await query(
    `INSERT INTO tutorials (type, title, duration, category, tags, author_id, views_count, published_at)
     VALUES ('video', '台钓调漂详解：从零到精准找底', '12:35', '台钓', ARRAY['台钓','调漂'], $1, 8620, NOW())`,
    [userId]
  );
  await query(
    `INSERT INTO tutorials (type, title, read_time, category, tags, author_id, views_count, published_at)
     VALUES ('article', '如何通过水温判断当天鱼层位置', '5 分钟', '坑点技巧', ARRAY['水温','鱼层'], $1, 3200, NOW())`,
    [userId]
  );

  // Seed feeds
  await query(
    `INSERT INTO feeds (user_id, content, location) VALUES ($1, $2, $3)`,
    [userId, '千岛湖碧溪湾今天爆护！用了亮片VIB，下午3点到5点连杆鲈鱼，最大的62cm。路线已分享。', '千岛湖']
  );
  await query(
    `INSERT INTO feeds (user_id, content, location) VALUES ($1, $2, $3)`,
    [userId, '富春江钓台水位下降了半米，鲫鱼偏小，建议用 1.5 号线组。水深在 2.5-3 米比较好。', '富春江']
  );

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
