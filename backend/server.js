require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const User = require('./models/User');
const { resolveAccess } = require('./middleware/discussionAccess');

// ---------------------------------------------------------------------------
// Configuration — fail fast rather than serving a broken deployment
// ---------------------------------------------------------------------------
const isProduction = process.env.NODE_ENV === 'production';

const missing = ['MONGODB_URI', 'JWT_SECRET'].filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

if (isProduction && process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be at least 32 characters in production.');
  process.exit(1);
}

// CLIENT_URL may list several origins, comma separated.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

const corsOrigin = (origin, callback) => {
  // Same-origin and non-browser callers send no Origin header.
  if (!origin) return callback(null, true);
  if (allowedOrigins.includes(origin.replace(/\/$/, ''))) return callback(null, true);
  return callback(new Error(`Origin not allowed by CORS: ${origin}`));
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: corsOrigin, methods: ['GET', 'POST'], credentials: true }
});

// Routes emit socket events through this handle.
app.set('io', io);

// Caddy terminates TLS in front of us; trust its forwarding headers so that
// rate limiting sees real client addresses.
app.set('trust proxy', 1);

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(
  helmet({
    // Uploads are served from this origin and embedded by the SPA elsewhere.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false
  })
);
app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Credential endpoints are the ones worth brute forcing.
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' }
}));
app.use(['/api/auth/forgot-password', '/api/auth/reset-password'], rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many password reset requests. Please try again later.' }
}));
app.use('/api/auth/register', rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many registration attempts. Please try again later.' }
}));
app.use('/api', rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please slow down.' }
}));

// Absolute path: the process must not depend on its working directory.
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    maxAge: '7d',
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff')
  })
);

// Caddy's health_uri is /api/health; keep /health too for local checks.
app.get(['/health', '/api/health'], (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const db = states[mongoose.connection.readyState] || 'unknown';
  res.status(db === 'connected' ? 200 : 503).json({ status: db === 'connected' ? 'ok' : 'degraded', db });
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/discussions', require('./routes/discussions'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/universities', require('./routes/universities'));
app.use('/api/faculties', require('./routes/faculties'));
app.use('/api/programs', require('./routes/programs'));

app.use('/api', (req, res) => res.status(404).json({ message: 'Endpoint not found' }));

// ---------------------------------------------------------------------------
// Socket.IO — authenticated, and scoped to the rooms a user may actually read
// ---------------------------------------------------------------------------
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace(/^Bearer /, '');

    if (!token) return next(new Error('Authentication required'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new Error('User not found'));
    if (user.role !== 'admin' && user.status !== 'approved') {
      return next(new Error('Account not approved'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket) => {
  // Which discussions this socket is cleared for, and in what capacity.
  const joined = new Map();

  const scopedRooms = (discussionId, { isOwner, group }) => {
    const base = `discussion:${discussionId}`;
    return isOwner
      ? [base]
      : [`${base}:staff`, group ? `${base}:group:${group.toString()}` : null].filter(Boolean);
  };

  socket.on('join-discussion', async (discussionId, ack) => {
    try {
      if (!discussionId || typeof discussionId !== 'string') return;

      const access = await resolveAccess(discussionId, socket.user);
      if (!access || (!access.isOwner && !access.isMember)) {
        if (typeof ack === 'function') ack({ ok: false, error: 'forbidden' });
        return;
      }

      const base = `discussion:${discussionId}`;
      socket.join(base);
      if (access.isOwner) socket.join(`${base}:staff`);
      else socket.join(`${base}:group:${access.group.toString()}`);

      joined.set(discussionId, { isOwner: access.isOwner, group: access.group });
      if (typeof ack === 'function') ack({ ok: true });
    } catch (error) {
      if (typeof ack === 'function') ack({ ok: false, error: 'failed' });
    }
  });

  socket.on('leave-discussion', (discussionId) => {
    const entry = joined.get(discussionId);
    if (!entry) return;
    socket.leave(`discussion:${discussionId}`);
    for (const room of scopedRooms(discussionId, entry)) socket.leave(room);
    joined.delete(discussionId);
  });

  // Typing indicators are the only client-originated broadcast left; message
  // and deletion events are emitted by the routes after they persist.
  socket.on('typing', (data) => {
    const discussionId = data?.discussionId;
    const entry = joined.get(discussionId);
    if (!entry) return;

    const payload = { discussionId, userId: socket.user._id, name: socket.user.name };
    for (const room of scopedRooms(discussionId, entry)) {
      socket.to(room).emit('user-typing', payload);
    }
  });
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------
app.use((err, req, res, next) => {
  if (err && err.message && err.message.startsWith('Origin not allowed by CORS')) {
    return res.status(403).json({ message: 'Origin not allowed' });
  }
  if (err && err.name === 'MulterError') {
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (max 5MB)' : 'File upload failed';
    return res.status(400).json({ message });
  }
  // The multer fileFilter rejects unsupported types with a plain Error.
  if (err && /file gambar yang diperbolehkan/i.test(err.message || '')) {
    return res.status(400).json({ message: err.message });
  }

  console.error(err.stack || err);
  res.status(err.status || 500).json({
    message: 'Something went wrong!',
    // Internal messages stay on the server in production.
    ...(isProduction ? {} : { error: err.message })
  });
});

// ---------------------------------------------------------------------------
// Startup
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    console.log('MongoDB connected successfully');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    // Listening without a database only produces a wall of 500s.
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

mongoose.connection.on('error', (err) => console.error('MongoDB error:', err.message));
mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));

const shutdown = (signal) => async () => {
  console.log(`${signal} received, shutting down`);
  io.close();
  server.close(() => {
    mongoose.connection.close(false).then(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10000).unref();
};
process.on('SIGTERM', shutdown('SIGTERM'));
process.on('SIGINT', shutdown('SIGINT'));
