import { Router } from 'express';
import {
  addFavorite,
  removeFavorite,
  getFavorites,
} from '../controllers/favoriteController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateJWT);

router.post('/', addFavorite);
router.get('/', getFavorites);
router.delete('/:movieId', removeFavorite);

export default router;
