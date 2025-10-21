const express = require('express');
const router = express.Router();
const { protect, isDosen } = require('../middleware/auth');
const Discussion = require('../models/Discussion');
const Group = require('../models/Group');

// @route   POST /api/discussions
// @desc    Create new discussion (Dosen only)
// @access  Private/Dosen
router.post('/', protect, isDosen, async (req, res) => {
  try {
    const { title, content, group, tags } = req.body;

    // Verify group exists and user is the creator
    const groupDoc = await Group.findById(group);
    if (!groupDoc) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (groupDoc.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to create discussion for this group' });
    }

    const discussion = await Discussion.create({
      title,
      content,
      createdBy: req.user._id,
      group,
      tags
    });

    await discussion.populate('createdBy group', '-password');

    res.status(201).json(discussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/discussions
// @desc    Get all discussions for user's groups
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let discussions;

    if (req.user.role === 'dosen') {
      // Get discussions created by dosen
      discussions = await Discussion.find({ createdBy: req.user._id })
        .populate('createdBy group', '-password')
        .sort('-createdAt');
    } else {
      // Get groups where mahasiswa is a member
      const groups = await Group.find({ members: req.user._id });
      const groupIds = groups.map(g => g._id);

      // Get discussions for those groups
      discussions = await Discussion.find({ group: { $in: groupIds } })
        .populate('createdBy group', '-password')
        .sort('-createdAt');
    }

    res.json(discussions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/discussions/:id
// @desc    Get discussion by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('createdBy group', '-password');

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    res.json(discussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/discussions/:id
// @desc    Update discussion (Dosen only)
// @access  Private/Dosen
router.put('/:id', protect, isDosen, async (req, res) => {
  try {
    const { title, content, tags, isActive } = req.body;

    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is the creator
    if (discussion.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    discussion.title = title || discussion.title;
    discussion.content = content || discussion.content;
    discussion.tags = tags || discussion.tags;
    discussion.isActive = isActive !== undefined ? isActive : discussion.isActive;

    const updatedDiscussion = await discussion.save();
    await updatedDiscussion.populate('createdBy group', '-password');

    res.json(updatedDiscussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/discussions/:id
// @desc    Delete discussion (Dosen only)
// @access  Private/Dosen
router.delete('/:id', protect, isDosen, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is the creator
    if (discussion.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await discussion.deleteOne();
    res.json({ message: 'Discussion removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
