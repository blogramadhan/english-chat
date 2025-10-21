# English Chat - Online Discussion Platform

Platform diskusi online berbasis web untuk pembelajaran bahasa Inggris dengan fitur real-time chat, manajemen grup, dan sistem approval user.

## 🌟 Features

### User Management
- **Multi-role System**: Admin, Dosen (Instructor), Mahasiswa (Student)
- **User Approval Workflow**: Admin approval untuk registrasi user baru
- **Profile Management**: Update profile, change password, upload avatar
- **Admin Dashboard**: Manage users, approve/reject registrations, edit user profiles

### Discussion & Chat
- **Real-time Chat**: Socket.IO untuk komunikasi real-time
- **Group Management**: Dosen dapat membuat dan mengelola grup
- **Discussion Rooms**: Diskusi terorganisir per grup
- **File Uploads**: Support upload gambar dalam chat
- **PDF Export**: Download riwayat diskusi dalam format PDF

### Security
- **JWT Authentication**: Token-based authentication
- **Password Hashing**: bcrypt untuk keamanan password
- **Role-based Access Control**: Akses berbeda untuk setiap role
- **Protected Routes**: Middleware untuk proteksi endpoint

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
- MongoDB (running di host machine)

## 🚀 Quick Start

### Development

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run create-admin
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Admin Login: admin@example.com / admin123

### Production (Docker)

```bash
# Setup environment
cp .env.production .env.production.local
nano .env.production.local

# Deploy
./deploy.sh
```

Lihat [DEPLOYMENT.md](DEPLOYMENT.md) untuk panduan lengkap.

## 📁 Project Structure

```
english-chat/
├── backend/          # Express server, API, Socket.IO
├── frontend/         # React + Vite application
├── docker-compose.yml
├── deploy.sh        # Deployment script
└── DEPLOYMENT.md    # Deployment guide
```

## 🔑 Default Credentials

**Admin:** admin@example.com / admin123

⚠️ Ganti password setelah login pertama!

## 📖 Documentation

- [Admin Guide](ADMIN_GUIDE.md) - Panduan administrator
- [Deployment Guide](DEPLOYMENT.md) - Panduan deployment production
- [Data Persistence](DATA_PERSISTENCE.md) - Panduan backup & data safety

## 🔧 Scripts

**Backend:**
- `npm start` - Production server
- `npm run dev` - Development server
- `npm run create-admin` - Create admin
- `npm run reset-admin` - Reset admin credentials

**Frontend:**
- `npm run dev` - Development server
- `npm run build` - Production build

## 🌐 Key API Endpoints

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/users/me` - Get profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/admin/users/:id` - Admin edit user
- `GET /api/discussions` - Get discussions
- Real-time via Socket.IO

## 🐛 Troubleshooting

**MongoDB tidak running:**
```bash
sudo systemctl start mongod
```

**Port sudah digunakan:**
```bash
lsof -ti:5000
kill -9 <PID>
```

**Reset admin password:**
```bash
cd backend
npm run reset-admin
```

## 📊 Roadmap

- [x] Authentication & authorization
- [x] Real-time chat
- [x] File upload & PDF export
- [x] Profile management
- [x] Admin edit users
- [x] Docker deployment
- [ ] Email notifications
- [ ] Search & analytics

## 📄 License

ISC License

## 👥 Author

Rizko - Initial development
