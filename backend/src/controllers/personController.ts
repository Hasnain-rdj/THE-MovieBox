import { Request, Response } from 'express';
import { getTMDBPersonDetails } from '../services/tmdbService.js';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const getPersonDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const personId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!personId) {
      res.status(400).json({ message: 'Person ID parameter is required.' });
      return;
    }

    const data = await getTMDBPersonDetails(personId);

    const castCredits = data.movie_credits?.cast || [];
    const formattedFilmography = castCredits
      .filter((movie: any) => movie.poster_path || movie.backdrop_path)
      .map((movie: any) => ({
        id: movie.id,
        title: movie.title || movie.name,
        character: movie.character,
        rating: movie.vote_average,
        releaseDate: movie.release_date,
        poster: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null,
        backdrop: movie.backdrop_path ? `${IMAGE_BASE_URL}${movie.backdrop_path}` : null,
      }))
      .sort((a: any, b: any) => {
        const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
        const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
        return dateB - dateA;
      });

    const payload = {
      id: data.id,
      name: data.name,
      biography: data.biography || 'No biography available.',
      birthday: data.birthday,
      placeOfBirth: data.place_of_birth,
      knownForDepartment: data.known_for_department,
      profilePath: data.profile_path ? `${IMAGE_BASE_URL}${data.profile_path}` : null,
      filmography: formattedFilmography,
    };

    res.status(200).json(payload);
  } catch (error: any) {
    console.error('Error fetching person details:', error.message);
    res.status(500).json({ message: 'Failed to fetch person details', error: error.message });
  }
};
