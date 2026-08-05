import express from 'express';
import { createPaymentOrder, verifyPayment } from '../controllers/paymentController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/orders', protect, authorize('user'), createPaymentOrder);
router.post('/verify', protect, authorize('user'), verifyPayment);
export default router;