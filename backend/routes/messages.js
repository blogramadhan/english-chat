const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Message = require('../models/Message');
const Discussion = require('../models/Discussion');

// @route   POST /api/messages
// @desc    Send message in discussion
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { discussion, content, messageType } = req.body;

    // Verify discussion exists
    const discussionDoc = await Discussion.findById(discussion);
    if (!discussionDoc) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const message = await Message.create({
      discussion,
      sender: req.user._id,
      content,
      messageType: messageType || 'text'
    });

    await message.populate('sender', '-password');

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
    const discussionDoc = await Discussion.findById(discussion);
    if (!discussionDoc) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const message = await Message.create({
      discussion,
      sender: req.user._id,
      content: content || req.file.originalname,
      messageType: 'file',
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });

    await message.populate('sender', '-password');

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/messages/:discussionId
// @desc    Get messages for a discussion
// @access  Private
router.get('/:discussionId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ discussion: req.params.discussionId })
      .populate('sender', '-password')
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
