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

    const filmography = data.movie_credits?.cast
      ? data.movie_credits.cast.map((item: any) => ({
          id: item.id,
          title: item.title || item.name,
          character: item.character,
          rating: item.vote_average,
          releaseDate: item.release_date || item.first_air_date,
          poster: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : null,
        }))
      : [];

    res.status(200).json({
      id: data.id,
      name: data.name,
      biography: data.biography,
      birthday: data.birthday,
      placeOfBirth: data.place_of_birth,
      knownForDepartment: data.known_for_department,
      profilePath: data.profile_path ? `${IMAGE_BASE_URL}${data.profile_path}` : null,
      filmography,
    });
  } catch (error: any) {
    console.error('Error in getPersonDetails controller:', error.message);
    res.status(500).json({ message: 'Failed to fetch person details', error: error.message });
  }
};
