import { Response } from 'express';
import Favorite from '../models/Favorite.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { getTMDBMovieDetails } from '../services/tmdbService.js';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const addFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { tmdbMovieId } = req.body;

    if (!userId || !tmdbMovieId) {
      res.status(400).json({ message: 'User ID and Movie ID are required.' });
      return;
    }

    const existing = await Favorite.findOne({ userId, tmdbMovieId });
    if (existing) {
      res.status(200).json({ message: 'Movie is already in favorites.' });
      return;
    }

    await Favorite.create({ userId, tmdbMovieId });
    res.status(201).json({ message: 'Added to favorites successfully.' });
  } catch (error: any) {
    console.error('Error adding favorite:', error.message);
    res.status(500).json({ message: 'Failed to add favorite', error: error.message });
  }
};

export const removeFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const rawId = req.params.tmdbMovieId;
    const tmdbMovieId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!userId || !tmdbMovieId) {
      res.status(400).json({ message: 'User ID and Movie ID are required.' });
      return;
    }

    await Favorite.deleteOne({ userId, tmdbMovieId: Number(tmdbMovieId) });
    res.status(200).json({ message: 'Removed from favorites successfully.' });
  } catch (error: any) {
    console.error('Error removing favorite:', error.message);
    res.status(500).json({ message: 'Failed to remove favorite', error: error.message });
  }
};

export const getFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const favorites = await Favorite.find({ userId });
    const favoriteMovieIds = favorites.map((f) => f.tmdbMovieId);

    // Hydrate each favorite with details from TMDB
    const moviePromises = favoriteMovieIds.map(async (id) => {
      try {
        const movie = await getTMDBMovieDetails(id);
        return {
          id: movie.id,
          title: movie.title || movie.name,
          rating: movie.vote_average,
          releaseDate: movie.release_date,
          poster: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null,
          overview: movie.overview,
        };
      } catch (err) {
        return null;
      }
    });

    const results = (await Promise.all(moviePromises)).filter((m) => m !== null);
    res.status(200).json(results);
  } catch (error: any) {
    console.error('Error fetching favorites:', error.message);
    res.status(500).json({ message: 'Failed to fetch favorites', error: error.message });
  }
};
