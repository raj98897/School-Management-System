import { memoryStore } from '../config/db.js';

// @route   GET /api/admin/stats
export const getDashboardStats = async (req, res) => {
  try {
    const stats = {
      totalStudents: memoryStore.students.length,
      totalTeachers: memoryStore.teachers.length,
      totalClasses: memoryStore.classes.length,
      totalNotices: memoryStore.notices.length,
      totalAssignments: memoryStore.assignments.length,
      recentNotices: memoryStore.notices.slice(-3).reverse(),
      recentStudents: memoryStore.students.slice(-4).reverse()
    };

    return res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching dashboard statistics'
    });
  }
};

// @route   GET /api/classes
export const getClasses = async (req, res) => {
  try {
    return res.json({
      success: true,
      count: memoryStore.classes.length,
      data: memoryStore.classes
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching classes'
    });
  }
};

// @route   POST /api/classes
export const createClass = async (req, res) => {
  try {
    const { name, section = 'A', classTeacher = '' } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Class name is required'
      });
    }

    const newClass = {
      _id: 'c_' + Date.now(),
      name: name.trim(),
      section: section.trim(),
      classTeacher: classTeacher.trim()
    };

    memoryStore.classes.push(newClass);

    return res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: newClass
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating class'
    });
  }
};

// @route   PUT /api/classes/:id
export const updateClass = async (req, res) => {
  try {
    const classItem = memoryStore.classes.find(c => c._id === req.params.id);
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    if (req.body.name) classItem.name = req.body.name.trim();
    if (req.body.section) classItem.section = req.body.section.trim();
    if (req.body.classTeacher !== undefined) classItem.classTeacher = req.body.classTeacher.trim();

    return res.json({
      success: true,
      message: 'Class updated successfully',
      data: classItem
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating class'
    });
  }
};

// @route   DELETE /api/classes/:id
export const deleteClass = async (req, res) => {
  try {
    const index = memoryStore.classes.findIndex(c => c._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    memoryStore.classes.splice(index, 1);

    return res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting class'
    });
  }
};
