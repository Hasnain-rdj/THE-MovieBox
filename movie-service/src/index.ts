import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import movieRoutes from './routes/movieRoutes.js';
import personRoutes from './routes/personRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI || '';

if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas (Movie Service)'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));
} else {
  console.warn('⚠️ MONGO_URI is not set in environment variables.');
}

// Routes
app.use('/api/movies', movieRoutes);
app.use('/api/person', personRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/favorites', favoriteRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'Movie Service is healthy and running!', service: 'movie-service', port: PORT });
});

app.listen(PORT, () => {
  console.log(`🚀 Movie Service running on http://localhost:${PORT}`);
});
