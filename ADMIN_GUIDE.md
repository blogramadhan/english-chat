# Admin Guide - Online Discussion App

## Membuat Akun Admin

### Langkah 1: Setup Database
Pastikan MongoDB sudah running dan backend server sudah dijalankan minimal sekali untuk membuat koneksi database.

### Langkah 2: Jalankan Script Create Admin
```bash
cd backend
npm run create-admin
```

Output yang diharapkan:
```
MongoDB connected
Admin user created successfully!
Email: admin@example.com
Password: admin123

IMPORTANT: Please change the admin password after first login!
```

### Langkah 3: Login sebagai Admin
1. Buka browser dan akses `http://localhost:3000/login`
2. Login dengan kredensial:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Anda akan otomatis diarahkan ke `/admin/dashboard`

## Fitur Admin Dashboard

### 1. Statistics Overview
Dashboard menampilkan statistik:
- **Total Users**: Jumlah total dosen dan mahasiswa
- **Pending Approval**: User yang menunggu persetujuan
- **Approved Users**: User yang sudah disetujui
- **Total Dosen**: Jumlah dosen aktif
- **Total Mahasiswa**: Jumlah mahasiswa aktif

### 2. Pending Approval Tab
Menampilkan daftar user yang menunggu approval dengan informasi:
- Nama
- Email
- Role (Dosen/Mahasiswa)
- NIM/NIP
- Tanggal registrasi
- Aksi:
  - ✓ (Approve) - Setujui user
  - ✗ (Reject) - Tolak user

### 3. All Users Tab
Menampilkan semua user dengan informasi:
- Nama
- Email
- Role
- Status (Pending/Approved/Rejected)
- NIM/NIP
- Tanggal registrasi
- Aksi:
  - ✓ (Approve) - untuk user pending
  - ✗ (Reject) - untuk user pending
  - 🗑️ (Delete) - hapus user (kecuali admin)

## Flow Approval

### User Register
1. User (dosen/mahasiswa) melakukan registrasi
2. Akun dibuat dengan `status: "pending"`
3. User tidak mendapat token dan tidak bisa login
4. User mendapat notifikasi untuk menunggu approval

### Admin Approve
1. Admin login ke dashboard
2. Admin melihat pending users di tab "Pending Approval"
3. Admin klik tombol ✓ (Approve)
4. Status user berubah menjadi `"approved"`
5. Field `approvedBy` dan `approvedAt` terisi
6. User sekarang bisa login

### Admin Reject
1. Admin klik tombol ✗ (Reject)
2. Status user berubah menjadi `"rejected"`
3. User tidak bisa login dan mendapat pesan error

### User Login
1. User yang sudah approved bisa login normal
2. User yang masih pending mendapat error 403 dengan pesan:
   - "Your account is pending approval. Please wait for admin approval."
3. User yang di-reject mendapat error 403 dengan pesan:
   - "Your account has been rejected. Please contact admin."

## API Endpoints untuk Admin

### Get Statistics
```http
GET /api/admin/stats
Authorization: Bearer {admin_token}
```

Response:
```json
{
  "totalUsers": 10,
  "pendingUsers": 3,
  "approvedUsers": 7,
  "rejectedUsers": 0,
  "totalDosen": 2,
  "totalMahasiswa": 5
}
```

### Get Pending Users
```http
GET /api/admin/users/pending
Authorization: Bearer {admin_token}
```

### Get All Users (dengan filter)
```http
GET /api/admin/users?status=pending&role=dosen
Authorization: Bearer {admin_token}
```

Query parameters:
- `status`: pending | approved | rejected
- `role`: admin | dosen | mahasiswa

### Approve User
```http
PUT /api/admin/users/{userId}/approve
Authorization: Bearer {admin_token}
```

### Reject User
```http
PUT /api/admin/users/{userId}/reject
Authorization: Bearer {admin_token}
```

### Delete User
```http
DELETE /api/admin/users/{userId}
Authorization: Bearer {admin_token}
```

## Security Notes

1. **Ganti Password Admin**: Segera ganti password default `admin123` setelah login pertama
2. **Protect Admin Routes**: Semua admin endpoints sudah dilindungi middleware `protect` dan `isAdmin`
3. **Admin Cannot Be Deleted**: Admin user tidak bisa dihapus melalui API
4. **Admin Auto-Approved**: Akun admin otomatis approved dan tidak perlu approval

## Troubleshooting

### Admin sudah ada
Jika menjalankan `npm run create-admin` dan admin sudah ada:
```
Admin user already exists!
Email: admin@example.com
```

### Lupa Password Admin
Karena password di-hash, Anda perlu:
1. Hapus admin dari database MongoDB
2. Jalankan ulang `npm run create-admin`

Atau update manual di MongoDB:
```javascript
// Di MongoDB shell atau Compass
use online-discussion
db.users.updateOne(
  { email: "admin@example.com" },
  {
    $set: {
      password: "$2a$10$..." // hash dari password baru
    }
  }
)
```

### User tidak bisa login setelah di-approve
1. Cek status user di database: `status: "approved"`
2. Clear localStorage di browser
3. Login ulang

### Error "Access denied. Admin only"
Pastikan:
1. Token admin valid dan tidak expired
2. User yang login memiliki `role: "admin"`
3. Header Authorization sudah benar: `Bearer {token}`
