# MongoDB Atlas Setup Guide

Panduan lengkap untuk setup MongoDB Atlas (cloud MongoDB) untuk aplikasi English Chat.

## 🌐 Mengapa MongoDB Atlas?

**Keuntungan:**
- ✅ **Free Tier** - 512MB storage gratis
- ✅ **Cloud-based** - Akses dari mana saja
- ✅ **Auto Backup** - Built-in backup & restore
- ✅ **Scalable** - Mudah upgrade saat traffic naik
- ✅ **Secure** - Enkripsi & network isolation
- ✅ **Monitoring** - Built-in metrics & alerts
- ✅ **No Maintenance** - Managed service

## 📋 Step-by-Step Setup

### 1. Buat Akun MongoDB Atlas

1. Buka https://www.mongodb.com/cloud/atlas/register
2. Sign up dengan:
   - Email
   - Google Account
   - GitHub Account
3. Verify email

### 2. Buat Cluster Baru

1. Login ke https://cloud.mongodb.com
2. Klik **"Build a Database"** atau **"Create"**
3. Pilih **"Shared"** (Free Tier)
4. Pilih Cloud Provider & Region:
   - **Provider**: AWS / Google Cloud / Azure (pilih yang terdekat)
   - **Region**: Pilih yang terdekat dengan server Anda
     - Untuk Indonesia: Singapore (AWS ap-southeast-1)
     - Alternatif: Mumbai, Tokyo
5. Cluster Name: `EnglishChat` (atau sesuai keinginan)
6. Klik **"Create Cluster"**

**⏱️ Tunggu 3-5 menit** untuk cluster dibuat.

### 3. Setup Database Access (User)

1. Di sidebar, klik **"Database Access"**
2. Klik **"Add New Database User"**
3. **Authentication Method**: Password
4. **Username**: `englishchat-admin` (atau sesuai keinginan)
5. **Password**:
   - Klik "Autogenerate Secure Password" atau
   - Buat password sendiri (min 8 karakter)
   - **SIMPAN PASSWORD INI!**
6. **Database User Privileges**:
   - Pilih **"Read and write to any database"**
7. Klik **"Add User"**

### 4. Setup Network Access (Whitelist IP)

1. Di sidebar, klik **"Network Access"**
2. Klik **"Add IP Address"**
3. Pilih salah satu:

   **Option A: Allow dari mana saja (Development/Testing)**
   - Klik **"Allow Access from Anywhere"**
   - IP: `0.0.0.0/0`
   - ⚠️ **TIDAK AMAN untuk production!**

   **Option B: Allow IP spesifik (Production - Recommended)**
   - Klik **"Add Current IP Address"** untuk IP Anda saat ini
   - Atau manual tambah IP server production
   - Contoh: `103.123.45.67/32`

4. Description: `Production Server` atau `Development`
5. Klik **"Confirm"**

### 5. Get Connection String

1. Kembali ke **"Database"** (sidebar)
2. Klik **"Connect"** pada cluster Anda
3. Pilih **"Connect your application"**
4. **Driver**: Node.js
5. **Version**: 4.1 or later
6. **Copy connection string**:

```
mongodb+srv://englishchat-admin:<password>@englishchat.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

7. **Replace `<password>`** dengan password user yang dibuat di step 3
8. **Tambahkan database name** setelah `.net/`:

```
mongodb+srv://englishchat-admin:YOUR_PASSWORD@englishchat.xxxxx.mongodb.net/online-discussion?retryWrites=true&w=majority
```

## 🔧 Konfigurasi Aplikasi

### Development (.env)

```bash
cd backend
cp .env.example .env
nano .env
```

Update dengan connection string:

```env
PORT=5000
MONGODB_URI=mongodb+srv://englishchat-admin:YOUR_PASSWORD@englishchat.xxxxx.mongodb.net/online-discussion?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Production (.env.production.local)

```bash
cp .env.production .env.production.local
nano .env.production.local
```

```env
MONGODB_URI=mongodb+srv://englishchat-admin:YOUR_PASSWORD@englishchat.xxxxx.mongodb.net/online-discussion?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=https://your-domain.com
VITE_API_URL=https://api.your-domain.com
```

## ✅ Test Koneksi

### Test di Development

```bash
cd backend
npm install
npm run dev
```

Output yang diharapkan:
```
Server running on port 5000
MongoDB connected successfully  ← HARUS MUNCUL INI
```

### Test di Production (Docker)

```bash
./deploy.sh
# Pilih option 1

# Check logs
docker logs english-chat-backend

# Should see:
# Server running on port 5000
# MongoDB connected successfully
```

## 🗄️ Database Management

### View Database di Atlas

1. Login ke https://cloud.mongodb.com
2. Klik **"Browse Collections"** pada cluster
3. Akan melihat:
   - **online-discussion** database
   - Collections: users, groups, discussions, messages

### Manual Backup (Atlas UI)

1. Sidebar → **"Backups"**
2. Atlas Free Tier: Manual download via mongodump
3. Paid Tier: Automatic cloud backups

### Manual Restore (Atlas UI)

1. Sidebar → **"Backups"**
2. Select backup point
3. Restore to cluster

## 📊 Monitoring

### View Metrics

1. Login ke Atlas
2. Klik cluster name
3. Tab **"Metrics"**
4. Monitor:
   - Operations per second
   - Network traffic
   - Storage size
   - Connections

### Set Alerts

1. Sidebar → **"Alerts"**
2. **"Create Alert"**
3. Kondisi:
   - Disk usage > 80%
   - Connection limit
   - Query performance
4. Notification: Email/SMS/Slack

## 🔒 Security Best Practices

### 1. IP Whitelist

**Production:**
```
# Allow ONLY server IP
103.123.45.67/32  ← IP server production
```

**Development:**
```
# Allow your development machine
Your.IP.Address.Here/32
```

### 2. Strong Password

```bash
# Generate strong password
openssl rand -base64 32
```

### 3. Separate Users

- **Admin**: Full access
- **App**: Read/write specific database
- **Backup**: Read-only

### 4. Enable Authentication

Sudah enabled by default di Atlas.

### 5. Use Connection String dengan Auth

Jangan hardcode password di code:
```javascript
// ❌ BAD
const uri = "mongodb+srv://user:password123@..."

// ✅ GOOD
const uri = process.env.MONGODB_URI
```

## 💾 Backup Strategies

### Option 1: mongodump (Manual)

```bash
# Install MongoDB Database Tools
# https://www.mongodb.com/try/download/database-tools

# Backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/online-discussion" --out=./backup

# Restore
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/" --db=online-discussion ./backup/online-discussion
```

### Option 2: Using Backup Script

Script otomatis sudah mendukung MongoDB Atlas:

```bash
./backup.sh
# Script akan detect Atlas URI dan backup accordingly
```

### Option 3: Atlas Cloud Backups (Paid)

- **M10+ clusters**: Continuous cloud backups
- Point-in-time recovery
- Automated backup schedule
- Restore ke cluster baru

## 🚀 Migration dari Local ke Atlas

### 1. Backup Local Database

```bash
# Backup local MongoDB
mongodump --db online-discussion --out ./local-backup
```

### 2. Restore ke Atlas

```bash
# Restore ke Atlas
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/" --db=online-discussion ./local-backup/online-discussion
```

### 3. Update Connection String

```bash
# Update .env
MONGODB_URI=mongodb+srv://...
```

### 4. Test Connection

```bash
npm run dev
# Check: MongoDB connected successfully
```

### 5. Deploy

```bash
./deploy.sh
# Pilih option 1
```

## 🆘 Troubleshooting

### Error: "Authentication failed"

**Cause:** Password salah atau user tidak ada

**Fix:**
1. Check password di Database Access
2. Reset password jika perlu
3. Update connection string

### Error: "Connection timeout"

**Cause:** IP tidak di-whitelist

**Fix:**
1. Go to Network Access
2. Add IP address server
3. Wait 1-2 menit untuk apply

### Error: "Server selection timeout"

**Cause:**
- Network issue
- Cluster belum ready
- Connection string salah

**Fix:**
1. Check cluster status (green = active)
2. Verify connection string format
3. Check network connectivity

### Error: "Too many connections"

**Cause:** Free tier limit (500 connections)

**Fix:**
1. Close unused connections
2. Use connection pooling (sudah default di Mongoose)
3. Upgrade ke M10+ jika perlu

## 📈 Scaling

### Free Tier (M0)
- ✅ 512MB storage
- ✅ Shared RAM
- ✅ Shared vCPU
- ✅ Perfect untuk development & small apps

### Upgrade Options

**M10 (Dedicated - $57/month):**
- 10GB storage
- 2GB RAM
- Cloud backups
- Better performance

**M20 ($144/month):**
- 20GB storage
- 4GB RAM
- High availability

**Higher tiers:** M30, M40, M50, M60...

## 📝 Summary

| Feature | Free (M0) | Paid (M10+) |
|---------|-----------|-------------|
| Storage | 512MB | 10GB+ |
| Backups | Manual | Automated |
| Performance | Shared | Dedicated |
| High Availability | No | Yes |
| Price | Free | $57+/month |

## 🔗 Useful Links

- **Atlas Dashboard**: https://cloud.mongodb.com
- **Documentation**: https://docs.atlas.mongodb.com
- **Database Tools**: https://www.mongodb.com/try/download/database-tools
- **Pricing**: https://www.mongodb.com/pricing
- **Support**: https://support.mongodb.com

## ✅ Checklist

Setelah setup, verify:

- [ ] Cluster created & active
- [ ] Database user created dengan password
- [ ] IP address whitelisted
- [ ] Connection string obtained
- [ ] .env updated dengan connection string
- [ ] Application connects successfully
- [ ] Data terlihat di Atlas UI
- [ ] Backup strategy determined
