const express = require('express');
const router = express.Router();
const { protect, isDosen } = require('../middleware/auth');
const Group = require('../models/Group');

// @route   POST /api/groups
// @desc    Create new group (Dosen only)
// @access  Private/Dosen
router.post('/', protect, isDosen, async (req, res) => {
  try {
    const { name, description, members } = req.body;

    const group = await Group.create({
      name,
      description,
      createdBy: req.user._id,
      members
    });

    await group.populate('createdBy members', '-password');

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/groups
// @desc    Get all groups
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let groups;

    if (req.user.role === 'dosen') {
      // Dosen can see groups they created
      groups = await Group.find({ createdBy: req.user._id })
        .populate('createdBy members', '-password')
        .sort('-createdAt');
    } else {
      // Mahasiswa can see groups they're members of
      groups = await Group.find({ members: req.user._id })
        .populate('createdBy members', '-password')
        .sort('-createdAt');
    }

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/groups/:id
// @desc    Get group by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('createdBy members', '-password');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/groups/:id
// @desc    Update group (Dosen only)
// @access  Private/Dosen
router.put('/:id', protect, isDosen, async (req, res) => {
  try {
    const { name, description, members, isActive } = req.body;

    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is the creator
    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    group.name = name || group.name;
    group.description = description || group.description;
    group.members = members || group.members;
    group.isActive = isActive !== undefined ? isActive : group.isActive;

    const updatedGroup = await group.save();
    await updatedGroup.populate('createdBy members', '-password');

    res.json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/groups/:id
// @desc    Delete group (Dosen only)
// @access  Private/Dosen
router.delete('/:id', protect, isDosen, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is the creator
    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await group.deleteOne();
    res.json({ message: 'Group removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
