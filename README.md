# LOOMA - Learning Online Platform

A modern web-based discussion platform for English language learning with real-time chat, group management, academic affiliation management, and user approval system.

## 🌟 Features

### User Management
- **Multi-role System**: Admin, Lecturer (Dosen), Student (Mahasiswa)
- **User Approval Workflow**: Admin approval for new user registrations
- **Profile Management**: Update profile, change password, upload avatar
- **Admin Dashboard**: Organized tabs for User Management and Affiliation
  - **User Management Tab**:
    - Pending Approvals: Review and approve/reject new users
    - All Users: Comprehensive user list with search, edit, and delete
  - **Affiliation Tab**:
    - Universities: Manage university data
    - Faculties: Manage faculties under universities
    - Programs: Manage study programs under faculties
- **Academic Information**: Users have university, faculty, and program affiliation
- **Email Validation**: Duplicate email/NIM/NIP checking during registration
- **Compact Login/Register**: Streamlined authentication forms with academic fields

### Academic Affiliation Management
- **Hierarchical Structure**: University → Faculty → Program
- **Complete CRUD Operations**: Create, read, update, delete for all affiliation entities
- **Cascading Dropdowns**: Smart selection system ensuring data integrity
  - Select university → enables faculty dropdown
  - Select faculty → enables program dropdown
  - Changing parent resets children selections
- **Active/Inactive Status**: Toggle visibility of affiliation data
- **Search & Filter**: Quick lookup for universities, faculties, and programs
- **Integration Points**:
  - Registration form with academic fields
  - User profile with editable academic information
  - Admin edit user with full academic management
- **Data Validation**:
  - Unique university codes
  - Faculty must belong to selected university
  - Program must belong to selected faculty
- **Public Endpoints**: Registration page can access active affiliation data
- **Migration Scripts**: Tools for updating existing user data

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
- **Academic Data Access**: View student affiliation information

### Student Features
- **Group-based Access**: View discussions from enrolled groups
- **Filtered Messages**: See messages from own group + lecturer broadcasts
- **Reply & React**: Reply to messages with context
- **Image Sharing**: Upload and share images in discussions
- **Academic Profile**: Complete profile with university, faculty, and program
- **Multiple Lecturers**: Register with multiple lecturers for group assignments

### Security
- **JWT Authentication**: Token-based authentication
- **Password Hashing**: bcrypt for password security
- **Role-based Access Control**: Different access levels for each role
- **Protected Routes**: Middleware for endpoint protection
- **File Upload Validation**: Secure file upload with type and size validation
- **Public API Safety**: Read-only access with limited fields for registration
- **Data Validation**: Comprehensive input validation and sanitization

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose ODM
- **Real-time**: Socket.IO
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer
- **PDF Generation**: PDFKit
- **Environment**: dotenv

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **UI Library**: Chakra UI
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **State Management**: React Context API

### Deployment
- Docker + Docker Compose
- MongoDB Atlas (Cloud Database)
- PM2 (Process Manager)

## 📋 Prerequisites

### Development
- Node.js 18 or higher
- MongoDB 6.0 or higher
- npm or yarn package manager

### Production (Docker)
- Docker 20.10 or higher
- Docker Compose 2.0 or higher
- MongoDB Atlas account (recommended) or local MongoDB

## 🚀 Quick Start

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd english-chat

# Backend setup
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB connection string:
# MONGODB_URI=mongodb://localhost:27017/looma
# JWT_SECRET=your_secret_key_here
# PORT=5000

# Create initial admin account
npm run create-admin

# Start backend server
npm run dev

# Frontend setup (in new terminal)
cd frontend
npm install

# Create .env file (if needed for custom API URL)
# VITE_API_URL=http://localhost:5000

# Start frontend development server
npm run dev
```

**Access the Application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- **Default Admin Login:**
  - Email: admin@example.com
  - Password: admin123

### Production Deployment (Docker)

```bash
# 1. Setup environment
cp .env.production .env.production.local
nano .env.production.local

# Configure your MongoDB Atlas connection:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/looma
# JWT_SECRET=your_production_secret_key
# CLIENT_URL=http://your-domain.com

# 2. Deploy with interactive menu
chmod +x deploy.sh
./deploy.sh

# Select option 1: Deploy/Update Application
# Follow the interactive prompts
```

### Initial Setup After Deployment

1. **Create Admin Account** (if not exists):
```bash
docker-compose exec backend npm run create-admin
```

2. **Login as Admin**:
   - Navigate to your domain
   - Login with admin@example.com / admin123
   - **IMPORTANT**: Change password immediately!

3. **Setup Academic Affiliations**:
   - Go to Admin Dashboard → Affiliation tab
   - Create universities (e.g., "Universitas Tanjungpura", code: "UNTAN")
   - Create faculties under universities
   - Create programs under faculties

4. **Approve Users**:
   - Go to User Management → Pending Approval
   - Review and approve/reject new user registrations

## 📁 Project Structure

```
english-chat/
├── backend/
│   ├── models/              # Mongoose schemas
│   │   ├── User.js         # User model with academic fields
│   │   ├── University.js   # University model
│   │   ├── Faculty.js      # Faculty model
│   │   ├── Program.js      # Program/Prodi model
│   │   ├── Group.js        # Group model
│   │   ├── Discussion.js   # Discussion model
│   │   ├── Category.js     # Category model
│   │   └── Message.js      # Message model
│   ├── routes/             # Express routes
│   │   ├── auth.js         # Authentication (login, register)
│   │   ├── admin.js        # Admin endpoints (user management)
│   │   ├── users.js        # User profile management
│   │   ├── universities.js # University CRUD
│   │   ├── faculties.js    # Faculty CRUD
│   │   ├── programs.js     # Program CRUD
│   │   ├── groups.js       # Group management
│   │   ├── discussions.js  # Discussion management
│   │   ├── categories.js   # Category management
│   │   └── messages.js     # Message handling
│   ├── middleware/         # Custom middleware
│   │   ├── auth.js         # JWT authentication & authorization
│   │   └── upload.js       # File upload configuration
│   ├── scripts/            # Utility scripts
│   │   ├── createAdmin.js          # Create admin account
│   │   ├── updateExistingStudents.js  # Migrate student data
│   │   └── fixCodeIssue.js         # Database migration tool
│   ├── uploads/            # File storage
│   │   ├── avatars/        # User avatars
│   │   └── chat/           # Chat images
│   └── server.js           # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── Navbar.jsx              # Navigation bar
│   │   │   ├── EditUserModal.jsx       # Admin edit user (with academic fields)
│   │   │   ├── UniversityManagement.jsx # University management
│   │   │   ├── UniversityModal.jsx      # Create/Edit university
│   │   │   ├── FacultyManagement.jsx    # Faculty management
│   │   │   ├── FacultyModal.jsx         # Create/Edit faculty
│   │   │   ├── ProgramManagement.jsx    # Program management
│   │   │   ├── ProgramModal.jsx         # Create/Edit program
│   │   │   ├── GroupModal.jsx           # Create/Edit group
│   │   │   ├── DiscussionModal.jsx      # Create/Edit discussion
│   │   │   ├── CategoryModal.jsx        # Create/Edit category
│   │   │   └── CollaboratorModal.jsx    # Manage collaborators
│   │   ├── pages/          # Page components
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Register.jsx         # Registration with academic fields
│   │   │   ├── AdminDashboard.jsx   # Admin dashboard (User Mgmt + Affiliation)
│   │   │   ├── DosenDashboard.jsx   # Lecturer dashboard
│   │   │   ├── MahasiswaDashboard.jsx # Student dashboard
│   │   │   ├── Profile.jsx          # User profile with academic fields
│   │   │   └── DiscussionView.jsx   # Discussion chat interface
│   │   ├── context/        # React Context
│   │   │   └── AuthContext.jsx      # Authentication state
│   │   └── utils/          # Utilities
│   │       ├── api.js              # Axios instance with interceptors
│   │       └── avatar.js           # Avatar URL helper
│   └── index.html          # Entry point
├── docker-compose.yml      # Docker services configuration
├── Dockerfile.backend      # Backend container image
├── Dockerfile.frontend     # Frontend container image
├── deploy.sh              # Interactive deployment script
├── backup.sh              # Database backup script
├── restore.sh             # Database restore script
├── .env.example           # Environment variables template
└── README.md              # This file
```

## 🔑 Default Credentials

**Admin Account:**
- Email: admin@example.com
- Password: admin123

⚠️ **CRITICAL SECURITY**: Change admin password immediately after first login!

## 🔧 Available Scripts

### Backend Scripts

```bash
# Development
npm run dev              # Start dev server with nodemon (auto-reload)
npm start                # Start production server

# Setup & Maintenance
npm run create-admin     # Create initial admin account
npm run reset-admin      # Reset admin credentials to default

# Database Migration
cd scripts
node updateExistingStudents.js    # Add academic info to existing students
node fixCodeIssue.js              # Fix database indexes (if needed)
```

### Frontend Scripts

```bash
npm run dev             # Start Vite dev server (http://localhost:5173)
npm run build           # Build for production
npm run preview         # Preview production build locally
npm run lint            # Run ESLint
```

### Deployment Scripts

```bash
./deploy.sh             # Interactive deployment menu
./backup.sh             # Backup database and uploaded files
./restore.sh            # Restore from backup
./kill-port.sh 5000     # Kill process on specific port
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration with academic fields

### User Management
- `GET /api/users/me` - Get current user (with populated academic data)
- `PUT /api/users/profile` - Update profile (including academic fields)
- `PUT /api/users/password` - Change password
- `POST /api/users/avatar` - Upload avatar image
- `GET /api/users/mahasiswa` - Get all approved students
- `GET /api/users/lecturers` - Get all approved lecturers

### Admin - User Management
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users/pending` - Get pending users
- `GET /api/admin/users` - Get all users with filters
- `GET /api/admin/users/:id` - Get single user with populated fields
- `PUT /api/admin/users/:id/approve` - Approve user
- `PUT /api/admin/users/:id/reject` - Reject user
- `PUT /api/admin/users/:id` - Edit user profile (including academic fields)
- `DELETE /api/admin/users/:id` - Delete user

### Academic Affiliation (Public & Protected)
- `GET /api/universities/active` - Get active universities (PUBLIC - for registration)
- `GET /api/universities` - Get all universities (PROTECTED - admin only)
- `POST /api/universities` - Create university (PROTECTED - admin only)
- `PUT /api/universities/:id` - Update university (PROTECTED - admin only)
- `DELETE /api/universities/:id` - Delete university (PROTECTED - admin only)

- `GET /api/faculties/active?universityId=<id>` - Get active faculties (PUBLIC)
- `GET /api/faculties` - Get all faculties (PROTECTED - admin only)
- `POST /api/faculties` - Create faculty (PROTECTED - admin only)
- `PUT /api/faculties/:id` - Update faculty (PROTECTED - admin only)
- `DELETE /api/faculties/:id` - Delete faculty (PROTECTED - admin only)

- `GET /api/programs/active?facultyId=<id>` - Get active programs (PUBLIC)
- `GET /api/programs` - Get all programs (PROTECTED - admin only)
- `POST /api/programs` - Create program (PROTECTED - admin only)
- `PUT /api/programs/:id` - Update program (PROTECTED - admin only)
- `DELETE /api/programs/:id` - Delete program (PROTECTED - admin only)

### Groups & Discussions
- `GET /api/groups` - Get user groups
- `POST /api/groups` - Create group (Lecturer)
- `PUT /api/groups/:id` - Update group (Lecturer)
- `DELETE /api/groups/:id` - Delete group (Lecturer)

- `GET /api/discussions` - Get discussions (filtered by role)
- `POST /api/discussions` - Create discussion with multiple groups
- `PUT /api/discussions/:id` - Update discussion
- `DELETE /api/discussions/:id` - Delete discussion (Creator only)
- `GET /api/discussions/:id/export-pdf` - Export to PDF

### Discussion Collaboration
- `POST /api/discussions/:id/collaborators` - Add collaborator (Creator only)
- `DELETE /api/discussions/:id/collaborators/:dosenId` - Remove collaborator

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Lecturer)
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Messages
- `GET /api/messages/:discussionId` - Get messages (filtered by group)
- `POST /api/messages` - Send message (with optional targetGroup)
- `POST /api/messages/upload` - Send message with image
- `PUT /api/messages/:id` - Edit own message
- `DELETE /api/messages/:id` - Delete message (own or moderator)

### Real-time Events (Socket.IO)
- `join-discussion` - Join discussion room
- `send-message` - Send message event
- `receive-message` - Receive message event
- `delete-message` - Delete message event
- `message-deleted` - Deletion notification
- `typing` - User typing event
- `user-typing` - Typing notification

## 🔐 Security Features

- **Authentication**: JWT token-based authentication with secure storage
- **Password Security**: bcrypt hashing with 10 salt rounds
- **Authorization**: Role-based access control (RBAC)
  - Admin: Full system access
  - Lecturer: Discussion and group management
  - Student: Limited access to enrolled groups
- **Protected Routes**: Middleware guards on all sensitive endpoints
- **File Upload Security**:
  - Type validation (images only for avatars and chat)
  - Size limits (5MB for avatars, 10MB for chat images)
  - Secure file storage with sanitized filenames
- **Input Validation**: Server-side validation using express-validator
- **Data Validation**:
  - Unique email/NIM/NIP checking
  - Unique university codes
  - Hierarchical data integrity (faculty belongs to university, etc.)
- **Public API Safety**: Read-only endpoints with limited field exposure
- **CORS Configuration**: Properly configured for production
- **Environment Variables**: Sensitive data stored in .env files
- **XSS Protection**: Input sanitization and output encoding

## 🎨 User Interface Features

### Admin Dashboard Organization
- **Two Main Tabs**:
  1. **User Management** (Blue nested tabs)
     - Pending Approval: Review new registrations
     - All Users: Complete user management
  2. **Affiliation** (Green nested tabs)
     - Universities: Manage university data
     - Faculties: Manage faculty data
     - Programs: Manage program data
- **Nested Tab System**: Clean organization with visual color distinction
- **Search & Filter**: Quick lookup across all tables
- **Pagination**: Efficient handling of large datasets
- **Action Buttons**: Quick access to approve, reject, edit, delete
- **Statistics Cards**: Dashboard overview with key metrics

### Registration & Profile
- **Cascading Dropdowns**: Smart academic field selection
  - University → Faculty → Program
  - Automatic data loading and filtering
  - Disabled states for dependent fields
- **Real-time Validation**: Instant feedback on duplicate emails/NIM/NIP
- **Multiple Lecturer Selection**: Students can select multiple lecturers
- **Avatar Upload**: Profile picture with preview
- **Academic Information Section**: Clearly separated from personal info

### Discussion Interface
- **Accordion Layout**: Collapsible categories for better organization
- **Visual Hierarchy**: Active vs Inactive discussions
- **Collaboration Section**: Dedicated purple-themed area
- **Badge System**: Status indicators (Active, Inactive, Creator, Collaborator)
- **Compact Design**: Optimized spacing throughout

### Chat Interface
- **Reply System**: Quote and reply to messages
- **Emoji Picker**: Built-in emoji selector
- **Image Preview**: Inline image display
- **Group Targeting**: Visual badges for message broadcast/target
- **Hover Actions**: Edit/delete/reply on hover
- **Real-time Updates**: Instant message synchronization

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Local MongoDB not running:**
```bash
# Linux/macOS
sudo systemctl start mongod
sudo systemctl status mongod

# Or check if process is running
ps aux | grep mongod
```

**MongoDB Atlas connection timeout:**
- Verify connection string format in `.env`
- Check IP whitelist in Atlas (add 0.0.0.0/0 for all IPs or your specific IP)
- Ensure database user credentials are correct
- Check network access settings in MongoDB Atlas dashboard

**Connection string format:**
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -ti:5000

# Kill the process
kill -9 $(lsof -ti:5000)

# Or use helper script
./kill-port.sh 5000

# For frontend (port 5173)
kill -9 $(lsof -ti:5173)
```

### Authentication Issues

**Reset admin password:**
```bash
cd backend
npm run reset-admin
```

**Can't login after profile update:**
1. Clear browser localStorage: `localStorage.clear()` in browser console
2. Clear browser cache (Ctrl+Shift+Delete)
3. Verify account is approved (status: "approved")
4. Check JWT_SECRET hasn't changed
5. Try creating new admin: `npm run create-admin`

**Token expired errors:**
- Logout and login again
- Token validity: 30 days (configurable in backend/routes/auth.js)

### Academic Affiliation Issues

**Dropdown not showing data in registration:**
- Check if universities exist (login as admin → Affiliation tab)
- Verify `/api/universities/active` endpoint returns data
- Check browser console for API errors
- Ensure universities are marked as "active"

**Cascading dropdowns not working:**
- Verify hierarchical data: Faculty must have `university` field
- Check Program has both `faculty` and `university` fields
- Ensure database relationships are correct

**Failed to save faculty/program with duplicate error:**
- Run migration script: `cd backend/scripts && node fixCodeIssue.js`
- This removes old unique indexes that may cause conflicts

### File Upload Issues

**Avatar not uploading:**
- Check file size < 5MB
- Verify file type: JPG, PNG, or GIF only
- Ensure `backend/uploads/avatars/` directory exists
- Check directory permissions: `chmod -R 755 backend/uploads`

**Chat images not displaying:**
- Verify `backend/uploads/chat/` directory exists
- Check file size < 10MB
- Ensure backend URL is correctly configured in frontend

### Docker Issues

**Container won't start:**
```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**Database connection from Docker:**
- Use `host.docker.internal` instead of `localhost` for local MongoDB
- Or use MongoDB Atlas connection string
- Check network settings in docker-compose.yml

**File permissions in Docker:**
```bash
# Fix upload directory permissions
docker-compose exec backend chmod -R 755 /app/uploads
```

### Data Migration

**Add academic info to existing students:**
```bash
cd backend/scripts
node updateExistingStudents.js
```

This script:
- Creates Universitas Tanjungpura, Fakultas Teknik, Teknik Informatika if not exists
- Updates all students without academic info
- Safe to run multiple times (idempotent)

**Remove old database indexes:**
```bash
cd backend/scripts
node fixCodeIssue.js
```

### Frontend Build Issues

**Build fails:**
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Try build again
npm run build
```

**Production build not working:**
- Check `VITE_API_URL` in .env.production
- Verify API_URL doesn't have trailing slash
- Ensure build output exists in `frontend/dist/`

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: admin, dosen, mahasiswa),
  status: String (enum: pending, approved, rejected),
  nim: String (sparse unique, for mahasiswa),
  nip: String (sparse unique, for dosen),
  university: ObjectId (ref: University),
  faculty: ObjectId (ref: Faculty),
  program: ObjectId (ref: Program),
  lecturers: [ObjectId] (ref: User, for mahasiswa),
  avatar: String,
  approvedBy: ObjectId (ref: User),
  approvedAt: Date
}
```

### University Model
```javascript
{
  name: String (required),
  code: String (required, unique),
  description: String,
  address: String,
  isActive: Boolean (default: true),
  createdBy: ObjectId (ref: User)
}
```

### Faculty Model
```javascript
{
  name: String (required),
  description: String,
  university: ObjectId (ref: University, required),
  isActive: Boolean (default: true),
  createdBy: ObjectId (ref: User)
}
```

### Program Model
```javascript
{
  name: String (required),
  description: String,
  level: String (enum: D3, D4, S1, S2, S3),
  faculty: ObjectId (ref: Faculty, required),
  university: ObjectId (ref: University, required),
  isActive: Boolean (default: true),
  createdBy: ObjectId (ref: User)
}
```

### Group Model
```javascript
{
  name: String (required),
  description: String,
  lecturer: ObjectId (ref: User, required),
  members: [ObjectId] (ref: User),
  isActive: Boolean (default: true)
}
```

### Discussion Model
```javascript
{
  title: String (required),
  description: String,
  category: ObjectId (ref: Category),
  creator: ObjectId (ref: User, required),
  collaborators: [ObjectId] (ref: User),
  groups: [ObjectId] (ref: Group, required),
  isActive: Boolean (default: true)
}
```

### Message Model
```javascript
{
  discussion: ObjectId (ref: Discussion, required),
  sender: ObjectId (ref: User, required),
  content: String (required),
  imageUrl: String,
  replyTo: ObjectId (ref: Message),
  targetGroup: ObjectId (ref: Group),
  isEdited: Boolean (default: false)
}
```

## 🌍 Environment Configuration

### Backend Environment Variables (.env)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/looma
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/looma

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### Frontend Environment Variables

**Development (.env.development):**
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

**Production (.env.production):**
```env
VITE_API_URL=https://your-api-domain.com
VITE_SOCKET_URL=https://your-api-domain.com
```

## 📚 Feature Documentation

### Academic Affiliation System

**Purpose**: Manage hierarchical academic structure (University → Faculty → Program)

**Key Features**:
- Hierarchical data model with referential integrity
- Cascading dropdowns prevent orphaned data
- Public endpoints for registration (read-only, limited fields)
- Admin-only write access with full CRUD
- Active/Inactive status for visibility control

**Use Cases**:
- User registration with complete academic background
- Admin management of institutional structure
- Reporting and analytics by affiliation
- Student grouping by program/faculty

**Technical Implementation**:
- MongoDB references with Mongoose populate
- Client-side cascading state management
- Server-side validation of hierarchical relationships
- Migration scripts for existing data

### Collaboration System

**Purpose**: Enable multiple lecturers to co-manage discussions

**Permissions Matrix**:

| Action | Creator | Collaborator | Student |
|--------|---------|--------------|---------|
| View Discussion | ✅ | ✅ | ✅ (if in group) |
| Send Messages | ✅ | ✅ | ✅ (own group) |
| Target Specific Group | ✅ | ✅ | ❌ |
| Edit Discussion | ✅ | ✅ | ❌ |
| Delete Messages | ✅ | ✅ | ✅ (own only) |
| Manage Collaborators | ✅ | ❌ | ❌ |
| Delete Discussion | ✅ | ❌ | ❌ |
| Export PDF | ✅ | ✅ | ❌ |

**Use Cases**:
- Team teaching across multiple groups
- Guest lecturer participation
- Teaching assistant support
- Cross-department collaboration
- Backup instructor access

## 🚀 Deployment Best Practices

### Pre-Deployment Checklist

- [ ] Change default admin password
- [ ] Configure MongoDB Atlas with IP whitelist
- [ ] Set strong JWT_SECRET (minimum 32 characters)
- [ ] Configure proper CORS origins
- [ ] Set NODE_ENV=production
- [ ] Enable MongoDB backup strategy
- [ ] Configure file upload limits
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring and logging
- [ ] Test backup and restore procedures

### Production Environment

**Recommended Setup**:
- MongoDB Atlas (Cloud Database)
- Docker + Docker Compose (Containerization)
- Nginx (Reverse Proxy + SSL)
- PM2 (Process Management - if not using Docker)
- Let's Encrypt (Free SSL Certificates)

**Monitoring**:
- MongoDB Atlas monitoring dashboard
- Docker logs: `docker-compose logs -f`
- Nginx access/error logs
- Application logs in backend/

### Backup Strategy

**Automated Daily Backup**:
```bash
# Add to crontab
0 2 * * * /path/to/backup.sh
```

**Manual Backup**:
```bash
./backup.sh
# Creates: backups/backup-YYYYMMDD-HHMMSS.tar.gz
```

**Restore**:
```bash
./restore.sh
# Select backup file to restore
```

## 📖 User Guides

### Admin Workflow

1. **Initial Setup**:
   - Login with default credentials
   - Change admin password immediately
   - Create institutional structure (Universities, Faculties, Programs)

2. **User Management**:
   - Review pending registrations (User Management → Pending Approval)
   - Approve legitimate users, reject spam/invalid
   - Edit user information if needed (User Management → All Users)
   - Monitor user activity and manage accounts

3. **Affiliation Management**:
   - Create universities with unique codes
   - Add faculties under appropriate universities
   - Create programs under faculties with proper level (D3/D4/S1/S2/S3)
   - Toggle active/inactive status as needed

### Lecturer Workflow

1. **Initial Setup**:
   - Wait for admin approval after registration
   - Complete profile with academic information
   - Upload avatar

2. **Group Management**:
   - Create student groups
   - Add students to appropriate groups
   - Manage group membership

3. **Discussion Management**:
   - Create discussions assigned to one or more groups
   - Organize with categories
   - Add collaborators for team teaching
   - Set active/inactive status

4. **Teaching Activities**:
   - Send messages (all groups or specific group)
   - Reply to student messages
   - Upload images for visual explanation
   - Moderate discussions (edit/delete messages)
   - Export discussions to PDF

### Student Workflow

1. **Registration**:
   - Register with complete information
   - Select academic affiliation (university, faculty, program)
   - Choose lecturers (can select multiple)
   - Wait for admin approval

2. **Profile Setup**:
   - Complete profile information
   - Upload avatar
   - Update academic information if needed

3. **Participating in Discussions**:
   - View discussions from enrolled groups
   - Read messages (own group + broadcasts)
   - Reply to messages with quotes
   - Upload images
   - Edit/delete own messages

## 🎯 Roadmap

### Completed Features ✅

- [x] JWT Authentication & authorization
- [x] Multi-role system (Admin, Lecturer, Student)
- [x] Real-time chat with Socket.IO
- [x] File upload (images, avatars)
- [x] Emoji picker in chat
- [x] Message reply, edit, delete
- [x] PDF export with images
- [x] Profile management
- [x] Admin dashboard with nested tabs
- [x] User approval workflow
- [x] Group management
- [x] Multi-group discussions
- [x] Discussion categories
- [x] Collaboration system
- [x] Targeted messaging
- [x] **Academic Affiliation Management**
- [x] **Hierarchical data structure (University/Faculty/Program)**
- [x] **Cascading dropdowns**
- [x] **Admin edit user with academic fields**
- [x] **Registration with academic information**
- [x] **Profile with academic information**
- [x] **Migration scripts**
- [x] Docker deployment
- [x] MongoDB Atlas support
- [x] Compact UI design
- [x] Email/NIM/NIP validation

### Planned Enhancements 🚀

- [ ] Email notifications (approvals, mentions)
- [ ] Advanced search with filters (by affiliation)
- [ ] Analytics dashboard (by program/faculty)
- [ ] Bulk user import from CSV/Excel
- [ ] Student performance tracking
- [ ] Assignment submission system
- [ ] Grade management
- [ ] Attendance tracking
- [ ] Calendar integration
- [ ] Mobile app (React Native)
- [ ] Message reactions with emoji
- [ ] User mentions (@username)
- [ ] File attachments (PDF, DOCX, etc.)
- [ ] Discussion archiving
- [ ] Export to Word/Excel
- [ ] Dark mode theme
- [ ] Read receipts
- [ ] Online/offline status
- [ ] Discussion templates
- [ ] Two-factor authentication (2FA)
- [ ] LDAP/SSO integration
- [ ] Multi-language support (Indonesian full)

## 📄 License

ISC License

Copyright (c) 2024

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

## 👥 Contributors

**Primary Developer**: Rizko
- Initial development and architecture
- Feature implementation
- Academic affiliation system

**Powered by**: Claude (Anthropic)
- Code assistance and optimization
- Feature design consultation
- Documentation

## 🙏 Acknowledgments

- **React Team** - Amazing frontend framework
- **Chakra UI** - Beautiful and accessible component library
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB** - Flexible and scalable NoSQL database
- **Express.js** - Minimal and flexible Node.js web framework
- **Vite** - Next generation frontend tooling
- **Docker** - Container platform for consistent deployments
- **Anthropic (Claude)** - AI assistance for development

## 📞 Support & Contact

For issues, questions, or contributions:
- Create an issue in the repository
- Contact project maintainer
- Check troubleshooting section in this README

---

**Last Updated**: 2025-10-31
**Version**: 2.0.0
**Status**: Production Ready ✅
