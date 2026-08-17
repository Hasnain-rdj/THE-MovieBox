import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import client from 'prom-client';

import movieRoutes from './routes/movieRoutes.js';
import personRoutes from './routes/personRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';

dotenv.config();

// Collect Prometheus default metrics
client.collectDefaultMetrics();

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

// Prometheus Metrics Endpoint
app.get('/metrics', async (_req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.send(await client.register.metrics());
  } catch (err: any) {
    res.status(500).end(err.message);
  }
});

// Routes
app.use('/api/movies', movieRoutes);
app.use('/api/person', personRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/favorites', favoriteRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'Movie Service is healthy and running!', service: 'movie-service', port: PORT });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Movie Service running on http://localhost:${PORT}`);
  });
}

export default app;
