import express from 'express';
import {
  getResults,
  createResult,
  updateResult,
  deleteResult
} from '../controllers/resultController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getResults)
  .post(protect, authorize('teacher', 'admin'), createResult);

router.route('/:id')
  .put(protect, authorize('teacher', 'admin'), updateResult)
  .delete(protect, authorize('teacher', 'admin'), deleteResult);

export default router;
