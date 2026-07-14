import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import spotRoutes from './routes/spots';
import routeRoutes from './routes/routes';
import tutorialRoutes from './routes/tutorials';
import feedRoutes from './routes/feeds';
import weatherRoutes from './routes/weather';
import favoriteRoutes from './routes/favorites';
import userRoutes from './routes/users';
import commentRoutes from './routes/comments';
import uploadRoutes from './routes/uploads';
import { PUBLIC_PATH, UPLOAD_DIR } from './config/storage';
import fs from 'fs';

const app = express();

// Ensure the upload directory exists, then serve it statically.
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(PUBLIC_PATH, express.static(UPLOAD_DIR));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/spots', spotRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/tutorials', tutorialRoutes);
app.use('/api/feeds', feedRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/uploads', uploadRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`YULU API running on port ${env.PORT}`);
});

export default app;
