import bcrypt from 'bcryptjs';
import { memoryStore } from '../config/db.js';

// @route   GET /api/students
export const getStudents = async (req, res) => {
  try {
    const { search, class: classFilter } = req.query;
    let list = [...memoryStore.students];

    // If student role, restrict to their own student profile
    if (req.user && req.user.role === 'student') {
      const studentObj = memoryStore.students.find(
        s => s.user === req.user.id || s.user === req.user._id || (s.email && s.email.toLowerCase() === (req.user.email || '').toLowerCase())
      );
      list = studentObj ? [studentObj] : [];
      return res.json({
        success: true,
        count: list.length,
        data: list
      });
    }

    // Filter by class if provided
    if (classFilter) {
      list = list.filter(s => s.class && s.class.toLowerCase() === classFilter.toLowerCase());
    }

    // Search by name, email, or rollNumber
    if (search) {
      const query = search.toLowerCase();
      list = list.filter(
        s =>
          (s.name && s.name.toLowerCase().includes(query)) ||
          (s.email && s.email.toLowerCase().includes(query)) ||
          (s.rollNumber && s.rollNumber.toLowerCase().includes(query))
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
      message: error.message || 'Error fetching students'
    });
  }
};

// @route   GET /api/students/:id
export const getStudentById = async (req, res) => {
  try {
    const student = memoryStore.students.find(s => s._id === req.params.id || s.user === req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Role check for students: cannot view other students' personal records
    if (req.user && req.user.role === 'student') {
      const isOwnProfile = student.user === req.user.id || student.user === req.user._id || student._id === req.user.id || student._id === req.user._id || (student.email && student.email.toLowerCase() === (req.user.email || '').toLowerCase());
      if (!isOwnProfile) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view other student records'
        });
      }
    }

    return res.json({
      success: true,
      data: student
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching student'
    });
  }
};

// @route   POST /api/students
export const createStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      password = 'student123',
      phone,
      rollNumber,
      class: className,
      section = 'A',
      dateOfBirth,
      gender = 'Male',
      address,
      parentName,
      parentPhone
    } = req.body;

    if (!name || !email || !rollNumber || !className) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, roll number, and class are required'
      });
    }

    // Check duplicate email
    if (memoryStore.users.some(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'u_' + Date.now();
    const studentId = 's_' + Date.now();

    const newUser = {
      _id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'student',
      phone: phone || '',
      createdAt: new Date().toISOString()
    };
    memoryStore.users.push(newUser);

    const newStudent = {
      _id: studentId,
      user: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || '',
      rollNumber: rollNumber.trim(),
      class: className.trim(),
      section: section.trim(),
      dateOfBirth: dateOfBirth || '',
      gender,
      address: address || '',
      parentName: parentName || '',
      parentPhone: parentPhone || ''
    };
    memoryStore.students.push(newStudent);

    return res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: newStudent
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating student'
    });
  }
};

// @route   PUT /api/students/:id
export const updateStudent = async (req, res) => {
  try {
    const student = memoryStore.students.find(s => s._id === req.params.id || s.user === req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const fields = ['name', 'phone', 'rollNumber', 'class', 'section', 'dateOfBirth', 'gender', 'address', 'parentName', 'parentPhone'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        student[field] = req.body[field];
      }
    });

    // Update user name if changed
    const user = memoryStore.users.find(u => u._id === student.user);
    if (user) {
      if (req.body.name) user.name = req.body.name;
      if (req.body.phone) user.phone = req.body.phone;
    }

    return res.json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating student'
    });
  }
};

// @route   DELETE /api/students/:id
export const deleteStudent = async (req, res) => {
  try {
    const index = memoryStore.students.findIndex(s => s._id === req.params.id || s.user === req.params.id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const student = memoryStore.students[index];
    // Remove user account as well
    memoryStore.users = memoryStore.users.filter(u => u._id !== student.user && u.email !== student.email);
    memoryStore.students.splice(index, 1);

    return res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting student'
    });
  }
};
