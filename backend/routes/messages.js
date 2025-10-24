const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Message = require('../models/Message');
const Discussion = require('../models/Discussion');
const Group = require('../models/Group');

// @route   POST /api/messages
// @desc    Send message in discussion
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { discussion, content, messageType, replyTo } = req.body;

    // Verify discussion exists
    const discussionDoc = await Discussion.findById(discussion).populate('groups');
    if (!discussionDoc) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // If replyTo is provided, verify the message exists and belongs to the same discussion
    if (replyTo) {
      const replyToMessage = await Message.findById(replyTo);
      if (!replyToMessage) {
        return res.status(404).json({ message: 'Reply target message not found' });
      }
      if (replyToMessage.discussion.toString() !== discussion) {
        return res.status(400).json({ message: 'Cannot reply to message from different discussion' });
      }
    }

    // Find which group the user belongs to in this discussion
    let userGroup = null;
    if (discussionDoc.groups && discussionDoc.groups.length > 0) {
      for (const group of discussionDoc.groups) {
        const isMember = group.members.some(memberId => memberId.toString() === req.user._id.toString());
        if (isMember) {
          userGroup = group._id;
          break;
        }
      }
    }

    const message = await Message.create({
      discussion,
      sender: req.user._id,
      group: userGroup, // Add group to message
      content,
      messageType: messageType || 'text',
      replyTo: replyTo || null
    });

    await message.populate('sender', '-password');

    // Populate group untuk filter di frontend
    if (message.group) {
      await message.populate('group');
    }

    // Populate replyTo message if exists
    if (message.replyTo) {
      await message.populate({
        path: 'replyTo',
        populate: { path: 'sender', select: '-password' }
      });
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/messages/upload
// @desc    Send message with file
// @access  Private
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    const { discussion, content } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Verify discussion exists
    const discussionDoc = await Discussion.findById(discussion).populate('groups');
    if (!discussionDoc) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Find which group the user belongs to in this discussion
    let userGroup = null;
    if (discussionDoc.groups && discussionDoc.groups.length > 0) {
      for (const group of discussionDoc.groups) {
        const isMember = group.members.some(memberId => memberId.toString() === req.user._id.toString());
        if (isMember) {
          userGroup = group._id;
          break;
        }
      }
    }

    const message = await Message.create({
      discussion,
      sender: req.user._id,
      group: userGroup, // Add group to message
      content: content || req.file.originalname,
      messageType: 'file',
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });

    await message.populate('sender', '-password');

    // Populate group untuk filter di frontend
    if (message.group) {
      await message.populate('group');
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/messages/:discussionId
// @desc    Get messages for a discussion (filtered by user's group)
// @access  Private
router.get('/:discussionId', protect, async (req, res) => {
  try {
    // Get discussion with groups
    const discussionDoc = await Discussion.findById(req.params.discussionId).populate('groups');
    if (!discussionDoc) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // If user is dosen (creator), show all messages
    if (req.user.role === 'dosen') {
      const messages = await Message.find({ discussion: req.params.discussionId })
        .populate('sender', '-password')
        .populate('group') // Populate group untuk filter di frontend
        .populate({
          path: 'replyTo',
          populate: { path: 'sender', select: '-password' }
        })
        .sort('createdAt');
      return res.json(messages);
    }

    // For mahasiswa, find which group they belong to
    let userGroup = null;
    if (discussionDoc.groups && discussionDoc.groups.length > 0) {
      for (const group of discussionDoc.groups) {
        const isMember = group.members.some(memberId => memberId.toString() === req.user._id.toString());
        if (isMember) {
          userGroup = group._id;
          break;
        }
      }
    }

    // Filter messages by user's group
    const query = { discussion: req.params.discussionId };
    if (userGroup) {
      query.group = userGroup; // Only show messages from user's group
    }

    const messages = await Message.find(query)
      .populate('sender', '-password')
      .populate('group') // Populate group untuk konsistensi
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: '-password' }
      })
      .sort('createdAt');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/messages/:id
// @desc    Edit message
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { content } = req.body;

    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    message.content = content;
    message.isEdited = true;

    const updatedMessage = await message.save();
    await updatedMessage.populate('sender', '-password');

    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete message
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await message.deleteOne();
    res.json({ message: 'Message removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
