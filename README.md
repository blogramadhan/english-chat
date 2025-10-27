# LOOMA - Online Discussion Platform

A modern web-based discussion platform for English language learning with real-time chat, group management, and user approval system.

## 🌟 Features

### User Management
- **Multi-role System**: Admin, Lecturer (Dosen), Student (Mahasiswa)
- **User Approval Workflow**: Admin approval for new user registrations
- **Profile Management**: Update profile, change password, upload avatar
- **Admin Dashboard**: Manage users, approve/reject registrations, edit user profiles
- **Email Validation**: Duplicate email/NIM/NIP checking during registration
- **Compact Login/Register**: Streamlined authentication forms

### Discussion & Chat
- **Real-time Chat**: Socket.IO for instant messaging
- **Multi-group Discussions**: Support for discussions across multiple groups
- **Group Management**: Lecturers can create and manage student groups
- **Category System**: Organize discussions by categories
- **Accordion UI**: Discussions grouped by categories with collapsible sections
- **Message Features**:
  - Reply to messages with quote preview
  - Edit and delete messages
  - Image uploads in chat
  - Emoji picker support
  - Real-time message synchronization
- **Targeted Messaging**: Lecturers can send messages to:
  - All groups (broadcast)
  - Specific groups only
- **PDF Export**: Download discussion history with images and formatting
- **Discussion Collaboration**: Lecturers can add collaborators to discussions
- **Compact UI**: Optimized chat interface for better space usage

### Lecturer Features
- **Discussion Management**:
  - Create discussions for multiple groups
  - Edit and delete discussions
  - Set discussions as active/inactive
  - Assign discussions to categories
- **Collaborator System**:
  - Add other lecturers as collaborators
  - Collaborators can view, edit, and manage discussions
  - Separate "Active Collaboration" section in dashboard
  - Creator-only controls (manage collaborators, delete discussion)
- **Message Moderation**:
  - Delete any message in their discussions
  - Collaborators can also moderate messages
- **Group-Specific Messaging**:
  - Send messages to all groups or specific groups
  - Visual badges showing message targets
- **PDF Export**: Export discussion history with group filtering

### Student Features
- **Group-based Access**: View discussions from enrolled groups
- **Filtered Messages**: See messages from own group + lecturer broadcasts
- **Reply & React**: Reply to messages with context
- **Image Sharing**: Upload and share images in discussions

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
- `POST /api/auth/register` - User registration (with email/NIM/NIP validation)

### User Management
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `POST /api/users/avatar` - Upload avatar
- `GET /api/users/mahasiswa` - Get all students
- `GET /api/users/lecturers` - Get all lecturers (for collaborator selection)

### Admin
- `GET /api/admin/users/pending` - Get pending users (with pagination)
- `GET /api/admin/users` - Get all users (with pagination)
- `PUT /api/admin/users/:id/approve` - Approve user
- `PUT /api/admin/users/:id/reject` - Reject user
- `PUT /api/admin/users/:id` - Edit user profile
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stats` - Get dashboard statistics

### Groups & Discussions
- `GET /api/groups` - Get user groups
- `POST /api/groups` - Create group (Lecturer)
- `PUT /api/groups/:id` - Update group (Lecturer)
- `DELETE /api/groups/:id` - Delete group (Lecturer)
- `GET /api/discussions` - Get discussions (filtered by creator/collaborator for lecturers)
- `POST /api/discussions` - Create discussion with multiple groups (Lecturer)
- `PUT /api/discussions/:id` - Update discussion (Creator/Collaborator)
- `DELETE /api/discussions/:id` - Delete discussion (Creator only)
- `GET /api/discussions/:id/export-pdf` - Export discussion to PDF with group filtering

### Discussion Collaboration
- `POST /api/discussions/:id/collaborators` - Add collaborator (Creator only)
- `DELETE /api/discussions/:id/collaborators/:dosenId` - Remove collaborator (Creator only)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Lecturer)
- `PUT /api/categories/:id` - Update category (Lecturer)
- `DELETE /api/categories/:id` - Delete category (Lecturer)

### Messages
- `GET /api/messages/:discussionId` - Get discussion messages (filtered by group for students)
- `POST /api/messages` - Send message (with targetGroup for lecturers)
- `POST /api/messages/upload` - Send message with file upload
- `PUT /api/messages/:id` - Edit message (Own messages only)
- `DELETE /api/messages/:id` - Delete message (Own messages or moderator)

### Real-time (Socket.IO)
- `join-discussion` - Join discussion room
- `send-message` - Send message to discussion
- `receive-message` - Receive new message (filtered by group/target)
- `delete-message` - Delete message event
- `message-deleted` - Message deletion notification
- `typing` - User typing indicator
- `user-typing` - Typing notification

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

### Database Reset

**⚠️ Reset entire database (DELETE ALL DATA):**
```bash
cd backend
node scripts/resetDatabase.js
```

This will permanently delete:
- All users (including admin)
- All groups and discussions
- All messages and files

See [RESET_DATABASE.md](RESET_DATABASE.md) for complete guide and safety instructions.

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
- [x] Emoji picker in chat
- [x] Reply to messages with quote preview
- [x] Message edit and delete functionality
- [x] PDF export for discussions with images
- [x] Profile management (update info, password, avatar)
- [x] Admin dashboard & user management with pagination
- [x] Admin edit user profiles
- [x] Group management (create, edit, activate/deactivate)
- [x] Multi-group discussions support
- [x] Discussion categories/tags
- [x] Discussion management (create, edit, activate/deactivate)
- [x] Discussion collaboration system
- [x] Lecturer collaborators with role-based permissions
- [x] Targeted messaging (broadcast or specific groups)
- [x] Message filtering by group for students
- [x] Accordion UI for organized discussions
- [x] Compact UI design for all interfaces
- [x] Custom AlertDialog for confirmations
- [x] Email/NIM/NIP duplicate validation
- [x] Docker deployment with automated backup
- [x] MongoDB Atlas support
- [x] Full English translation

### Future Enhancements 🚀
- [ ] Email notifications for approvals and mentions
- [ ] Discussion search functionality
- [ ] Analytics dashboard for lecturers
- [ ] Message reactions with emoji
- [ ] User mentions (@username)
- [ ] File attachments (PDF, DOCX, etc.)
- [ ] Discussion archiving
- [ ] Export chat to other formats (Word, Excel)
- [ ] Mobile responsive improvements
- [ ] Dark mode theme
- [ ] Read receipts for messages
- [ ] Online/offline status indicators
- [ ] Discussion templates
- [ ] Bulk actions for admin

## 🤝 Collaboration System

### Overview
Lecturers can collaborate on discussions, allowing multiple instructors to co-manage discussions and share teaching responsibilities.

### Features
- **Add Collaborators**: Discussion creators can invite other lecturers
- **Role-Based Permissions**:
  - **Creator**: Full control including manage collaborators and delete discussion
  - **Collaborator**: Can view, edit, send messages, and moderate (cannot manage collaborators or delete)
- **Visual Separation**: Collaborated discussions appear in purple-themed "Active Collaboration" section
- **Access Control**: Buttons dynamically hidden based on user role
- **Real-time Sync**: Collaborators see live updates and can participate immediately

### Permissions Matrix

| Action | Creator | Collaborator | Student |
|--------|---------|--------------|---------|
| View Discussion | ✅ | ✅ | ✅ (if in group) |
| Send Messages | ✅ | ✅ | ✅ (own group) |
| Send to All Groups | ✅ | ✅ | ❌ |
| Send to Specific Group | ✅ | ✅ | ❌ |
| Edit Discussion | ✅ | ✅ | ❌ |
| Delete Messages | ✅ | ✅ | ✅ (own only) |
| Add/Remove Collaborators | ✅ | ❌ | ❌ |
| Delete Discussion | ✅ | ❌ | ❌ |
| Export PDF | ✅ | ✅ | ❌ |

### Use Cases
- Team teaching across multiple groups
- Guest lecturer participation
- Teaching assistant support
- Cross-department collaboration
- Backup instructor access

## 🎨 UI/UX Features

### Dashboard Organization
- **Accordion Layout**: Discussions grouped by categories with collapsible panels
- **Visual Hierarchy**: Clear separation between active and inactive content
- **Collaboration Section**: Dedicated "Active Collaboration" area with purple theme
- **Badge System**: Visual indicators for discussion status and roles
- **Compact Design**: Optimized spacing throughout the application

### Chat Interface
- **Reply System**: Quote and reply to specific messages
- **Emoji Picker**: Built-in emoji selector for messages
- **Image Preview**: In-line image display in chat
- **Group Targeting**: Visual badges showing message broadcast/target
- **Compact Layout**: Reduced padding and spacing for better content density
- **Hover Actions**: Edit/delete/reply buttons appear on hover

### Forms & Modals
- **Custom AlertDialog**: Consistent confirmation dialogs across the app
- **Compact Forms**: Streamlined login and registration
- **Modal Management**:
  - Create/Edit Group
  - Create/Edit Discussion
  - Create/Edit Category
  - Manage Collaborators
  - Export PDF
- **Real-time Validation**: Instant feedback on form inputs

### Admin Dashboard
- **Pagination**: Efficient handling of large user lists
- **Search & Filter**: Quick user lookup
- **Compact Tables**: Dense information display
- **Action Buttons**: Quick approve/reject/edit actions
- **Statistics Cards**: At-a-glance system metrics

## 🔐 Security Features

- JWT token-based authentication
- Password hashing with bcrypt (10 rounds)
- Role-based access control (RBAC)
- Protected API routes with middleware
- File upload validation (type, size)
- Duplicate email/NIM/NIP prevention
- XSS protection
- CORS configuration
- Environment variable management
- Collaborator-based access control

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

## 📚 Documentation

- [ADMIN_GUIDE.md](ADMIN_GUIDE.md) - Admin setup and user management
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment with Docker
- [MONGODB_ATLAS_SETUP.md](MONGODB_ATLAS_SETUP.md) - Cloud database setup
- [DATA_PERSISTENCE.md](DATA_PERSISTENCE.md) - Backup and restore guide
- [RESET_DATABASE.md](RESET_DATABASE.md) - Database reset instructions

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
