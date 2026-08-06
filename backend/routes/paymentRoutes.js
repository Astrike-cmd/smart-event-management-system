import express from 'express';
import { confirmUpiPayment, createDemoPayment, submitUpiPayment } from '../controllers/paymentController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/demo', protect, authorize('user'), createDemoPayment);
router.post('/upi', protect, authorize('user'), submitUpiPayment);
router.post('/admin/:id/confirm-upi', protect, authorize('admin'), confirmUpiPayment);
export default router;