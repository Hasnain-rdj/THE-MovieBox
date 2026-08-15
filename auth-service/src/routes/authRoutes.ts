import { Router } from 'express';
import {
  register,
  login,
  updateProfile,
  changePassword,
  getAllUsers,
  adminChangeUserPassword,
} from '../controllers/authController.js';
import { authenticateJWT, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Public auth routes
router.post('/register', register);
router.post('/login', login);

// Authenticated user profile & password routes
router.put('/profile', authenticateJWT, updateProfile);
router.put('/change-password', authenticateJWT, changePassword);

// Admin-only user management routes
router.get('/users', authenticateJWT, requireAdmin, getAllUsers);
router.put('/users/:id/password', authenticateJWT, requireAdmin, adminChangeUserPassword);

export default router;
