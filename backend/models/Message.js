const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  discussion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: false // Optional for backward compatibility
  },
  targetGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: false // For dosen: which group this message is sent to (null = all groups)
  },
  isForAllGroups: {
    type: Boolean,
    default: false // For dosen: true if message is sent to all groups
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: false // Optional - only set when replying to a message
  },
  content: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'emoji'],
    default: 'text'
  },
  fileUrl: {
    type: String
  },
  fileName: {
    type: String
  },
  fileSize: {
    type: Number
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// The transcript is always read per discussion, newest first.
messageSchema.index({ discussion: 1, createdAt: -1 });
messageSchema.index({ discussion: 1, group: 1 });
messageSchema.index({ discussion: 1, targetGroup: 1 });
messageSchema.index({ replyTo: 1 });

module.exports = mongoose.model('Message', messageSchema);
