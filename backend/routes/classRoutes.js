import express from 'express';
import {
  getClasses,
  createClass,
  updateClass,
  deleteClass
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getClasses)
  .post(protect, authorize('admin'), createClass);

router.route('/:id')
  .put(protect, authorize('admin'), updateClass)
  .delete(protect, authorize('admin'), deleteClass);

export default router;
