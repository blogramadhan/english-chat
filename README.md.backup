# Online Discussion App

Aplikasi diskusi online berbasis web untuk dosen dan mahasiswa dengan fitur real-time chat.

## Fitur Utama

### Untuk Admin
- Approve/reject pendaftaran user baru (dosen & mahasiswa)
- Melihat statistik pengguna (total, pending, approved, rejected)
- Mengelola semua user (view, approve, reject, delete)
- Dashboard dengan overview sistem

### Untuk Dosen
- Membuat dan mengelola grup mahasiswa
- Membuat topik diskusi/pertanyaan untuk grup
- Melihat diskusi aktif dan histori percakapan
- Mengelola anggota grup
- **Catatan**: Akun dosen perlu di-approve admin terlebih dahulu

### Untuk Mahasiswa
- Bergabung dalam grup yang dibuat dosen
- Berpartisipasi dalam diskusi real-time
- Mengirim pesan teks, emoji, dan file
- Melihat semua diskusi yang tersedia dalam grup
- **Catatan**: Akun mahasiswa perlu di-approve admin terlebih dahulu

## Tech Stack

### Backend
- **Express.js** - Node.js web framework
- **MongoDB** dengan Mongoose - Database
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **Chakra UI** - Component library
- **Vite** - Build tool
- **Socket.io-client** - Real-time communication
- **Axios** - HTTP client
- **React Router** - Routing
- **Emoji Picker React** - Emoji selector

## Instalasi

### Prerequisites
- Node.js (v16 atau lebih tinggi)
- MongoDB (local atau cloud)
- npm atau yarn

### Setup Backend

1. Masuk ke folder backend:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Copy file `.env.example` menjadi `.env` dan sesuaikan konfigurasi:
```bash
cp .env.example .env
```

4. Edit file `.env` dan sesuaikan dengan konfigurasi Anda:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/online-discussion
JWT_SECRET=your_secret_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

5. Jalankan server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server akan berjalan di `http://localhost:5000`

### Setup Frontend

1. Masuk ke folder frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Jalankan development server:
```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

### Membuat Akun Admin

Setelah backend berjalan, buat akun admin dengan menjalankan script berikut:

```bash
cd backend
npm run create-admin
```

Script ini akan membuat akun admin dengan kredensial:
- **Email**: admin@example.com
- **Password**: admin123

**PENTING**: Segera ganti password admin setelah login pertama kali!

Akun admin dapat login di `http://localhost:3000/login` dan akan diarahkan ke `/admin/dashboard`

## Struktur Database

### Collections

1. **users** - Data pengguna (admin, dosen, dan mahasiswa)
   - name, email, password, role (admin/dosen/mahasiswa), status (pending/approved/rejected)
   - nim/nip, avatar, approvedBy, approvedAt

2. **groups** - Grup mahasiswa yang dibuat dosen
   - name, description, createdBy, members, isActive

3. **discussions** - Topik diskusi/pertanyaan
   - title, content, createdBy, group, isActive, tags

4. **messages** - Pesan dalam diskusi
   - discussion, sender, content, messageType, fileUrl, fileName

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru (status: pending)
- `POST /api/auth/login` - Login user (cek approval status)

### Admin (Admin only)
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users/pending` - Get pending users
- `GET /api/admin/users` - Get all users (dengan filter)
- `PUT /api/admin/users/:id/approve` - Approve user
- `PUT /api/admin/users/:id/reject` - Reject user
- `DELETE /api/admin/users/:id` - Delete user

### Users
- `GET /api/users/me` - Get profile user saat ini
- `GET /api/users` - Get semua users
- `GET /api/users/mahasiswa` - Get semua mahasiswa

### Groups (Dosen only)
- `POST /api/groups` - Buat grup baru
- `GET /api/groups` - Get groups
- `GET /api/groups/:id` - Get grup by ID
- `PUT /api/groups/:id` - Update grup
- `DELETE /api/groups/:id` - Delete grup

### Discussions (Dosen only untuk create)
- `POST /api/discussions` - Buat diskusi baru
- `GET /api/discussions` - Get diskusi
- `GET /api/discussions/:id` - Get diskusi by ID
- `PUT /api/discussions/:id` - Update diskusi
- `DELETE /api/discussions/:id` - Delete diskusi

### Messages
- `POST /api/messages` - Kirim pesan
- `POST /api/messages/upload` - Kirim pesan dengan file
- `GET /api/messages/:discussionId` - Get messages untuk diskusi
- `PUT /api/messages/:id` - Edit pesan
- `DELETE /api/messages/:id` - Delete pesan

## Socket.io Events

### Client to Server
- `join-discussion` - Join room diskusi
- `send-message` - Kirim pesan
- `typing` - User sedang mengetik

### Server to Client
- `receive-message` - Menerima pesan baru
- `user-typing` - User lain sedang mengetik

## Cara Penggunaan

### Sebagai Admin

1. Jalankan script `npm run create-admin` untuk membuat akun admin
2. Login dengan kredensial admin (admin@example.com / admin123)
3. Masuk ke Admin Dashboard untuk:
   - Melihat statistik sistem
   - Approve/reject pendaftaran user baru
   - Mengelola semua user
4. Approve akun dosen dan mahasiswa yang mendaftar

### Sebagai Dosen

1. Register dengan role "Dosen"
2. Tunggu approval dari admin
3. Setelah di-approve, login ke dashboard dosen
4. Buat grup mahasiswa dan tambahkan anggota
5. Buat topik diskusi/pertanyaan untuk grup tertentu
6. Monitor dan berpartisipasi dalam diskusi

### Sebagai Mahasiswa

1. Register dengan role "Mahasiswa"
2. Tunggu approval dari admin
3. Setelah di-approve, login ke dashboard mahasiswa
4. Lihat grup yang Anda ikuti
5. Buka diskusi yang tersedia
6. Berpartisipasi dalam diskusi dengan mengirim pesan, emoji, atau file

## File Upload

Aplikasi mendukung upload file dengan tipe:
- Gambar: jpg, jpeg, png, gif
- Dokumen: pdf, doc, docx, txt
- Archive: zip, rar

Maksimal ukuran file: **10MB**

File akan disimpan di folder `backend/uploads/`

## Development

### Backend
```bash
cd backend
npm run dev
```

Server akan restart otomatis dengan nodemon saat ada perubahan code.

### Frontend
```bash
cd frontend
npm run dev
```

Vite akan hot-reload saat ada perubahan code.

## Build untuk Production

### Frontend
```bash
cd frontend
npm run build
```

File hasil build akan ada di folder `frontend/dist/`

### Backend
Set `NODE_ENV=production` di file `.env` dan jalankan:
```bash
cd backend
npm start
```

## Troubleshooting

### MongoDB Connection Error
- Pastikan MongoDB sudah running
- Cek MONGODB_URI di file `.env`

### Socket.io Connection Error
- Pastikan backend server sudah running
- Cek CORS configuration di `server.js`

### File Upload Error
- Pastikan folder `backend/uploads/` ada dan writable
- Cek ukuran file tidak melebihi 10MB

## License

MIT

## Author

Developed for educational purposes
