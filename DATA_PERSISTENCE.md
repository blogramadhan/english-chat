# Data Persistence Guide

Panduan lengkap tentang bagaimana data aplikasi English Chat tetap aman dan persistent saat deployment.

## 📦 Data yang Di-Persist

### 1. **MongoDB Database**
- **Lokasi**: MongoDB lokal di host machine
- **Path**: Default `mongodb://localhost:27017/online-discussion`
- **Persistence**: ✅ **ALWAYS PERSISTENT**
- **Alasan**: MongoDB berjalan di host, BUKAN di container

### 2. **Uploads Folder**
- **Lokasi**: `./backend/uploads/`
- **Mount**: Bind mount dari host ke container
- **Persistence**: ✅ **ALWAYS PERSISTENT**
- **Alasan**: Menggunakan volume binding ke folder host

### 3. **Backups Folder**
- **Lokasi**: `./backups/`
- **Persistence**: ✅ **ALWAYS PERSISTENT**
- **Alasan**: Folder di host machine, di luar container

### 4. **Environment Config**
- **Lokasi**: `.env.production.local`
- **Persistence**: ✅ **ALWAYS PERSISTENT**
- **Alasan**: File di host machine

---

## 🔄 Apa yang Terjadi Saat Deploy/Update?

### Option 1: Deploy (Build and Start)
```bash
./deploy.sh → Option 1
```

**Yang terjadi:**
1. ❌ Stop containers (hanya container, bukan data)
2. ❌ Remove old containers
3. ✅ Build new images
4. ✅ Create new containers
5. ✅ Mount existing volumes

**Data Status:**
- ✅ MongoDB: AMAN (tidak tersentuh)
- ✅ Uploads: AMAN (tetap di ./backend/uploads)
- ✅ Backups: AMAN (tetap di ./backups)
- ✅ Env Config: AMAN

### Option 2: Update from GitHub
```bash
./deploy.sh → Option 2
```

**Yang terjadi:**
1. ✅ **AUTO BACKUP** database & files
2. ✅ Stash local changes
3. ✅ Pull latest code
4. ❌ Stop containers
5. ❌ Remove old containers
6. ✅ Build new images with updated code
7. ✅ Create new containers
8. ✅ Mount existing volumes

**Data Status:**
- ✅ MongoDB: AMAN + BACKED UP
- ✅ Uploads: AMAN + BACKED UP
- ✅ Backups: BERTAMBAH (backup baru dibuat)
- ✅ Env Config: AMAN

### Option 3: Stop Containers
```bash
./deploy.sh → Option 3
```

**Yang terjadi:**
1. ❌ Stop containers
2. ❌ Remove containers

**Data Status:**
- ✅ MongoDB: AMAN
- ✅ Uploads: AMAN
- ✅ Backups: AMAN
- ✅ Env Config: AMAN

### Option 8: Remove Containers and Images
```bash
./deploy.sh → Option 8
```

**Yang terjadi:**
1. ❌ Stop containers
2. ❌ Remove containers
3. ❌ Remove Docker images

**Data Status:**
- ✅ MongoDB: AMAN
- ✅ Uploads: AMAN
- ✅ Backups: AMAN
- ✅ Env Config: AMAN

---

## 🛡️ Proteksi Data

### 1. Bind Mount (Tidak Pakai Named Volumes)

**Docker Compose Config:**
```yaml
volumes:
  - ./backend/uploads:/app/uploads  # Bind mount ke folder host
```

**Keuntungan:**
- ✅ Data tetap di host machine
- ✅ Mudah di-backup (folder biasa)
- ✅ Bisa diakses langsung dari host
- ✅ Tidak hilang saat `docker-compose down`

**Beda dengan Named Volumes:**
```yaml
# Named volume (TIDAK digunakan)
volumes:
  - uploads_data:/app/uploads  # Volume managed by Docker

# Masalah named volumes:
# - Bisa terhapus dengan docker-compose down -v
# - Sulit diakses dari host
# - Perlu docker volume commands
```

### 2. MongoDB di Host Machine

MongoDB berjalan di **host machine**, BUKAN di Docker container.

**Alasan:**
- ✅ Database existing tetap digunakan
- ✅ Tidak perlu migrasi data
- ✅ Performance lebih baik
- ✅ Backup lebih mudah
- ✅ Tidak tergantung Docker lifecycle

**Akses dari Container:**
```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

Container mengakses MongoDB di host via `host.docker.internal`.

---

## ⚠️ Kapan Data BISA Hilang?

### Skenario Data AMAN ✅

1. `docker-compose down` ✅
2. `docker-compose down --remove-orphans` ✅
3. `docker-compose restart` ✅
4. Rebuild images ✅
5. Update aplikasi ✅
6. Server reboot ✅

### Skenario Data BAHAYA ⚠️

1. `docker-compose down -v` atau `--volumes` ❌
   - Flag `-v` akan **REMOVE VOLUMES**
   - **SOLUSI**: Script sudah TIDAK menggunakan flag `-v`

2. `rm -rf backend/uploads` ❌
   - Manual delete folder
   - **SOLUSI**: Jangan delete manual, gunakan script backup

3. `rm -rf backups` ❌
   - Manual delete backups
   - **SOLUSI**: Backups auto-cleanup (keep 7 terakhir)

4. MongoDB crash tanpa backup ❌
   - **SOLUSI**: Gunakan backup rutin (cron job)

---

## 🔍 Verifikasi Data Persistence

### Check Uploads Folder

```bash
# Lihat isi uploads
ls -lh backend/uploads/

# Count files
find backend/uploads -type f | wc -l

# Check size
du -sh backend/uploads/
```

### Check Backups

```bash
# List backups
ls -lh backups/

# Check latest backup
ls -lt backups/ | head -n 2

# View backup manifest
cat backups/*/manifest.txt | head -20
```

### Check MongoDB

```bash
# Connect to MongoDB
mongosh

# Use database
use online-discussion

# Check collections
show collections

# Count documents
db.users.countDocuments()
db.discussions.countDocuments()
db.messages.countDocuments()
```

### Check Docker Mounts

```bash
# Inspect backend container
docker inspect english-chat-backend | grep -A 10 Mounts

# Should show:
# "Source": "/path/to/english-chat/backend/uploads"
# "Destination": "/app/uploads"
```

---

## 📊 Data Flow Diagram

```
┌──────────────────────────────────────────┐
│          Server (Host Machine)           │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Docker Containers                 │ │
│  │                                    │ │
│  │  ┌──────────┐    ┌──────────┐    │ │
│  │  │ Frontend │    │ Backend  │    │ │
│  │  │          │    │          │    │ │
│  │  └──────────┘    └────┬─────┘    │ │
│  │                       │           │ │
│  └───────────────────────┼───────────┘ │
│                          │              │
│         Mount Volume ←───┘              │
│                ↓                        │
│  ┌──────────────────────────┐          │
│  │ backend/uploads/         │ ← PERSIST│
│  │ - avatar-xxx.png         │          │
│  │ - image-xxx.jpg          │          │
│  └──────────────────────────┘          │
│                                         │
│  ┌──────────────────────────┐          │
│  │ backups/                 │ ← PERSIST│
│  │ - 20250121_143000/       │          │
│  │ - 20250121_100000/       │          │
│  └──────────────────────────┘          │
│                                         │
│  ┌──────────────────────────┐          │
│  │ MongoDB (Port 27017)     │ ← PERSIST│
│  │ - online-discussion DB   │          │
│  └──────────────────────────┘          │
│          ↑                              │
│          └─── host.docker.internal      │
└──────────────────────────────────────────┘
```

---

## ✅ Best Practices

### 1. Regular Backups

Setup cron job untuk backup otomatis:

```bash
# Daily backup at 2 AM
0 2 * * * cd /path/to/english-chat && ./backup.sh >> /var/log/backup.log 2>&1
```

### 2. Verify Backups

Setelah backup, verify:

```bash
# Check backup exists
ls -lh backups/$(ls -t backups/ | head -1)

# Test restore (di staging/test environment)
./restore.sh <timestamp>
```

### 3. Monitor Disk Space

```bash
# Check uploads folder size
du -sh backend/uploads/

# Check backups folder size
du -sh backups/

# Check available disk space
df -h
```

### 4. Backup Before Major Updates

```bash
# Manual backup before risky operations
./backup.sh

# Then proceed with update
./deploy.sh → Option 2
```

### 5. Test Disaster Recovery

Periodic test restore di test environment:

```bash
# 1. List backups
ls -lh backups/

# 2. Restore to test environment
./restore.sh <timestamp>

# 3. Verify data integrity
mongosh
# Check collections and data
```

---

## 🆘 Disaster Recovery

### Scenario 1: Accidental Data Loss

**Jika uploads terhapus:**

```bash
./deploy.sh → Option 7
# Pilih backup terakhir
# Uploads akan di-restore
```

**Jika MongoDB corrupt:**

```bash
# Stop aplikasi
./deploy.sh → Option 3

# Restore database
./restore.sh <timestamp>

# Restart aplikasi
./deploy.sh → Option 4
```

### Scenario 2: Update Bermasalah

```bash
# Aplikasi error setelah update
./deploy.sh → Option 7
# Pilih backup sebelum update
# System kembali ke state sebelumnya

# Atau manual:
git log --oneline -10
git reset --hard <commit-before-update>
./deploy.sh → Option 1
```

### Scenario 3: Total Server Failure

**Backup offsite:**

```bash
# Periodic backup ke remote server
rsync -avz backups/ user@backup-server:/backups/english-chat/

# Atau upload ke cloud storage
rclone sync backups/ gdrive:english-chat-backups/
```

**Restore di server baru:**

```bash
# 1. Setup server baru
# 2. Install Docker, MongoDB
# 3. Clone repository
# 4. Copy backups dari offsite
# 5. Restore
./restore.sh <timestamp>

# 6. Deploy
./deploy.sh → Option 1
```

---

## 📝 Summary

| Data Type | Location | Persistence | Backup | Safe on Deploy |
|-----------|----------|-------------|--------|----------------|
| MongoDB | Host machine | ✅ Always | ✅ Auto | ✅ Yes |
| Uploads | ./backend/uploads | ✅ Always | ✅ Auto | ✅ Yes |
| Backups | ./backups | ✅ Always | N/A | ✅ Yes |
| Env Config | .env.production.local | ✅ Always | ✅ Auto | ✅ Yes |
| Docker Images | Docker | ❌ Rebuild | N/A | ❌ Recreated |
| Containers | Docker | ❌ Recreated | N/A | ❌ Recreated |

**Kesimpulan:**
- ✅ Semua data user AMAN dan PERSISTENT
- ✅ Deploy/update TIDAK menghapus data
- ✅ Auto backup sebelum update
- ✅ Easy rollback jika ada masalah
