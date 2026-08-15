import { Request, Response } from 'express';
import {
  getTrendingMovies,
  searchTMDBMovies,
} from '../services/tmdbService.js';
import { fetchMovieWithMultiSourceFallback } from '../services/movieSyncService.js';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

export const getTrending = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await getTrendingMovies();
    const formattedMovies = data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title || movie.name,
      rating: movie.vote_average,
      voteCount: movie.vote_count,
      releaseDate: movie.release_date || movie.first_air_date,
      mediaType: movie.media_type || (movie.first_air_date ? 'tv' : 'movie'),
      poster: movie.poster_path
        ? movie.poster_path.startsWith('http')
          ? movie.poster_path
          : `${IMAGE_BASE_URL}${movie.poster_path}`
        : null,
      backdrop: movie.backdrop_path
        ? movie.backdrop_path.startsWith('http')
          ? movie.backdrop_path
          : `${BACKDROP_BASE_URL}${movie.backdrop_path}`
        : null,
      overview: movie.overview,
    }));

    res.status(200).json({
      page: data.page,
      results: formattedMovies,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    });
  } catch (error: any) {
    console.error('Error in getTrending controller:', error.message);
    res.status(500).json({ message: 'Failed to fetch trending movies', error: error.message });
  }
};

export const searchMovies = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.query as string | undefined;
    const genreId = req.query.genre as string | undefined;

    const data = await searchTMDBMovies(query, genreId);
    const formattedMovies = data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title || movie.name,
      rating: movie.vote_average,
      voteCount: movie.vote_count,
      releaseDate: movie.release_date || movie.first_air_date,
      mediaType: movie.media_type || (movie.first_air_date ? 'tv' : 'movie'),
      poster: movie.poster_path
        ? movie.poster_path.startsWith('http')
          ? movie.poster_path
          : `${IMAGE_BASE_URL}${movie.poster_path}`
        : null,
      backdrop: movie.backdrop_path
        ? movie.backdrop_path.startsWith('http')
          ? movie.backdrop_path
          : `${BACKDROP_BASE_URL}${movie.backdrop_path}`
        : null,
      overview: movie.overview,
    }));

    res.status(200).json({
      page: data.page,
      results: formattedMovies,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    });
  } catch (error: any) {
    console.error('Error in searchMovies controller:', error.message);
    res.status(500).json({ message: 'Failed to search movies', error: error.message });
  }
};

export const getMovieDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const mediaType = req.query.type as 'movie' | 'tv' | 'series' | undefined;

    if (!id) {
      res.status(400).json({ message: 'Movie ID parameter is required.' });
      return;
    }

    const payload = await fetchMovieWithMultiSourceFallback(id, undefined, mediaType);
    res.status(200).json(payload);
  } catch (error: any) {
    console.error('Error in getMovieDetails controller:', error.message);
    res.status(500).json({ message: 'Failed to fetch movie details', error: error.message });
  }
};
