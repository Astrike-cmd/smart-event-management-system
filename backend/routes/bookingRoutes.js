import express from 'express';
import {
  cancelAdminBooking,
  cancelBooking,
  createAdminBooking,
  createBooking,
  getAdminBookings,
  getMyBookingById,
  getMyBookings,
  transferAdminBooking
} from '../controllers/bookingController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/admin/list', protect, authorize('admin'), getAdminBookings);
router.post('/admin/create', protect, authorize('admin'), createAdminBooking);
router.post('/admin/:id/cancel', protect, authorize('admin'), cancelAdminBooking);
router.post('/admin/:id/transfer', protect, authorize('admin'), transferAdminBooking);
router.get('/', protect, authorize('user'), getMyBookings);
router.post('/', protect, authorize('user'), createBooking);
router.get('/:id', protect, authorize('user'), getMyBookingById);
router.post('/:id/cancel', protect, authorize('user'), cancelBooking);

export default router;
