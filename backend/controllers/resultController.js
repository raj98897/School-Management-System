import { memoryStore } from '../config/db.js';

const calculateGrade = (marks, totalMarks) => {
  const percentage = (marks / totalMarks) * 100;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
};

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

// @route   GET /api/results
export const getResults = async (req, res) => {
  try {
    const { studentId, student, class: classFilter, subject } = req.query;
    let list = [...memoryStore.results];

    let targetStudent = studentId || student;

    // Strict role check: If user is student, force targetStudent to be ONLY the authenticated student
    if (req.user && req.user.role === 'student') {
      const studentObj = memoryStore.students.find(
        s => s.user === req.user.id || s.user === req.user._id || (s.email && s.email.toLowerCase() === (req.user.email || '').toLowerCase())
      );
      targetStudent = studentObj ? studentObj._id : (req.user.id || req.user._id);
    }

    if (targetStudent) {
      const matchIds = resolveStudentIds(targetStudent);
      list = list.filter(r => matchIds.includes(r.student) || matchIds.includes(r.studentId));
    } else {
      if (classFilter) {
        list = list.filter(r => r.class && r.class.toLowerCase() === classFilter.toLowerCase());
      }
      if (subject) {
        list = list.filter(r => r.subject && r.subject.toLowerCase() === subject.toLowerCase());
      }
    }

    // Compute summary stats for student results
    let summary = null;
    if (list.length > 0) {
      const totalMarksSum = list.reduce((acc, curr) => acc + Number(curr.totalMarks || 100), 0);
      const obtainedMarksSum = list.reduce((acc, curr) => acc + Number(curr.marks || 0), 0);
      const percentage = totalMarksSum > 0 ? ((obtainedMarksSum / totalMarksSum) * 100).toFixed(1) : 0;
      summary = {
        totalSubjects: list.length,
        totalMarks: totalMarksSum,
        obtainedMarks: obtainedMarksSum,
        percentage: Number(percentage)
      };
    }

    return res.json({
      success: true,
      count: list.length,
      summary,
      data: list
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching results'
    });
  }
};

// @route   POST /api/results
export const createResult = async (req, res) => {
  try {
    const { studentId, student, subject, exam, marks, totalMarks = 100, grade } = req.body;
    const rawId = studentId || student;

    if (!rawId || !subject || !exam || marks === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Student, subject, exam name, and marks are required'
      });
    }

    const marksNum = Number(marks);
    const totalMarksNum = Number(totalMarks);

    if (marksNum > totalMarksNum) {
      return res.status(400).json({
        success: false,
        message: 'Marks obtained cannot be greater than total marks'
      });
    }

    const studentObj = memoryStore.students.find(
      s => s._id === rawId || s.user === rawId || s.email === rawId
    );
    const actualStudentId = studentObj ? studentObj._id : rawId;
    const resolvedGrade = grade || calculateGrade(marksNum, totalMarksNum);

    const newResult = {
      _id: 'r_' + Date.now(),
      student: actualStudentId,
      studentId: actualStudentId,
      studentName: studentObj ? studentObj.name : 'Student',
      rollNumber: studentObj ? studentObj.rollNumber : '101',
      class: studentObj ? studentObj.class : 'Class 10',
      subject: subject.trim(),
      exam: exam.trim(),
      marks: marksNum,
      totalMarks: totalMarksNum,
      grade: resolvedGrade
    };

    memoryStore.results.push(newResult);

    return res.status(201).json({
      success: true,
      message: 'Result added successfully',
      data: newResult
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating result'
    });
  }
};

// @route   PUT /api/results/:id
export const updateResult = async (req, res) => {
  try {
    const result = memoryStore.results.find(r => r._id === req.params.id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result record not found'
      });
    }

    if (req.body.subject) result.subject = req.body.subject.trim();
    if (req.body.exam) result.exam = req.body.exam.trim();
    if (req.body.marks !== undefined) result.marks = Number(req.body.marks);
    if (req.body.totalMarks !== undefined) result.totalMarks = Number(req.body.totalMarks);

    if (result.marks > result.totalMarks) {
      return res.status(400).json({
        success: false,
        message: 'Marks obtained cannot be greater than total marks'
      });
    }

    result.grade = req.body.grade || calculateGrade(result.marks, result.totalMarks);

    return res.json({
      success: true,
      message: 'Result updated successfully',
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating result'
    });
  }
};

// @route   DELETE /api/results/:id
export const deleteResult = async (req, res) => {
  try {
    const index = memoryStore.results.findIndex(r => r._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    memoryStore.results.splice(index, 1);

    return res.json({
      success: true,
      message: 'Result deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting result'
    });
  }
};
