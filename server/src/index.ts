import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import artworkRoutes from './routes/artworkRoutes';
import eventRoutes from './routes/eventRoutes';
import exhibitionRoutes from './routes/exhibitionRoutes';
import contactRoutes from './routes/contactRoutes';
import adminRoutes from './routes/adminRoutes';
import homeRoutes from './routes/homeRoutes';
import cors from 'cors';
import path from 'path';
import { promises as fs } from 'fs';

dotenv.config();

const app: Express = express();
const port = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const uploadsDir = path.join(__dirname, '../uploads');
fs.mkdir(uploadsDir, { recursive: true })
  .then(() => console.log('Uploads directory ensured:', uploadsDir))
  .catch((err) => console.error('Failed to ensure uploads directory:', err));

const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(express.json());
app.use(
  cors({
    origin: configuredOrigins.length
      ? configuredOrigins
      : isProduction
        ? false
        : true,
    credentials: true,
  })
);

app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'palette-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/artwork', artworkRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/exhibition', exhibitionRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/home', homeRoutes);

if (isProduction) {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));

  app.get(/^\/(?!api\/|uploads\/).*/, (_req: Request, res: Response) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.get('/', (_req: Request, res: Response) => {
    res.send('Palette Art Club Server is running!');
  });
}

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  console.error(err.stack);
  res.json({
    message: err.message || 'Server error',
    stack: isProduction ? null : err.stack,
  });
});

const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
};

startServer().catch((error) => {
  console.error('[server]: Failed to start server:', error);
  process.exit(1);
});
