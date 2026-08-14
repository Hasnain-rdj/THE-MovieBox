import { Router } from 'express';
import { getPersonDetails } from '../controllers/personController.js';

const router = Router();

router.get('/:id', getPersonDetails);

export default router;
