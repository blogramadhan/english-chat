const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/admin/users/pending
// @desc    Get all pending users
// @access  Private/Admin
router.get('/users/pending', protect, isAdmin, async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' })
      .select('-password')
      .sort('-createdAt');

    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Private/Admin
router.get('/users', protect, isAdmin, async (req, res) => {
  try {
    const { status, role } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-password')
      .sort('-createdAt');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/users/:id/approve
// @desc    Approve user
// @access  Private/Admin
router.put('/users/:id/approve', protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status === 'approved') {
      return res.status(400).json({ message: 'User already approved' });
    }

    user.status = 'approved';
    user.approvedBy = req.user._id;
    user.approvedAt = Date.now();

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('approvedBy', 'name email');

    res.json({
      message: 'User approved successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/users/:id/reject
// @desc    Reject user
// @access  Private/Admin
router.put('/users/:id/reject', protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status === 'rejected') {
      return res.status(400).json({ message: 'User already rejected' });
    }

    user.status = 'rejected';
    user.approvedBy = req.user._id;
    user.approvedAt = Date.now();

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('approvedBy', 'name email');

    res.json({
      message: 'User rejected',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:id', protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin user' });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/stats', protect, isAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      pendingUsers,
      approvedUsers,
      rejectedUsers,
      totalDosen,
      totalMahasiswa
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.countDocuments({ status: 'pending' }),
      User.countDocuments({ status: 'approved' }),
      User.countDocuments({ status: 'rejected' }),
      User.countDocuments({ role: 'dosen', status: 'approved' }),
      User.countDocuments({ role: 'mahasiswa', status: 'approved' })
    ]);

    res.json({
      totalUsers,
      pendingUsers,
      approvedUsers,
      rejectedUsers,
      totalDosen,
      totalMahasiswa
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
