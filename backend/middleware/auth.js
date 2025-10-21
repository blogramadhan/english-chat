const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Check if user is dosen
exports.isDosen = (req, res, next) => {
  if (req.user && req.user.role === 'dosen') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Dosen only.' });
  }
};

// Check if user is mahasiswa
exports.isMahasiswa = (req, res, next) => {
  if (req.user && req.user.role === 'mahasiswa') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Mahasiswa only.' });
  }
};
