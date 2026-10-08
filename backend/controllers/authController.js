import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { memoryStore } from '../config/db.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';

const generateToken = (userId, role, email) => {
  const secret = process.env.JWT_SECRET || 'school_system_secret_key_2026';
  return jwt.sign({ userId, role, email }, secret, { expiresIn: '7d' });
};

// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'teacher', phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Only Teacher and Admin can create student accounts through the portal
    if (role.toLowerCase() === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Student accounts can only be created by Teachers and School Administrators via the portal. Please contact your faculty or school administration.'
      });
    }

    // Check existing
    const existingMemory = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingMemory) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newId = 'u_' + Date.now();

    const newUser = {
      _id: newId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role.toLowerCase(),
      phone: phone || '',
      createdAt: new Date().toISOString()
    };

    memoryStore.users.push(newUser);

    // If student, create student profile
    if (role === 'student') {
      const studentProfile = {
        _id: 's_' + Date.now(),
        user: newId,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        rollNumber: req.body.rollNumber || `10${memoryStore.students.length + 1}`,
        class: req.body.class || 'Class 10',
        section: req.body.section || 'A',
        gender: req.body.gender || 'Male',
        address: req.body.address || '',
        parentName: req.body.parentName || '',
        parentPhone: req.body.parentPhone || ''
      };
      memoryStore.students.push(studentProfile);
    } else if (role === 'teacher') {
      const teacherProfile = {
        _id: 't_' + Date.now(),
        user: newId,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        subject: req.body.subject || 'General Education',
        qualification: req.body.qualification || 'B.Ed',
        address: req.body.address || ''
      };
      memoryStore.teachers.push(teacherProfile);
    }

    const token = generateToken(newUser._id, newUser.role, newUser.email);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id, user.role, user.email);

    // Get linked role data if student or teacher
    let extraData = {};
    if (user.role === 'student') {
      const student = memoryStore.students.find(s => s.user === user._id || s.email === user.email);
      if (student) {
        extraData = {
          studentId: student._id,
          rollNumber: student.rollNumber,
          class: student.class,
          section: student.section
        };
      }
    } else if (user.role === 'teacher') {
      const teacher = memoryStore.teachers.find(t => t.user === user._id || t.email === user.email);
      if (teacher) {
        extraData = {
          teacherId: teacher._id,
          subject: teacher.subject,
          qualification: teacher.qualification
        };
      }
    }

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        ...extraData
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};

// @route   GET /api/auth/profile
export const getProfile = async (req, res) => {
  try {
    const user = memoryStore.users.find(u => u._id === req.user.id || u._id === req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    let profileDetails = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    };

    if (user.role === 'student') {
      const student = memoryStore.students.find(s => s.user === user._id || s.email === user.email);
      if (student) {
        profileDetails = { ...profileDetails, ...student, id: user._id, studentId: student._id };
      }
    } else if (user.role === 'teacher') {
      const teacher = memoryStore.teachers.find(t => t.user === user._id || t.email === user.email);
      if (teacher) {
        profileDetails = { ...profileDetails, ...teacher, id: user._id, teacherId: teacher._id };
      }
    }

    return res.json({
      success: true,
      data: profileDetails
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving profile'
    });
  }
};

// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = memoryStore.users.find(u => u._id === userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, phone, address, qualification, subject } = req.body;
    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();

    if (user.role === 'teacher') {
      const teacher = memoryStore.teachers.find(t => t.user === userId || t.email === user.email);
      if (teacher) {
        if (name) teacher.name = name.trim();
        if (phone !== undefined) teacher.phone = phone.trim();
        if (address !== undefined) teacher.address = address.trim();
        if (qualification !== undefined) teacher.qualification = qualification.trim();
        if (subject !== undefined) teacher.subject = subject.trim();
      }
    } else if (user.role === 'student') {
      const student = memoryStore.students.find(s => s.user === userId || s.email === user.email);
      if (student) {
        if (name) student.name = name.trim();
        if (phone !== undefined) student.phone = phone.trim();
        if (address !== undefined) student.address = address.trim();
      }
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating profile'
    });
  }
};
