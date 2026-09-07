const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'dosen', 'mahasiswa'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  nim: {
    type: String,
    sparse: true // Only for mahasiswa
  },
  nip: {
    type: String,
    sparse: true // Only for dosen
  },
  lecturers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Reference to dosen(s), only for mahasiswa
  }],
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Deprecated: kept for backward compatibility
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University'
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program'
  },
  avatar: {
    type: String,
    default: ''
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const crypto = require('crypto');

  // Generate random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set token expiration (1 hour)
  this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

  // Return unhashed token to send via email
  return resetToken;
};

// Validate password reset token
userSchema.methods.validatePasswordResetToken = function (token) {
  const crypto = require('crypto');

  // Hash the provided token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Check if token matches and hasn't expired
  return (
    this.resetPasswordToken === hashedToken &&
    this.resetPasswordExpires > Date.now()
  );
};

userSchema.index({ role: 1, status: 1 });
userSchema.index({ lecturers: 1 });
userSchema.index({ resetPasswordToken: 1 });

module.exports = mongoose.model('User', userSchema);
