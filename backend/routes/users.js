const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

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
// @desc    Get all mahasiswa (filtered by lecturer for dosen)
// @access  Private
router.get('/mahasiswa', protect, async (req, res) => {
  try {
    let query = { role: 'mahasiswa', status: 'approved' };

    // If user is dosen, only return mahasiswa who selected this lecturer
    if (req.user.role === 'dosen') {
      query.$or = [
        { lecturers: req.user._id },
        { lecturer: req.user._id } // Backward compatibility
      ];
    }

    const mahasiswa = await User.find(query).select('-password');
    res.json(mahasiswa);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/lecturers
// @desc    Get all approved lecturers (for registration)
// @access  Public
router.get('/lecturers', async (req, res) => {
  try {
    const lecturers = await User.find({
      role: 'dosen',
      status: 'approved'
    }).select('_id name nip');
    res.json(lecturers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields that are allowed to be changed
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) {
      // Check if email is already taken by another user
      const emailExists = await User.findOne({
        email: req.body.email,
        _id: { $ne: req.user._id }
      });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = req.body.email;
    }

    // Update NIM/NIP based on role
    if (user.role === 'mahasiswa') {
      if (req.body.nim) user.nim = req.body.nim;

      // Update lecturers if provided
      if (req.body.lecturers !== undefined) {
        const lecturerIds = Array.isArray(req.body.lecturers) ? req.body.lecturers : (req.body.lecturers ? [req.body.lecturers] : []);

        // Verify all lecturers exist and are dosen
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

        user.lecturers = lecturerIds;
        user.lecturer = lecturerIds.length > 0 ? lecturerIds[0] : null; // Backward compatibility
      }
    }

    if (user.role === 'dosen' && req.body.nip) {
      user.nip = req.body.nip;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      nim: updatedUser.nim,
      nip: updatedUser.nip,
      avatar: updatedUser.avatar,
      status: updatedUser.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/password
// @desc    Update user password
// @access  Private
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Set new password (will be hashed by pre-save hook)
    user.password = newPassword;

    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/users/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Save new avatar path
    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      message: 'Avatar uploaded successfully',
      avatar: user.avatar
    });
  } catch (error) {
    // Delete uploaded file if error occurs
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
