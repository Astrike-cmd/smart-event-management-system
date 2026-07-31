import express from 'express';
import {
  createEvent,
  deleteEvent,
  getAdminEvents,
  getEventBySlug,
  getManagedEvents,
  getPublishedEvents,
  updateEvent
} from '../controllers/eventController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getPublishedEvents);
router.get('/admin/list', protect, authorize('admin'), getAdminEvents);
router.get('/manage/list', protect, authorize('user', 'admin'), getManagedEvents);
router.post('/', protect, authorize('user'), createEvent);
router.put('/:id', protect, authorize('user', 'admin'), updateEvent);
router.delete('/:id', protect, authorize('user', 'admin'), deleteEvent);
router.get('/:slug', getEventBySlug);

export default router;
