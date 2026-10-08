import express from 'express';
import {
  getFees,
  getFeeById,
  createFeeInvoice,
  createRazorpayOrder,
  verifyRazorpayPayment,
  manualCollectFee,
  deleteFee,
  getRazorpayConfig
} from '../controllers/feeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Razorpay Public Config
router.get('/config', protect, getRazorpayConfig);

// Razorpay Order Creation & Verification
router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify-payment', protect, verifyRazorpayPayment);

// Base fee CRUD routes
router.route('/')
  .get(protect, getFees)
  .post(protect, authorize('admin'), createFeeInvoice);

router.route('/:id')
  .get(protect, getFeeById)
  .delete(protect, authorize('admin'), deleteFee);

router.post('/:id/manual-collect', protect, authorize('admin'), manualCollectFee);

export default router;
