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

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/spots', spotRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/tutorials', tutorialRoutes);
app.use('/api/feeds', feedRoutes);
app.use('/api/weather', weatherRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`YULU API running on port ${env.PORT}`);
});

export default app;
