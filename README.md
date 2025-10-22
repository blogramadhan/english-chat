# THYNK - Online Discussion Platform

A modern web-based discussion platform for English language learning with real-time chat, group management, and user approval system.

## 🌟 Features

### User Management
- **Multi-role System**: Admin, Lecturer, Student
- **User Approval Workflow**: Admin approval for new user registrations
- **Profile Management**: Update profile, change password, upload avatar
- **Admin Dashboard**: Manage users, approve/reject registrations, edit user profiles

### Discussion & Chat
- **Real-time Chat**: Socket.IO for real-time communication
- **Group Management**: Lecturers can create and manage groups
- **Discussion Rooms**: Organized discussions per group
- **File Uploads**: Support for image uploads in chat
- **PDF Export**: Download discussion history in PDF format
- **Edit & Delete Messages**: Full message management capabilities

### Security
- **JWT Authentication**: Token-based authentication
- **Password Hashing**: bcrypt for password security
- **Role-based Access Control**: Different access levels for each role
- **Protected Routes**: Middleware for endpoint protection
- **File Upload Validation**: Secure file upload with type and size validation

## 🛠️ Tech Stack

### Backend
- Node.js 18+ | Express.js | MongoDB + Mongoose
- Socket.IO | JWT + bcryptjs | Multer | PDFKit

### Frontend
- React 18 | Vite | Chakra UI
- React Router v6 | Axios | Socket.IO Client

### Deployment
- Docker + Docker Compose

## 📋 Prerequisites

### Development
- Node.js 18+
- MongoDB 6.0+
- npm atau yarn

### Production (Docker)
- Docker 20.10+
- Docker Compose 2.0+
- MongoDB Atlas account (recommended) or local MongoDB

## 🚀 Quick Start

### Development

```bash
# Clone repository
git clone <repository-url>
cd english-chat

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB connection string
npm run create-admin
npm run dev

# Frontend setup (in new terminal)
cd frontend
npm install
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Admin Login: admin@example.com / admin123

### Production (Docker)

```bash
# Setup environment
cp .env.production .env.production.local
nano .env.production.local
# Configure MongoDB Atlas connection string

# Deploy with interactive menu
chmod +x deploy.sh
./deploy.sh
# Select option 1 to deploy
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment guide.

## 📁 Project Structure

```
english-chat/
├── backend/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── middleware/      # Auth & upload middleware
│   ├── uploads/         # Uploaded files storage
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components (Navbar, Modals, etc.)
│   │   ├── pages/       # Page components (Dashboard, Profile, etc.)
│   │   ├── context/     # React context (Auth)
│   │   └── utils/       # API utilities
│   └── index.html       # Entry point
├── docker-compose.yml   # Docker services configuration
├── deploy.sh           # Interactive deployment script
├── backup.sh           # Database backup script
├── restore.sh          # Database restore script
└── Documentation files
```

## 🔑 Default Credentials

**Admin Account:**
- Email: admin@example.com
- Password: admin123

⚠️ **Important:** Change password immediately after first login!

## 📖 Documentation

- [Admin Guide](ADMIN_GUIDE.md) - Administrator guide
- [MongoDB Atlas Setup](MONGODB_ATLAS_SETUP.md) - Cloud MongoDB setup
- [Deployment Guide](DEPLOYMENT.md) - Production deployment guide
- [Data Persistence](DATA_PERSISTENCE.md) - Backup & data safety guide

## 🔧 Scripts

### Backend Scripts
```bash
npm start              # Production server
npm run dev           # Development server with nodemon
npm run create-admin  # Create initial admin account
npm run reset-admin   # Reset admin credentials to default
```

### Frontend Scripts
```bash
npm run dev          # Development server (Vite)
npm run build        # Production build
npm run preview      # Preview production build
```

### Deployment Scripts
```bash
./deploy.sh          # Interactive deployment menu
./backup.sh          # Backup database and files
./restore.sh         # Restore from backup
./kill-port.sh 5000  # Kill process on specific port
```

## 🌐 Key API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### User Management
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `POST /api/users/avatar` - Upload avatar
- `GET /api/users/mahasiswa` - Get all students

### Admin
- `GET /api/admin/users/pending` - Get pending users
- `PUT /api/admin/users/:id/approve` - Approve user
- `PUT /api/admin/users/:id/reject` - Reject user
- `PUT /api/admin/users/:id` - Edit user profile
- `GET /api/admin/stats` - Get dashboard statistics

### Groups & Discussions
- `GET /api/groups` - Get user groups
- `POST /api/groups` - Create group (Lecturer)
- `PUT /api/groups/:id` - Update group (Lecturer)
- `GET /api/discussions` - Get discussions
- `POST /api/discussions` - Create discussion (Lecturer)
- `PUT /api/discussions/:id` - Update discussion (Lecturer)
- `GET /api/discussions/:id/export-pdf` - Export discussion to PDF

### Real-time (Socket.IO)
- `joinDiscussion` - Join discussion room
- `sendMessage` - Send message
- `editMessage` - Edit message
- `deleteMessage` - Delete message

## 🐛 Troubleshooting

### MongoDB Connection Issues
**Local MongoDB not running:**
```bash
sudo systemctl start mongod
sudo systemctl status mongod
```

**MongoDB Atlas connection timeout:**
- Check network access settings (IP whitelist)
- Verify connection string in `.env`
- Ensure database user has correct permissions

### Port Already in Use
```bash
# Find process using port
lsof -ti:5000

# Kill the process
kill -9 <PID>

# Or use helper script
./kill-port.sh 5000
```

### Authentication Issues
**Reset admin password:**
```bash
cd backend
npm run reset-admin
```

**Login fails after profile update:**
- Clear browser cache and localStorage
- Verify email and password are correct
- Check if account is approved by admin

### File Upload Issues
**Avatar not displaying:**
- Check if file size is under 5MB
- Verify file type is JPG, PNG, or GIF
- Ensure `uploads/` directory exists and has write permissions

### Docker Issues
**Container won't start:**
```bash
# View logs
docker-compose logs -f

# Rebuild containers
docker-compose down
docker-compose up --build
```

**Data persistence:**
- See [DATA_PERSISTENCE.md](DATA_PERSISTENCE.md) for backup/restore guide

## 📊 Roadmap

### Completed Features ✅
- [x] JWT Authentication & authorization
- [x] Multi-role system (Admin, Lecturer, Student)
- [x] Real-time chat with Socket.IO
- [x] File upload (images) in chat
- [x] PDF export for discussions
- [x] Profile management (update info, password, avatar)
- [x] Admin dashboard & user management
- [x] Admin edit user profiles
- [x] Group management (create, edit, activate/deactivate)
- [x] Discussion management (create, edit, activate/deactivate)
- [x] Docker deployment with automated backup
- [x] MongoDB Atlas support
- [x] Full English translation

### Future Enhancements 🚀
- [ ] Email notifications for approvals
- [ ] Discussion search functionality
- [ ] Analytics dashboard
- [ ] Message reactions (emoji)
- [ ] User mentions (@username)
- [ ] File attachments (PDF, DOCX)
- [ ] Discussion categories/tags
- [ ] Mobile responsive improvements
- [ ] Dark mode theme

## 🔐 Security Features

- JWT token-based authentication
- Password hashing with bcrypt (10 rounds)
- Role-based access control (RBAC)
- Protected API routes with middleware
- File upload validation (type, size)
- XSS protection
- CORS configuration
- Environment variable management

## 🌍 Environment Variables

### Backend (.env)
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
```

### Frontend (Vite)
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 📄 License

ISC License

## 👥 Contributors

**Rizko** - Initial development and architecture

## 🙏 Acknowledgments

- React team for the amazing framework
- Chakra UI for beautiful components
- Socket.IO for real-time capabilities
- MongoDB team for the excellent database
- Docker for containerization support
