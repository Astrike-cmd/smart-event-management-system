import express from 'express';
import {
  createFeedback,
  deleteAdminFeedback,
  deleteFeedback,
  getAdminFeedback,
  getEventFeedback,
  getMyFeedbackForEvent,
  updateFeedback
} from '../controllers/feedbackController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/admin/list', protect, authorize('admin'), getAdminFeedback);
router.delete('/admin/:id', protect, authorize('admin'), deleteAdminFeedback);
router.get('/event/:eventId', getEventFeedback);
router.get('/mine/:eventId', protect, authorize('user'), getMyFeedbackForEvent);
router.post('/', protect, authorize('user'), createFeedback);
router.put('/:id', protect, authorize('user'), updateFeedback);
router.delete('/:id', protect, authorize('user'), deleteFeedback);

export default router;
