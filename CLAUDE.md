# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HIFELLA - Interactive English Learning Platform. A full-stack web discussion platform for English language learning with real-time chat, group management, academic affiliation system, and automated user approval workflow.

## Tech Stack

- **Backend:** Node.js 20, Express.js 4.18, MongoDB (Mongoose), Socket.IO 4.6, JWT auth, Resend (email)
- **Frontend:** React 18, Vite, Chakra UI 2.8, Socket.IO Client, Axios, React Router DOM 6, Framer Motion
- **Deployment:** Docker + Docker Compose, Caddy reverse proxy, Alpine Linux images

## Development Commands

### Backend (from `backend/`)
```bash
npm install           # Install dependencies
npm run dev           # Start dev server with nodemon (port 5000)
npm start             # Production server
npm run create-admin  # Create admin user
npm run seed          # Seed database
npm run reset-db      # Reset database
npm run reset-admin   # Reset admin user
```

### Frontend (from `frontend/`)
```bash
npm install           # Install dependencies
npm run dev           # Vite dev server (port 3000, proxies /api to :5000)
npm run build         # Production build to dist/
npm run preview       # Preview production build
```

### Deployment (from root)
```bash
./deploy.sh           # Full Docker deployment (interactive menu)
./backup.sh           # Backup uploads + MongoDB (via --uri, requires mongodump installed)
./restore.sh          # Restore uploads; auto-skips MongoDB if MONGODB_URI is Atlas (mongodb+srv)
```

## Architecture

### Backend Structure (`backend/`)
- `server.js` — Entry point: Express setup, MongoDB connection, Socket.IO events, route mounting, CORS config
- `middleware/auth.js` — JWT verification + role-based guards (`protect`, `isAdmin`, `isDosen`, `isMahasiswa`)
- `middleware/upload.js` — Multer file upload configuration
- `models/` — Mongoose schemas: User, Discussion, Message, Group, Category, University, Faculty, Program, Notification
- `routes/` — Express routers: auth, admin, users, groups, categories, discussions, messages, notifications, universities, faculties, programs
- `services/emailService.js` — Resend email templates (registration, profile update, password reset)
- `scripts/` — Database utilities (create admin, seed, reset, migration scripts)
- `uploads/` — File storage for avatars and documents

### Frontend Structure (`frontend/src/`)
- `App.jsx` — React Router configuration with role-based routes
- `context/AuthContext.jsx` — Auth state management (login, logout, token handling)
- `utils/api.js` — Axios instance with base URL and auth token interceptor
- `utils/avatar.js` — Avatar URL utilities
- `components/` — Reusable UI: Navbar, ChatBox, MessageInput, modals (discussion, group, category, collaborators, export PDF, university/faculty/program management)
- `pages/` — Route pages: Login, Register, ForgotPassword, ResetPassword, Profile, AdminDashboard, DosenDashboard, MahasiswaDashboard, Discussion

### Vite Config
- Dev server on port 3000 with proxy: `/api` → `http://localhost:5000`
- Production build uses Terser minification with vendor chunk splitting (react, chakra, socket.io)

## Key Patterns

### User Roles & Auth Flow
- Three roles: `admin`, `dosen` (lecturer), `mahasiswa` (student)
- New users register with `status: 'pending'`, admin must approve before login works
- JWT tokens (7-day expiry) stored in localStorage, auto-attached via axios interceptor
- Role middleware guards routes: `auth.protect` + `auth.isAdmin` / `auth.isDosen` / `auth.isMahasiswa`

### Group Ownership
Groups are created and managed exclusively by `dosen`. `mahasiswa` can only read/join groups. `admin` manages users and academic hierarchy but does not own groups.

### Academic Hierarchy
University → Faculty → Program (cascading relationships with cascading deletes)

### Real-time Messaging
Socket.IO rooms per discussion. Events: `join-discussion`, `send-message`, `delete-message`, `typing` / `user-typing`

### API Base Path
All backend routes mounted under `/api` (e.g., `/api/auth/login`, `/api/discussions`, `/api/messages`)

### Frontend HTTP Client
Use the custom `api` utility (`frontend/src/utils/api.js`) for all API calls — never use axios directly. It auto-configures base URL from `VITE_API_URL` and attaches auth tokens.

## Environment Variables

### Backend (.env)
`PORT`, `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV`, `CLIENT_URL`, `RESEND_API`

### Frontend (build-time via Vite)
`VITE_API_URL` (API server URL), `VITE_SOCKET_URL` (Socket.IO server URL)

### Backup & Server Migration
- `backup.sh` backs up: uploaded files (`backend/uploads/`) + MongoDB dump (uses `--uri` to connect to Atlas)
- `restore.sh` auto-detects Atlas via `mongodb+srv` in `MONGODB_URI` — if Atlas, skips MongoDB restore (data stays in cloud) and only restores uploads
- When migrating servers: copy backup folder, clone repo, set `.env.production.local` with the same `MONGODB_URI`, run `restore.sh`, then `deploy.sh`
- `mongodump`/`mongorestore` must be installed on the server: `sudo apt install mongodb-database-tools`

## No Test Suite
This project currently has no test framework configured. There is no lint or format command.
