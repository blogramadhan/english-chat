const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users
// @desc    Get all users (for admin/dosen)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/mahasiswa
// @desc    Get all mahasiswa
// @access  Private
router.get('/mahasiswa', protect, async (req, res) => {
  try {
    const mahasiswa = await User.find({ role: 'mahasiswa' }).select('-password');
    res.json(mahasiswa);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
