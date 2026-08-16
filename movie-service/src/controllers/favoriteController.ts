import { Response } from 'express';
import Favorite from '../models/Favorite.js';
import { getTMDBMovieDetails } from '../services/tmdbService.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const addFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tmdbMovieId } = req.body;
    const userId = req.user?.id;

    if (!tmdbMovieId || !userId) {
      res.status(400).json({ message: 'User ID and TMDB Movie ID are required.' });
      return;
    }

    const existingFav = await Favorite.findOne({ userId, tmdbMovieId });
    if (existingFav) {
      res.status(400).json({ message: 'Movie already added to favorites.' });
      return;
    }

    const favorite = await Favorite.create({
      userId,
      tmdbMovieId,
    });

    res.status(201).json({ message: 'Movie added to favorites successfully', favorite });
  } catch (error: any) {
    console.error('Error adding favorite:', error.message);
    res.status(500).json({ message: 'Failed to add favorite', error: error.message });
  }
};

export const removeFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rawId = req.params.movieId;
    const tmdbMovieId = Array.isArray(rawId) ? rawId[0] : rawId;
    const userId = req.user?.id;

    if (!tmdbMovieId || !userId) {
      res.status(400).json({ message: 'User ID and TMDB Movie ID are required.' });
      return;
    }

    const deleted = await Favorite.findOneAndDelete({
      userId,
      tmdbMovieId: Number(tmdbMovieId),
    });

    if (!deleted) {
      res.status(404).json({ message: 'Favorite entry not found.' });
      return;
    }

    res.status(200).json({ message: 'Movie removed from favorites successfully' });
  } catch (error: any) {
    console.error('Error removing favorite:', error.message);
    res.status(500).json({ message: 'Failed to remove favorite', error: error.message });
  }
};

export const getFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized.' });
      return;
    }

    const favRecords = await Favorite.find({ userId }).sort({ createdAt: -1 });

    const moviePromises = favRecords.map(async (fav) => {
      try {
        const details = await getTMDBMovieDetails(fav.tmdbMovieId);
        return {
          id: details.id,
          title: details.title || details.name,
          poster: details.poster_path
            ? details.poster_path.startsWith('http')
              ? details.poster_path
              : `${IMAGE_BASE_URL}${details.poster_path}`
            : null,
          rating: details.vote_average,
          releaseDate: details.release_date || details.first_air_date,
          overview: details.overview,
          mediaType: details.first_air_date ? 'series' : 'movie',
        };
      } catch (err) {
        return null;
      }
    });

    const movies = (await Promise.all(moviePromises)).filter((m) => m !== null);

    res.status(200).json(movies);
  } catch (error: any) {
    console.error('Error fetching favorites:', error.message);
    res.status(500).json({ message: 'Failed to fetch favorites', error: error.message });
  }
};
