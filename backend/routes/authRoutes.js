import express from 'express';
import {
  getCurrentUser,
  loginAdmin,
  loginUser,
  registerUser
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin/login', loginAdmin);
router.get('/me', protect, getCurrentUser);

export default router;
