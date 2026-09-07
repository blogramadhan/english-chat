# HIFELLA - Human Interaction-Facilitated Environment for Language Learning and Argumentation

> A modern, full-featured web-based discussion platform for English language learning with real-time chat, comprehensive group management, academic affiliation system, and automated user approval workflow.

[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2-purple.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Production Deployment](#-production-deployment)
- [Environment Configuration](#-environment-configuration)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Troubleshooting](#-troubleshooting)
- [Security](#-security)
- [Contributing](#-contributing)

---

## 🌟 Features

### 👥 User Management System
- **Multi-role Authentication**: Admin, Lecturer (Dosen), Student (Mahasiswa)
- **Approval Workflow**: Admin review and approval for new registrations
- **Profile Management**:
  - Complete profile editing with avatar upload
  - Password change with validation
  - Academic information management
- **Email Notifications**:
  - Registration confirmation
  - Password reset functionality
  - Profile update notifications
- **Admin Dashboard with Dual Tabs**:
  - **User Management**: Pending approvals, user list with search/filter, edit/delete operations
  - **Affiliation Management**: Universities, faculties, and programs administration

### 🎓 Academic Affiliation System
- **Hierarchical Structure**: University → Faculty → Program
- **Full CRUD Operations**: Complete create, read, update, delete for all entities
- **Smart Cascading Dropdowns**:
  - Dynamic loading based on parent selection
  - Automatic validation of hierarchical relationships
  - Reset child selections when parent changes
- **Active/Inactive Toggle**: Control visibility of institutions
- **Data Integrity**:
  - Unique university codes
  - Referential integrity enforcement
  - Orphan prevention mechanisms
- **Public & Protected Endpoints**:
  - Public read-only access for registration
  - Protected admin-only write access
  - Field-level security

### 💬 Real-time Discussion & Chat
- **Socket.IO Integration**: Instant bidirectional communication
- **Multi-group Support**: Discussions spanning multiple student groups
- **Category Organization**: Accordion-style grouping by categories
- **Rich Message Features**:
  - Reply with quote preview
  - Edit and delete (own messages)
  - Image uploads (10MB limit)
  - Emoji picker integration
  - Real-time delivery and read status
- **Targeted Broadcasting**:
  - Send to all groups
  - Send to specific groups only
  - Visual badges for message scope
- **PDF Export**: Complete discussion history with images
- **Collaboration System**: Multiple lecturers co-managing discussions

### 👨‍🏫 Lecturer Features
- **Discussion Control**:
  - Create for single or multiple groups
  - Active/inactive status management
  - Category assignment
  - Full edit capabilities
- **Collaborator Management**:
  - Invite co-lecturers
  - Shared moderation rights
  - Creator-only deletion
- **Message Moderation**: Delete any message in owned discussions
- **Group-specific Messaging**: Fine-grained audience control
- **Export Capabilities**: PDF generation with filtering options

### 👨‍🎓 Student Features
- **Group-based Access Control**: See only relevant discussions
- **Filtered Message View**: Own group + broadcast messages
- **Interactive Participation**:
  - Reply with context
  - Upload images
  - Use emoji reactions
- **Multi-lecturer Registration**: Select multiple instructors during signup
- **Academic Profile**: Complete institutional affiliation

### 🔒 Security Features
- **Authentication**: JWT token-based with 30-day validity
- **Password Security**: bcrypt hashing (10 salt rounds)
- **Authorization**: Role-based access control (RBAC)
- **API Protection**:
  - Middleware guards on all endpoints
  - Input validation and sanitization
  - Rate limiting ready
- **File Upload Security**:
  - Type validation (images only)
  - Size limits (5MB avatars, 10MB chat images)
  - Sanitized filenames
  - Secure storage paths
- **CORS Configuration**: Properly configured for production
- **Environment Variables**: Sensitive data externalized
- **XSS Protection**: Input encoding and sanitization

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20+ | Runtime environment |
| **Express.js** | 4.x | Web framework |
| **MongoDB** | 6.0+ | NoSQL database |
| **Mongoose** | 8.x | ODM for MongoDB |
| **Socket.IO** | 4.6+ | Real-time communication |
| **JWT** | 9.x | Authentication tokens |
| **bcryptjs** | 2.4.x | Password hashing |
| **Multer** | 1.4.x | File upload handling |
| **PDFKit** | 0.13.x | PDF generation |
| **Resend** | 6.x | Email service |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2 | UI library |
| **Vite** | 7.2+ | Build tool & dev server |
| **Chakra UI** | 2.8+ | Component library |
| **React Router** | 6.21+ | Client-side routing |
| **Axios** | 1.6+ | HTTP client |
| **Socket.IO Client** | 4.6+ | WebSocket client |
| **Framer Motion** | 10.x | Animations |
| **Emoji Picker React** | 4.5+ | Emoji selection |

### DevOps & Deployment
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **MongoDB Atlas** | Cloud database hosting |
| **Caddy** | Reverse proxy with automatic SSL |

---

## 📋 Prerequisites

### For Development
- **Node.js** 20.19+ or 22.12+ ([Download](https://nodejs.org/))
- **MongoDB** 6.0+ ([Download](https://www.mongodb.com/try/download/community))
- **npm** or **yarn** package manager
- **Git** for version control

### For Production (Docker)
- **Docker** 20.10+ ([Install](https://docs.docker.com/get-docker/))
- **Docker Compose** 2.0+ (included with Docker Desktop)
- **MongoDB Atlas** account (recommended) or self-hosted MongoDB
- **Domain name** with DNS configured (for SSL)
- **Resend API Key** for email functionality ([Get free key](https://resend.com/))

---

## 🚀 Quick Start

### Development Setup

**1. Clone the Repository**
```bash
git clone <repository-url>
cd english-chat
```

**2. Backend Setup**
```bash
cd backend
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Required Backend Environment Variables:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hifella
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
CLIENT_URL=http://localhost:3000
RESEND_API=your_resend_api_key_here
```

**3. Create Initial Admin Account**
```bash
npm run create-admin
```
**Default Credentials:**
- Email: `admin@example.com`
- Password: `admin123`
- ⚠️ **Change immediately after first login!**

**4. Start Backend Server**
```bash
npm run dev
# Server runs on http://localhost:5000
```

**5. Frontend Setup (New Terminal)**
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

**6. Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Login**: Use admin credentials above

**7. Setup Academic Data (First Time)**
1. Login as admin
2. Navigate to **Admin Dashboard → Affiliation**
3. Create:
   - **Universities** (e.g., "Universitas Tanjungpura", code: "UNTAN")
   - **Faculties** under universities
   - **Programs** under faculties
4. Go to **User Management → Pending Approval** to approve new users

---

## 🐳 Production Deployment

### Docker-based Deployment (Recommended)

**1. Prepare Environment**
```bash
# Copy and configure production environment
cp .env.production .env.production.local
nano .env.production.local
```

**Production Environment Configuration:**
```env
NODE_ENV=production
PORT=5000

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hifella?retryWrites=true&w=majority

# Security
JWT_SECRET=generate_with_openssl_rand_base64_32

# URLs (Replace with your actual domains)
CLIENT_URL=https://hifella.thynk.my.id
VITE_API_URL=https://hifella-pi.thynk.my.id
VITE_SOCKET_URL=https://hifella-pi.thynk.my.id

# Email Service
RESEND_API=re_your_resend_api_key
```

**2. Deploy with Interactive Script**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Interactive Menu Options:**
1. **Deploy/Update Application** - Build and start containers
2. **Update from GitHub** - Pull latest code and redeploy
3. **Stop containers** - Stop services (preserves data)
4. **Restart containers** - Quick restart
5. **View logs** - Real-time log monitoring
6. **Backup** - Backup MongoDB (if self-hosted) + uploaded files
7. **Restore from backup** - Restore uploads; skips MongoDB if using Atlas
8. **Remove containers** - Clean removal
9. **Exit** - Exit script

**3. Post-Deployment Steps**

**Create Admin Account (if needed):**
```bash
docker-compose exec backend npm run create-admin
```

**Check Deployment Status:**
```bash
# View all containers
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

**4. Access Your Application**
- Frontend: `https://your-frontend-domain.com`
- Backend API: `https://your-backend-domain.com`

**5. Configure Reverse Proxy (Caddy)**

**Example Caddyfile (see `Caddyfile.example`):**
```
hifella.thynk.my.id {
    reverse_proxy localhost:3090
}

hifella-pi.thynk.my.id {
    reverse_proxy localhost:5000
}
```

Caddy automatically provisions and renews SSL certificates via Let's Encrypt.

---

## 🌍 Environment Configuration

### Backend Environment Variables (.env)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `production` | Yes |
| `PORT` | Server port | `5000` | Yes |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` | Yes |
| `JWT_SECRET` | JWT signing secret (32+ chars) | Generated with OpenSSL | Yes |
| `CLIENT_URL` | Frontend URL for CORS | `https://hifella.thynk.my.id` | Yes |
| `RESEND_API` | Resend email API key | `re_xxxxx` | Yes |

**Generate Secure JWT Secret:**
```bash
openssl rand -base64 32
```

### Frontend Environment Variables

**Development (.env.development):**
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

**Production (.env.production):**
```env
VITE_API_URL=https://hifella-pi.thynk.my.id
VITE_SOCKET_URL=https://hifella-pi.thynk.my.id
```

---

## 📁 Project Structure

```
hifella/
├── backend/                    # Backend application
│   ├── models/                # Mongoose schemas
│   │   ├── User.js           # User model with roles & academic fields
│   │   ├── University.js     # University model
│   │   ├── Faculty.js        # Faculty model
│   │   ├── Program.js        # Study program model
│   │   ├── Group.js          # Student group model
│   │   ├── Discussion.js     # Discussion model
│   │   ├── Category.js       # Category model
│   │   └── Message.js        # Message model
│   ├── routes/               # API routes
│   │   ├── auth.js          # Authentication (login, register, reset password)
│   │   ├── admin.js         # Admin endpoints (user approval, management)
│   │   ├── users.js         # User profile management
│   │   ├── universities.js  # University CRUD
│   │   ├── faculties.js     # Faculty CRUD
│   │   ├── programs.js      # Program CRUD
│   │   ├── groups.js        # Group management
│   │   ├── discussions.js   # Discussion management
│   │   ├── categories.js    # Category management
│   │   └── messages.js      # Message handling & real-time
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js         # JWT authentication & authorization
│   │   └── upload.js       # Multer file upload configuration
│   ├── services/           # Business logic services
│   │   └── emailService.js # Resend email integration
│   ├── scripts/            # Utility scripts
│   │   ├── createAdmin.js          # Admin account creation
│   │   ├── resetAdmin.js           # Admin password reset
│   │   ├── fixCodeIssue.js         # Database migration
│   │   └── seedData.js             # Sample data seeding
│   ├── uploads/            # File storage
│   │   ├── avatars/        # User profile pictures
│   │   └── chat/          # Chat images
│   ├── Dockerfile          # Backend Docker image
│   ├── server.js           # Express server entry point
│   └── package.json        # Backend dependencies
│
├── frontend/                   # Frontend application
│   ├── public/                # Static assets
│   │   ├── hifella-logo.jpg  # App logo
│   │   ├── favicon.jpg       # Favicon
│   │   └── manifest.json     # PWA manifest
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   │   ├── HifellaLogo.jsx       # Logo component
│   │   │   ├── Navbar.jsx            # Navigation bar
│   │   │   ├── EditUserModal.jsx     # Admin user edit modal
│   │   │   ├── UniversityManagement.jsx  # University CRUD UI
│   │   │   ├── FacultyManagement.jsx     # Faculty CRUD UI
│   │   │   ├── ProgramManagement.jsx     # Program CRUD UI
│   │   │   ├── GroupModal.jsx            # Group create/edit
│   │   │   ├── DiscussionModal.jsx       # Discussion create/edit
│   │   │   ├── CategoryModal.jsx         # Category create/edit
│   │   │   ├── CollaboratorModal.jsx     # Manage collaborators
│   │   │   └── NotificationBell.jsx      # Email notification system
│   │   ├── pages/             # Page components
│   │   │   ├── Login.jsx              # Login page
│   │   │   ├── Register.jsx           # Registration with academic fields
│   │   │   ├── ForgotPassword.jsx     # Password reset request
│   │   │   ├── ResetPassword.jsx      # Password reset form
│   │   │   ├── AdminDashboard.jsx     # Admin panel (dual tabs)
│   │   │   ├── DosenDashboard.jsx     # Lecturer dashboard
│   │   │   ├── MahasiswaDashboard.jsx # Student dashboard
│   │   │   ├── Profile.jsx            # User profile management
│   │   │   └── DiscussionView.jsx     # Real-time chat interface
│   │   ├── context/           # React Context
│   │   │   └── AuthContext.jsx       # Authentication state management
│   │   ├── utils/             # Utility functions
│   │   │   ├── api.js               # Axios instance with interceptors
│   │   │   └── avatar.js            # Avatar URL helper
│   │   ├── main.jsx           # React entry point
│   │   └── App.jsx            # Main app component
│   ├── Dockerfile             # Frontend Docker image
│   ├── vite.config.js         # Vite configuration
│   ├── index.html             # HTML entry point
│   └── package.json           # Frontend dependencies
│
├── docker-compose.yml         # Multi-container orchestration
├── .env.production            # Production environment template
├── deploy.sh                  # Interactive deployment script
├── backup.sh                  # Database backup script
├── restore.sh                 # Database restore script
├── kill-port.sh              # Port cleanup utility
└── README.md                  # This file
```

---

## 🔌 API Documentation

### Authentication Endpoints

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "mahasiswa",
  "nim": "C1234567",
  "university": "65abc123def...",
  "faculty": "65abc456def...",
  "program": "65abc789def...",
  "lecturers": ["65abc111def...", "65abc222def..."]
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65abc...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "mahasiswa",
    "status": "approved"
  }
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "password": "newpassword123"
}
```

### User Management Endpoints

**All require Authentication header:**
```http
Authorization: Bearer <jwt_token>
```

#### Get Current User
```http
GET /api/users/me
```

#### Update Profile
```http
PUT /api/users/profile
Content-Type: application/json

{
  "name": "John Updated",
  "university": "65abc...",
  "faculty": "65abc...",
  "program": "65abc..."
}
```

#### Upload Avatar
```http
POST /api/users/avatar
Content-Type: multipart/form-data

avatar: <image_file>
```

### Admin Endpoints (Admin Role Required)

#### Get Pending Users
```http
GET /api/admin/users/pending
```

#### Approve User
```http
PUT /api/admin/users/:userId/approve
```

#### Reject User
```http
PUT /api/admin/users/:userId/reject
```

### Discussion Endpoints

#### Create Discussion
```http
POST /api/discussions
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Week 1 - Introduction to English",
  "description": "Discussion for week 1 materials",
  "category": "65abc...",
  "groups": ["65abc111...", "65abc222..."],
  "isActive": true
}
```

#### Get Messages
```http
GET /api/messages/:discussionId
Authorization: Bearer <token>
```

#### Send Message
```http
POST /api/messages
Content-Type: application/json
Authorization: Bearer <token>

{
  "discussion": "65abc...",
  "content": "Hello everyone!",
  "targetGroup": "65abc111..." // Optional, null for broadcast
}
```

### Socket.IO Events

**Client → Server:**
- `join-discussion` - Join discussion room
- `send-message` - Send new message
- `typing` - User is typing

**Server → Client:**
- `receive-message` - New message received
- `message-deleted` - Message was deleted
- `user-typing` - Another user is typing

---

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  role: String (enum: ['admin', 'dosen', 'mahasiswa']),
  status: String (enum: ['pending', 'approved', 'rejected'], default: 'pending'),
  nim: String (sparse unique, for mahasiswa),
  nip: String (sparse unique, for dosen),
  university: ObjectId (ref: 'University'),
  faculty: ObjectId (ref: 'Faculty'),
  program: ObjectId (ref: 'Program'),
  lecturers: [ObjectId] (ref: 'User', for mahasiswa only),
  avatar: String (file path),
  approvedBy: ObjectId (ref: 'User'),
  approvedAt: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### University Model
```javascript
{
  name: String (required, unique),
  code: String (required, unique),
  description: String,
  address: String,
  isActive: Boolean (default: true),
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

### Discussion Model
```javascript
{
  title: String (required),
  description: String,
  category: ObjectId (ref: 'Category'),
  creator: ObjectId (ref: 'User', required),
  collaborators: [ObjectId] (ref: 'User'),
  groups: [ObjectId] (ref: 'Group', required),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model
```javascript
{
  discussion: ObjectId (ref: 'Discussion', required),
  sender: ObjectId (ref: 'User', required),
  content: String (required),
  imageUrl: String,
  replyTo: ObjectId (ref: 'Message'),
  targetGroup: ObjectId (ref: 'Group'), // null for broadcast
  isEdited: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. MongoDB Connection Failed

**Error:**
```
MongoNetworkError: failed to connect to server
```

**Solutions:**
- **Local MongoDB**: Ensure MongoDB service is running
  ```bash
  # Linux/macOS
  sudo systemctl start mongod
  sudo systemctl status mongod

  # Windows
  net start MongoDB
  ```
- **MongoDB Atlas**:
  - Check IP whitelist (add `0.0.0.0/0` for testing)
  - Verify credentials in connection string
  - Ensure network access is configured

#### 2. Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Find and kill process
lsof -ti:5000 | xargs kill -9

# Or use helper script
./kill-port.sh 5000
```

#### 3. Docker Build Fails

**Error:** `Node.js version incompatible with Vite`

**Solution:** Already fixed - Dockerfiles now use Node.js 20-alpine

**Error:** `npm install fails in container`

**Solution:**
```bash
# Clear Docker cache and rebuild
docker-compose down
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

#### 4. Frontend Can't Connect to Backend

**CORS Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- Verify `CLIENT_URL` in backend `.env` matches frontend URL
- Restart backend after changing environment variables
  ```bash
  # Docker
  docker-compose restart backend

  # PM2
  pm2 restart all
  ```

#### 5. File Upload Fails

**Solution:**
- Check upload directory permissions:
  ```bash
  chmod -R 755 backend/uploads
  ```
- Verify file size limits:
  - Avatars: 5MB max
  - Chat images: 10MB max
- Check Nginx `client_max_body_size` if using reverse proxy

#### 6. Email Not Sending

**Solution:**
- Verify `RESEND_API` key in `.env`
- Check Resend dashboard for API usage and errors
- Ensure `CLIENT_URL` is correct for reset links
- Check email logs:
  ```bash
  docker-compose logs -f backend | grep email
  ```

#### 7. Can't Login After Registration

**Solution:**
- Check user status in database (must be "approved")
- Admin must approve user:
  1. Login as admin
  2. Go to **User Management → Pending Approval**
  3. Approve the user

#### 8. Real-time Chat Not Working

**Solution:**
- Verify Socket.IO connection in browser console
- Check if WebSocket is blocked by firewall/proxy
- Ensure `VITE_SOCKET_URL` matches backend URL
- Restart both backend and frontend

---

## 🔐 Security

### Best Practices Implemented

✅ **Password Security**
- bcrypt hashing with 10 salt rounds
- Minimum 6 characters required
- Password reset with expiring tokens

✅ **Authentication**
- JWT tokens with 30-day expiration
- Secure HTTP-only cookies recommended for production
- Token refresh mechanism

✅ **Authorization**
- Role-based access control (RBAC)
- Route-level protection
- Resource ownership verification

✅ **Input Validation**
- Server-side validation for all inputs
- Email format verification
- Unique constraint checking (email, NIM, NIP)

✅ **File Upload Security**
- File type whitelisting (images only)
- File size limits enforced
- Sanitized filenames
- Separate upload directories

✅ **API Security**
- CORS properly configured
- Rate limiting ready (implement with express-rate-limit)
- SQL injection prevention (NoSQL with Mongoose)
- XSS protection with input sanitization

### Security Checklist for Production

- [ ] Change default admin password immediately
- [ ] Use strong JWT_SECRET (32+ random characters)
- [ ] Enable HTTPS/SSL with valid certificates
- [ ] Configure restrictive CORS origins (not `*`)
- [ ] Set up MongoDB Atlas IP whitelist
- [ ] Enable MongoDB authentication
- [ ] Implement rate limiting on auth endpoints
- [ ] Set up logging and monitoring
- [ ] Regular security updates: `npm audit fix`
- [ ] Backup regularly with `./backup.sh` — backs up uploaded files + MongoDB (auto-skipped on Atlas Free Tier since no native backup is provided)
- [ ] Use environment variables for all secrets
- [ ] Review and limit file upload sizes
- [ ] Set up firewall rules
- [ ] Use reverse proxy (Nginx) with security headers
- [ ] Implement session management
- [ ] Set up intrusion detection

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Write clear commit messages
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation as needed

---

## 📄 License

This project is licensed under the ISC License.

```
Copyright (c) 2024-2025 HIFELLA Team

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

---

## 👥 Credits & Acknowledgments

**Development Team:**
- **Primary Developer**: Rizko
- **AI Assistant**: Claude (Anthropic) - Code assistance and optimization

**Powered By:**
- [React](https://reactjs.org/) - UI Library
- [Chakra UI](https://chakra-ui.com/) - Component Library
- [Socket.IO](https://socket.io/) - Real-time Engine
- [MongoDB](https://www.mongodb.com/) - Database
- [Express.js](https://expressjs.com/) - Backend Framework
- [Vite](https://vitejs.dev/) - Build Tool
- [Docker](https://www.docker.com/) - Containerization
- [Resend](https://resend.com/) - Email Service

---

## 📞 Support & Contact

**For Issues:**
- Create an issue in the repository
- Check [Troubleshooting](#-troubleshooting) section first

**For Questions:**
- Contact project maintainer
- Review API documentation above

---

**Version**: 2.2.1
**Last Updated**: 2026-03-16
**Status**: Production Ready ✅
**Node.js**: 20+ Required
**Vite**: 7.2.6

---

<div align="center">

Made with ❤️ for English Language Learning

**[⬆ Back to Top](#hifella---interactive-english-learning-platform)**

</div>
