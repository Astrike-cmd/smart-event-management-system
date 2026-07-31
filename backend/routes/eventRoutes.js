import express from 'express';
import {
  createEvent,
  getAdminEvents,
  getEventBySlug,
  getPublishedEvents,
  updateEvent
} from '../controllers/eventController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getPublishedEvents);
router.get('/admin/list', protect, authorize('admin'), getAdminEvents);
router.post('/', protect, authorize('admin'), createEvent);
router.put('/:id', protect, authorize('admin'), updateEvent);
router.get('/:slug', getEventBySlug);

export default router;
