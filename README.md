# Online Discussion App

Aplikasi diskusi online berbasis web untuk dosen dan mahasiswa dengan fitur real-time chat.

## Fitur Utama

### Untuk Dosen
- Membuat dan mengelola grup mahasiswa
- Membuat topik diskusi/pertanyaan untuk grup
- Melihat diskusi aktif dan histori percakapan
- Mengelola anggota grup

### Untuk Mahasiswa
- Bergabung dalam grup yang dibuat dosen
- Berpartisipasi dalam diskusi real-time
- Mengirim pesan teks, emoji, dan file
- Melihat semua diskusi yang tersedia dalam grup

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

## Struktur Database

### Collections

1. **users** - Data pengguna (dosen dan mahasiswa)
   - name, email, password, role, nim/nip, avatar

2. **groups** - Grup mahasiswa yang dibuat dosen
   - name, description, createdBy, members, isActive

3. **discussions** - Topik diskusi/pertanyaan
   - title, content, createdBy, group, isActive, tags

4. **messages** - Pesan dalam diskusi
   - discussion, sender, content, messageType, fileUrl, fileName

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user

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

### Sebagai Dosen

1. Register dengan role "Dosen"
2. Login ke dashboard dosen
3. Buat grup mahasiswa dan tambahkan anggota
4. Buat topik diskusi/pertanyaan untuk grup tertentu
5. Monitor dan berpartisipasi dalam diskusi

### Sebagai Mahasiswa

1. Register dengan role "Mahasiswa"
2. Login ke dashboard mahasiswa
3. Lihat grup yang Anda ikuti
4. Buka diskusi yang tersedia
5. Berpartisipasi dalam diskusi dengan mengirim pesan, emoji, atau file

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
