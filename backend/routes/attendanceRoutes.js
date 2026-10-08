import express from 'express';
import {
  getAttendance,
  markAttendance,
  updateAttendance
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getAttendance)
  .post(protect, authorize('teacher', 'admin'), markAttendance);

router.route('/:id')
  .put(protect, authorize('teacher', 'admin'), updateAttendance);

export default router;
