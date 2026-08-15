import { Router } from 'express';
import {
  getCollectionsList,
  getCollectionById,
} from '../controllers/collectionController.js';

const router = Router();

router.get('/', getCollectionsList);
router.get('/:id', getCollectionById);

export default router;
