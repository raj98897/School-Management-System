import { memoryStore } from '../config/db.js';

// Helper to resolve student IDs
const resolveStudentIds = (studentId) => {
  if (!studentId) return [];
  const s = memoryStore.students.find(
    st => st._id === studentId || st.user === studentId || st.email === studentId
  );
  if (s) {
    return [s._id, s.user, studentId];
  }
  return [studentId];
};

// @route   GET /api/attendance
export const getAttendance = async (req, res) => {
  try {
    const { class: classFilter, date, studentId } = req.query;
    let list = [...memoryStore.attendance];

    // Role-based User ID verification to prevent cross-leakage
    let effectiveStudentId = studentId;

    if (req.user && req.user.role === 'student') {
      // Find the logged-in student record
      const studentObj = memoryStore.students.find(
        s => s.user === req.user.id || s.user === req.user._id || (s.email && s.email.toLowerCase() === (req.user.email || '').toLowerCase())
      );
      effectiveStudentId = studentObj ? studentObj._id : (req.user.id || req.user._id);
    }

    if (effectiveStudentId) {
      const matchIds = resolveStudentIds(effectiveStudentId);
      list = list.filter(a => matchIds.includes(a.student) || matchIds.includes(a.studentId));
    } else {
      if (classFilter) {
        list = list.filter(a => a.class && a.class.toLowerCase() === classFilter.toLowerCase());
      }
      if (date) {
        list = list.filter(a => a.date === date);
      }
    }

    // Calculate student statistics if requested for a student or student role
    let stats = null;
    if (effectiveStudentId) {
      const total = list.length;
      const present = list.filter(a => a.status === 'Present').length;
      const absent = list.filter(a => a.status === 'Absent').length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      stats = { total, present, absent, percentage };
    }

    return res.json({
      success: true,
      count: list.length,
      stats,
      data: list
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching attendance'
    });
  }
};

// @route   POST /api/attendance
export const markAttendance = async (req, res) => {
  try {
    const { attendanceRecords } = req.body;

    // Supports single object or array of records
    const records = Array.isArray(attendanceRecords) ? attendanceRecords : [req.body];

    if (!records || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No attendance records provided'
      });
    }

    let savedCount = 0;

    for (const record of records) {
      const { studentId, student, class: className, date, status = 'Present', studentName } = record;
      const rawId = studentId || student;

      if (!rawId || !className || !date) {
        continue;
      }

      const matchIds = resolveStudentIds(rawId);
      const studentObj = memoryStore.students.find(s => matchIds.includes(s._id) || matchIds.includes(s.user));
      const actualStudentId = studentObj ? studentObj._id : rawId;
      const resolvedStudentName = studentName || (studentObj ? studentObj.name : 'Student');

      // Prevent duplicate attendance for same student, class, date
      const existingIndex = memoryStore.attendance.findIndex(
        a => (matchIds.includes(a.student) || matchIds.includes(a.studentId)) &&
             a.class.toLowerCase() === className.toLowerCase() &&
             a.date === date
      );

      if (existingIndex !== -1) {
        // Update existing record
        memoryStore.attendance[existingIndex].status = status;
        memoryStore.attendance[existingIndex].studentName = resolvedStudentName;
        memoryStore.attendance[existingIndex].student = actualStudentId;
        memoryStore.attendance[existingIndex].studentId = actualStudentId;
      } else {
        // Insert new record
        memoryStore.attendance.push({
          _id: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          student: actualStudentId,
          studentId: actualStudentId,
          studentName: resolvedStudentName,
          class: className,
          date,
          status
        });
      }
      savedCount++;
    }

    return res.status(200).json({
      success: true,
      message: `Attendance marked successfully for ${savedCount} student(s)`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error saving attendance'
    });
  }
};

// @route   PUT /api/attendance/:id
export const updateAttendance = async (req, res) => {
  try {
    const record = memoryStore.attendance.find(a => a._id === req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    if (req.body.status) {
      record.status = req.body.status;
    }

    return res.json({
      success: true,
      message: 'Attendance record updated successfully',
      data: record
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating attendance'
    });
  }
};
