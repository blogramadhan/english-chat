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
    const { discussion, content, messageType, replyTo, targetGroup } = req.body;

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

    // For dosen: handle broadcast vs specific group
    let isForAllGroups = false;
    let finalTargetGroup = null;

    if (req.user.role === 'dosen') {
      if (targetGroup === 'all' || !targetGroup) {
        isForAllGroups = true;
        finalTargetGroup = null;
      } else {
        isForAllGroups = false;
        finalTargetGroup = targetGroup;
      }
    } else {
      // For mahasiswa: targetGroup is always their own group
      finalTargetGroup = userGroup;
    }

    const message = await Message.create({
      discussion,
      sender: req.user._id,
      group: userGroup, // Sender's group (for mahasiswa)
      targetGroup: finalTargetGroup, // Which group to send to (for dosen)
      isForAllGroups, // True if dosen sends to all groups
      content,
      messageType: messageType || 'text',
      replyTo: replyTo || null
    });

    await message.populate('sender', '-password');

    // Populate group untuk filter di frontend
    if (message.group) {
      await message.populate('group');
    }

    // Populate targetGroup untuk menampilkan info di frontend
    if (message.targetGroup) {
      await message.populate('targetGroup');
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
    const { discussion, content, targetGroup } = req.body;

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

    // For dosen: handle broadcast vs specific group
    let isForAllGroups = false;
    let finalTargetGroup = null;

    if (req.user.role === 'dosen') {
      if (targetGroup === 'all' || !targetGroup) {
        isForAllGroups = true;
        finalTargetGroup = null;
      } else {
        isForAllGroups = false;
        finalTargetGroup = targetGroup;
      }
    } else {
      // For mahasiswa: targetGroup is always their own group
      finalTargetGroup = userGroup;
    }

    const message = await Message.create({
      discussion,
      sender: req.user._id,
      group: userGroup, // Sender's group (for mahasiswa)
      targetGroup: finalTargetGroup, // Which group to send to (for dosen)
      isForAllGroups, // True if dosen sends to all groups
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

    // Populate targetGroup untuk menampilkan info di frontend
    if (message.targetGroup) {
      await message.populate('targetGroup');
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
        .populate('targetGroup') // Populate targetGroup untuk menampilkan info
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

    // For mahasiswa: show messages from their own group + broadcast messages from dosen
    const query = {
      discussion: req.params.discussionId,
      $or: [
        { group: userGroup }, // Messages from their own group (from mahasiswa)
        { isForAllGroups: true }, // Broadcast messages from dosen to all groups
        { targetGroup: userGroup } // Messages from dosen specifically to their group
      ]
    };

    const messages = await Message.find(query)
      .populate('sender', '-password')
      .populate('group') // Populate group untuk konsistensi
      .populate('targetGroup') // Populate targetGroup untuk menampilkan info
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
    const message = await Message.findById(req.params.id).populate('discussion');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Get the discussion to check if user is the creator (dosen)
    const discussion = await Discussion.findById(message.discussion);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const isSender = message.sender.toString() === req.user._id.toString();
    const isDosenCreator = req.user.role === 'dosen' && discussion.createdBy.toString() === req.user._id.toString();

    // Allow deletion if user is the sender OR if user is dosen who created the discussion
    if (!isSender && !isDosenCreator) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await message.deleteOne();
    res.json({
      message: 'Message removed',
      messageId: req.params.id,
      discussionId: discussion._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
