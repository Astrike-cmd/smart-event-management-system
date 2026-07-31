import express from 'express';
import {
  cancelBooking,
  createBooking,
  getAdminBookings,
  getMyBookingById,
  getMyBookings
} from '../controllers/bookingController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/admin/list', protect, authorize('admin'), getAdminBookings);
router.get('/', protect, authorize('user'), getMyBookings);
router.post('/', protect, authorize('user'), createBooking);
router.get('/:id', protect, authorize('user'), getMyBookingById);
router.post('/:id/cancel', protect, authorize('user'), cancelBooking);

export default router;
