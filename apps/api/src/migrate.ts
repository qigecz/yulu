import { query } from './config/database';

async function migrate() {
  console.log('Running migrations...');

  await query(`CREATE EXTENSION IF NOT EXISTS postgis`);
  await query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      phone VARCHAR(20) UNIQUE,
      email VARCHAR(255) UNIQUE,
      password_hash TEXT NOT NULL,
      nickname VARCHAR(50) NOT NULL,
      avatar_url TEXT,
      bio TEXT,
      spots_count INT DEFAULT 0,
      routes_count INT DEFAULT 0,
      likes_count INT DEFAULT 0,
      followers_count INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS spots (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(200) NOT NULL,
      description TEXT,
      location GEOMETRY(Point, 4326) NOT NULL,
      fish_species TEXT[] DEFAULT '{}',
      fishing_method VARCHAR(50),
      water_depth VARCHAR(50),
      bottom_type VARCHAR(50),
      tags TEXT[] DEFAULT '{}',
      uploader_id UUID NOT NULL REFERENCES users(id),
      images TEXT[] DEFAULT '{}',
      likes_count INT DEFAULT 0,
      downloads_count INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_spots_location ON spots USING GIST(location)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_spots_uploader ON spots(uploader_id)`);

  await query(`
    CREATE TABLE IF NOT EXISTS routes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(200) NOT NULL,
      description TEXT,
      total_distance DECIMAL(10,2),
      best_season VARCHAR(100),
      tags TEXT[] DEFAULT '{}',
      uploader_id UUID NOT NULL REFERENCES users(id),
      downloads_count INT DEFAULT 0,
      likes_count INT DEFAULT 0,
      featured BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS route_spots (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
      spot_id UUID NOT NULL REFERENCES spots(id),
      sort_order INT NOT NULL,
      UNIQUE(route_id, spot_id, sort_order)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS tutorials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type VARCHAR(20) NOT NULL CHECK(type IN ('video','article')),
      title VARCHAR(300) NOT NULL,
      content TEXT,
      cover_url TEXT,
      video_url TEXT,
      duration VARCHAR(10),
      read_time VARCHAR(10),
      category VARCHAR(50),
      tags TEXT[] DEFAULT '{}',
      author_id UUID NOT NULL REFERENCES users(id),
      views_count INT DEFAULT 0,
      likes_count INT DEFAULT 0,
      featured BOOLEAN DEFAULT FALSE,
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS feeds (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      location VARCHAR(200),
      images TEXT[] DEFAULT '{}',
      spot_id UUID REFERENCES spots(id),
      likes_count INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS route_downloads (
      user_id UUID REFERENCES users(id),
      route_id UUID REFERENCES routes(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY(user_id, route_id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS spot_likes (
      user_id UUID REFERENCES users(id),
      spot_id UUID REFERENCES spots(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY(user_id, spot_id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS feed_likes (
      user_id UUID REFERENCES users(id),
      feed_id UUID REFERENCES feeds(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY(user_id, feed_id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS favorites (
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      target_type VARCHAR(20) NOT NULL CHECK(target_type IN ('spot','feed','route')),
      target_id UUID NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY(user_id, target_type, target_id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS follows (
      follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
      following_id UUID REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY(follower_id, following_id),
      CHECK (follower_id <> following_id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      target_type VARCHAR(20) NOT NULL CHECK(target_type IN ('feed','spot')),
      target_id UUID NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id, created_at DESC)`);

  await query(`
    CREATE TABLE IF NOT EXISTS push_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL,
      platform VARCHAR(10) CHECK(platform IN ('ios','android','web')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, token)
    )
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON push_tokens(user_id)`);

  console.log('Migrations complete!');
  process.exit(0);
}

migrate().catch((err) => { console.error(err); process.exit(1); });
