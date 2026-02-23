import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import artworkRoutes from './routes/artworkRoutes';
import eventRoutes from './routes/eventRoutes';
import exhibitionRoutes from './routes/exhibitionRoutes'; // New import
import contactRoutes from './routes/contactRoutes';
import cors from 'cors';
import path from 'path';
import { promises as fs } from 'fs'; // Import fs.promises

dotenv.config();

connectDB();

const app: Express = express();
const port = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
fs.mkdir(uploadsDir, { recursive: true })
  .then(() => console.log('Uploads directory ensured:', uploadsDir))
  .catch(err => console.error('Failed to ensure uploads directory:', err));

// Middleware to parse JSON bodies and enable CORS
app.use(express.json());
app.use(cors());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(uploadsDir)); // Use the defined uploadsDir

// Mount auth routes
app.use('/api/auth', authRoutes);
// Mount user routes
app.use('/api/users', userRoutes);
// Mount artwork routes
app.use('/api/artwork', artworkRoutes);
// Mount event routes
app.use('/api/events', eventRoutes);
// Mount exhibition routes
app.use('/api/exhibition', exhibitionRoutes); // New mount
app.use('/api/contact', contactRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Palette Art Club Server is running!');
});

// Generic error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  // Log the full error stack to the server console for debugging
  console.error(err.stack);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});