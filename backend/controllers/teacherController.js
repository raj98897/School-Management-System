import bcrypt from 'bcryptjs';
import { memoryStore } from '../config/db.js';

// @route   GET /api/teachers
export const getTeachers = async (req, res) => {
  try {
    const { search, subject } = req.query;
    let list = [...memoryStore.teachers];

    if (subject) {
      list = list.filter(t => t.subject && t.subject.toLowerCase().includes(subject.toLowerCase()));
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        t =>
          (t.name && t.name.toLowerCase().includes(q)) ||
          (t.email && t.email.toLowerCase().includes(q)) ||
          (t.subject && t.subject.toLowerCase().includes(q))
      );
    }

    return res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching teachers'
    });
  }
};

// @route   GET /api/teachers/:id
export const getTeacherById = async (req, res) => {
  try {
    const teacher = memoryStore.teachers.find(t => t._id === req.params.id || t.user === req.params.id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    return res.json({
      success: true,
      data: teacher
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching teacher'
    });
  }
};

// @route   POST /api/teachers
export const createTeacher = async (req, res) => {
  try {
    const {
      name,
      email,
      password = 'teacher123',
      phone,
      subject,
      qualification,
      address
    } = req.body;

    if (!name || !email || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and subject are required'
      });
    }

    // Check existing email
    if (memoryStore.users.some(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'u_' + Date.now();
    const teacherId = 't_' + Date.now();

    const newUser = {
      _id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'teacher',
      phone: phone || '',
      createdAt: new Date().toISOString()
    };
    memoryStore.users.push(newUser);

    const newTeacher = {
      _id: teacherId,
      user: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || '',
      subject: subject.trim(),
      qualification: qualification || 'B.Ed',
      address: address || ''
    };
    memoryStore.teachers.push(newTeacher);

    return res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: newTeacher
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating teacher'
    });
  }
};

// @route   PUT /api/teachers/:id
export const updateTeacher = async (req, res) => {
  try {
    const teacher = memoryStore.teachers.find(t => t._id === req.params.id || t.user === req.params.id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    const fields = ['name', 'phone', 'subject', 'qualification', 'address'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        teacher[field] = req.body[field];
      }
    });

    const user = memoryStore.users.find(u => u._id === teacher.user);
    if (user) {
      if (req.body.name) user.name = req.body.name;
      if (req.body.phone) user.phone = req.body.phone;
    }

    return res.json({
      success: true,
      message: 'Teacher updated successfully',
      data: teacher
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating teacher'
    });
  }
};

// @route   DELETE /api/teachers/:id
export const deleteTeacher = async (req, res) => {
  try {
    const index = memoryStore.teachers.findIndex(t => t._id === req.params.id || t.user === req.params.id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    const teacher = memoryStore.teachers[index];
    memoryStore.users = memoryStore.users.filter(u => u._id !== teacher.user && u.email !== teacher.email);
    memoryStore.teachers.splice(index, 1);

    return res.json({
      success: true,
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting teacher'
    });
  }
};
