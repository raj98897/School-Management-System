import express from 'express';
import {
  getDashboardStats,
  getClasses,
  createClass,
  updateClass,
  deleteClass
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/stats', protect, authorize('admin'), getDashboardStats);

router.route('/classes')
  .get(protect, getClasses)
  .post(protect, authorize('admin'), createClass);

router.route('/classes/:id')
  .put(protect, authorize('admin'), updateClass)
  .delete(protect, authorize('admin'), deleteClass);

export default router;
