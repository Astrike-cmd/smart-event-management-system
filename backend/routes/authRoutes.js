import express from 'express';
import {
  getAdminUsers,
  getCurrentUser,
  loginAdmin,
  loginUser,
  registerUser
} from '../controllers/authController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin/login', loginAdmin);
router.get('/me', protect, getCurrentUser);
router.get('/admin/users', protect, authorize('admin'), getAdminUsers);

export default router;
