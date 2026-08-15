import { Router } from 'express';
import {
  getTrending,
  searchMovies,
  getMovieDetails,
} from '../controllers/movieController.js';

const router = Router();

router.get('/trending', getTrending);
router.get('/search', searchMovies);
router.get('/:id', getMovieDetails);

export default router;
