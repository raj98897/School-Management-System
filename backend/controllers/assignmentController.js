import { memoryStore } from '../config/db.js';

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

// @route   GET /api/assignments
export const getAssignments = async (req, res) => {
  try {
    const { class: classFilter, subject, studentId, teacherOnly } = req.query;
    let list = [...memoryStore.assignments];

    let effectiveStudentId = studentId;

    if (req.user && req.user.role === 'student') {
      // Find the logged-in student record
      const studentObj = memoryStore.students.find(
        s => s.user === req.user.id || s.user === req.user._id || (s.email && s.email.toLowerCase() === (req.user.email || '').toLowerCase())
      );
      effectiveStudentId = studentObj ? studentObj._id : (req.user.id || req.user._id);

      // Restrict assignments strictly to student's class
      const studentClass = studentObj?.class || classFilter;
      if (studentClass) {
        list = list.filter(a => !a.class || a.class.toLowerCase() === studentClass.toLowerCase());
      }
    } else if (req.user && req.user.role === 'teacher') {
      const teacherObj = memoryStore.teachers.find(
        t => t.user === req.user.id || t.user === req.user._id || (t.email && t.email.toLowerCase() === (req.user.email || '').toLowerCase())
      );
      const teacherIds = [req.user.id, req.user._id, teacherObj?._id].filter(Boolean);

      if (teacherOnly === 'true') {
        list = list.filter(a => teacherIds.includes(a.createdBy) || (teacherObj && a.createdByName === teacherObj.name));
      } else {
        if (classFilter) {
          list = list.filter(a => a.class && a.class.toLowerCase() === classFilter.toLowerCase());
        }
        if (subject) {
          list = list.filter(a => a.subject && a.subject.toLowerCase() === subject.toLowerCase());
        }
      }
    } else {
      if (classFilter) {
        list = list.filter(a => a.class && a.class.toLowerCase() === classFilter.toLowerCase());
      }
      if (subject) {
        list = list.filter(a => a.subject && a.subject.toLowerCase() === subject.toLowerCase());
      }
    }

    // Attach submission status strictly for the target/authenticated student
    if (effectiveStudentId) {
      const matchIds = resolveStudentIds(effectiveStudentId);
      list = list.map(a => {
        const submission = memoryStore.submissions.find(
          sub => sub.assignmentId === a._id && (matchIds.includes(sub.studentId) || matchIds.includes(sub.student))
        );
        return {
          ...a,
          submissionStatus: submission ? submission.status : 'Pending',
          submissionDate: submission ? submission.submissionDate : null
        };
      });
    }

    return res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching assignments'
    });
  }
};

// @route   GET /api/assignments/:id
export const getAssignmentById = async (req, res) => {
  try {
    const assignment = memoryStore.assignments.find(a => a._id === req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    return res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching assignment'
    });
  }
};

// @route   POST /api/assignments
export const createAssignment = async (req, res) => {
  try {
    const { title, description, subject, class: className, dueDate } = req.body;

    if (!title || !description || !subject || !className || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'All fields (title, description, subject, class, due date) are required'
      });
    }

    const newAssignment = {
      _id: 'a_' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      subject: subject.trim(),
      class: className.trim(),
      dueDate,
      createdBy: req.user ? req.user.id || req.user._id : 'teacher',
      createdByName: req.user ? req.user.name : 'Teacher',
      createdAt: new Date().toISOString()
    };

    memoryStore.assignments.push(newAssignment);

    return res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: newAssignment
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating assignment'
    });
  }
};

// @route   PUT /api/assignments/:id
export const updateAssignment = async (req, res) => {
  try {
    const assignment = memoryStore.assignments.find(a => a._id === req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    ['title', 'description', 'subject', 'class', 'dueDate'].forEach(field => {
      if (req.body[field] !== undefined) {
        assignment[field] = req.body[field];
      }
    });

    return res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: assignment
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating assignment'
    });
  }
};

// @route   DELETE /api/assignments/:id
export const deleteAssignment = async (req, res) => {
  try {
    const index = memoryStore.assignments.findIndex(a => a._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    memoryStore.assignments.splice(index, 1);
    // Remove submissions
    memoryStore.submissions = memoryStore.submissions.filter(s => s.assignmentId !== req.params.id);

    return res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting assignment'
    });
  }
};

// @route   POST /api/assignments/:id/submit
export const submitAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    // Strictly identify student from req.user
    let studentObj = null;
    if (req.user) {
      studentObj = memoryStore.students.find(
        s => s.user === req.user.id || s.user === req.user._id || (s.email && s.email.toLowerCase() === (req.user.email || '').toLowerCase())
      );
    }
    const studentId = studentObj ? studentObj._id : (req.user ? req.user.id || req.user._id : 'student');
    const matchIds = resolveStudentIds(studentId);

    const existingIndex = memoryStore.submissions.findIndex(
      s => s.assignmentId === assignmentId && (matchIds.includes(s.studentId) || matchIds.includes(s.student))
    );

    const submissionDate = new Date().toISOString().split('T')[0];

    if (existingIndex !== -1) {
      memoryStore.submissions[existingIndex].status = 'Completed';
      memoryStore.submissions[existingIndex].submissionDate = submissionDate;
      memoryStore.submissions[existingIndex].studentId = studentId;
      memoryStore.submissions[existingIndex].student = studentId;
    } else {
      memoryStore.submissions.push({
        _id: 'sub_' + Date.now(),
        assignmentId,
        studentId,
        student: studentId,
        submissionDate,
        status: 'Completed'
      });
    }

    return res.json({
      success: true,
      message: 'Assignment submitted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error submitting assignment'
    });
  }
};
