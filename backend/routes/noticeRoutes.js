import express from 'express';
import {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice
} from '../controllers/noticeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getNotices)
  .post(protect, authorize('admin'), createNotice);

router.route('/:id')
  .get(protect, getNoticeById)
  .put(protect, authorize('admin'), updateNotice)
  .delete(protect, authorize('admin'), deleteNotice);

export default router;
