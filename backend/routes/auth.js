const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['dosen', 'mahasiswa']).withMessage('Role must be dosen or mahasiswa')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, nim, nip, lecturers } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // If mahasiswa, verify lecturers exist and are dosen
    if (role === 'mahasiswa' && lecturers) {
      const lecturerIds = Array.isArray(lecturers) ? lecturers : (lecturers ? [lecturers] : []);

      if (lecturerIds.length > 0) {
        for (const lecturerId of lecturerIds) {
          const lecturerUser = await User.findById(lecturerId);
          if (!lecturerUser) {
            return res.status(404).json({ message: `Lecturer not found: ${lecturerId}` });
          }
          if (lecturerUser.role !== 'dosen') {
            return res.status(400).json({ message: `Selected user is not a lecturer: ${lecturerUser.name}` });
          }
        }
      }
    }

    // Create user
    const userData = { name, email, password, role };
    if (role === 'mahasiswa') {
      if (nim) userData.nim = nim;
      if (lecturers) {
        const lecturerIds = Array.isArray(lecturers) ? lecturers : [lecturers];
        userData.lecturers = lecturerIds;
        userData.lecturer = lecturerIds[0]; // For backward compatibility
      }
    }
    if (role === 'dosen' && nip) userData.nip = nip;

    const user = await User.create(userData);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      message: 'Registration successful. Please wait for admin approval.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is approved (admin is always approved)
    if (user.role !== 'admin' && user.status !== 'approved') {
      if (user.status === 'pending') {
        return res.status(403).json({
          message: 'Your account is pending approval. Please wait for admin approval.'
        });
      }
      if (user.status === 'rejected') {
        return res.status(403).json({
          message: 'Your account has been rejected. Please contact admin.'
        });
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      nim: user.nim,
      nip: user.nip,
      avatar: user.avatar,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
