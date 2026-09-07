const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  requireDiscussionAccess,
  resolveAccess
} = require('../middleware/discussionAccess');
const upload = require('../middleware/upload');
const Message = require('../models/Message');
const Group = require('../models/Group');
const Notification = require('../models/Notification');

// Newest-N cap so a long-running discussion cannot load unbounded history.
const DEFAULT_LIMIT = 500;
const MAX_LIMIT = 1000;

/**
 * Socket rooms a message may be delivered to.
 * Group isolation is enforced here, on the server, not in the browser.
 */
const roomsFor = (message) => {
  const discussionId = message.discussion.toString();
  const base = `discussion:${discussionId}`;

  if (message.isForAllGroups) return [base];

  const rooms = [`${base}:staff`];
  const raw = message.targetGroup || message.group;
  const groupId = raw && (raw._id || raw);
  if (groupId) rooms.push(`${base}:group:${groupId.toString()}`);
  return rooms;
};

const emitScoped = (req, message, event, payload) => {
  const io = req.app.get('io');
  if (!io) return;
  for (const room of roomsFor(message)) {
    io.to(room).emit(event, payload);
  }
};

// Build notifications for a new message, without querying groups one at a time.
const createMessageNotifications = async (message, discussionDoc) => {
  try {
    const recipientIds = new Set();
    const add = (id) => {
      if (id && id.toString() !== message.sender.toString()) {
        recipientIds.add(id.toString());
      }
    };

    if (message.isForAllGroups) {
      // Everyone in every group attached to the discussion.
      const groupIds = (discussionDoc.groups || []).map((g) => g._id || g);
      const groups = await Group.find({ _id: { $in: groupIds } }).select('members');
      groups.forEach((g) => (g.members || []).forEach(add));
    } else if (message.targetGroup) {
      const group = await Group.findById(message.targetGroup).select('members');
      if (group) (group.members || []).forEach(add);
    } else if (message.group) {
      // From a student: notify the teaching staff and their own group.
      add(discussionDoc.createdBy);
      (discussionDoc.collaborators || []).forEach(add);
      const group = await Group.findById(message.group).select('members');
      if (group) (group.members || []).forEach(add);
    }

    if (recipientIds.size === 0) return;

    const type = message.replyTo ? 'new_reply' : 'new_message';
    const content =
      message.messageType === 'file'
        ? `sent a file: ${message.fileName}`
        : message.content.length > 50
          ? `${message.content.substring(0, 50)}...`
          : message.content;

    await Notification.insertMany(
      [...recipientIds].map((recipient) => ({
        recipient,
        sender: message.sender,
        discussion: discussionDoc._id,
        message: message._id,
        type,
        content
      }))
    );
  } catch (error) {
    // Notifications are best-effort; never fail the message because of them.
    console.error('Error creating notifications:', error);
  }
};

// Decide the group fields for a new message from the sender's role.
const resolveScope = (req, targetGroup) => {
  const { isOwner, group } = req.discussionAccess;

  if (isOwner) {
    const broadcast = !targetGroup || targetGroup === 'all';
    return {
      group: null,
      targetGroup: broadcast ? null : targetGroup,
      isForAllGroups: broadcast
    };
  }

  // A student always posts into their own group, whatever the client asked for.
  return { group, targetGroup: group, isForAllGroups: false };
};

const populateMessage = (query) =>
  query
    .populate('sender', '-password')
    .populate('group')
    .populate('targetGroup')
    .populate({ path: 'replyTo', populate: { path: 'sender', select: '-password' } });

// @route   POST /api/messages
// @desc    Send message in discussion
// @access  Private (participants of the discussion)
router.post('/', protect, requireDiscussionAccess(), async (req, res, next) => {
  try {
    const { content, messageType, replyTo, targetGroup } = req.body;
    const { discussion } = req.discussionAccess;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    if (replyTo) {
      const parent = await Message.findById(replyTo);
      if (!parent) {
        return res.status(404).json({ message: 'Reply target message not found' });
      }
      if (parent.discussion.toString() !== discussion._id.toString()) {
        return res
          .status(400)
          .json({ message: 'Cannot reply to message from different discussion' });
      }
    }

    const scope = resolveScope(req, targetGroup);

    const message = await Message.create({
      discussion: discussion._id,
      sender: req.user._id,
      ...scope,
      content: content.trim(),
      messageType: messageType || 'text',
      replyTo: replyTo || null
    });

    const payload = await populateMessage(Message.findById(message._id));

    emitScoped(req, payload, 'receive-message', payload);
    createMessageNotifications(payload, discussion);

    res.status(201).json(payload);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/messages/upload
// @desc    Send message with an attachment
// @access  Private (participants of the discussion)
router.post(
  '/upload',
  protect,
  upload.single('file'),
  requireDiscussionAccess(),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { content, targetGroup } = req.body;
      const { discussion } = req.discussionAccess;
      const scope = resolveScope(req, targetGroup);

      const created = await Message.create({
        discussion: discussion._id,
        sender: req.user._id,
        ...scope,
        content: content || req.file.originalname,
        messageType: 'file',
        fileUrl: `/uploads/${req.file.filename}`,
        fileName: req.file.originalname,
        fileSize: req.file.size
      });

      const payload = await populateMessage(Message.findById(created._id));

      emitScoped(req, payload, 'receive-message', payload);
      createMessageNotifications(payload, discussion);

      res.status(201).json(payload);
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/messages/:discussionId
// @desc    Get messages visible to the caller in a discussion
// @access  Private (participants of the discussion)
router.get(
  '/:discussionId',
  protect,
  requireDiscussionAccess('discussionId'),
  async (req, res, next) => {
    try {
      const { discussion, isOwner, group } = req.discussionAccess;

      const limit = Math.min(
        Math.max(parseInt(req.query.limit, 10) || DEFAULT_LIMIT, 1),
        MAX_LIMIT
      );

      // Teaching staff see every group; a student sees their own group's posts,
      // broadcasts, and posts addressed to their group. `group` is never null
      // here because requireDiscussionAccess rejects non-participants.
      const filter = isOwner
        ? { discussion: discussion._id }
        : {
            discussion: discussion._id,
            $or: [{ group }, { isForAllGroups: true }, { targetGroup: group }]
          };

      // Take the newest N, then hand them back oldest-first for the transcript.
      const newest = await populateMessage(
        Message.find(filter).sort({ createdAt: -1 }).limit(limit)
      );

      res.json(newest.reverse());
    } catch (error) {
      next(error);
    }
  }
);

// @route   DELETE /api/messages/:id
// @desc    Delete a message (sender, or the dosen who owns the discussion)
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const access = await resolveAccess(message.discussion, req.user);
    if (!access) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const isSender = message.sender.toString() === req.user._id.toString();
    if (!isSender && !access.isOwner) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this message' });
    }

    // Capture the delivery scope before the document goes away.
    const scope = {
      discussion: message.discussion,
      isForAllGroups: message.isForAllGroups,
      targetGroup: message.targetGroup,
      group: message.group
    };

    await message.deleteOne();

    emitScoped(req, scope, 'message-deleted', { messageId: req.params.id });

    res.json({
      message: 'Message removed',
      messageId: req.params.id,
      discussionId: message.discussion
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Message not found' });
    }
    next(error);
  }
});

module.exports = router;
