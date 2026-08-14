import { Router } from 'express';
import {
  addFavorite,
  removeFavorite,
  getFavorites,
} from '../controllers/favoriteController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', getFavorites);
router.post('/', addFavorite);
router.delete('/:tmdbMovieId', removeFavorite);

export default router;
