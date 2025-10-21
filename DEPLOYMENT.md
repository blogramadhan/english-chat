# Deployment Guide - English Chat Application

Panduan lengkap untuk deploy aplikasi English Chat menggunakan Docker di server production.

## 📋 Prerequisites

Sebelum melakukan deployment, pastikan server Anda memiliki:

1. **Docker** (versi 20.10 atau lebih baru)
   ```bash
   docker --version
   ```

2. **Docker Compose** (versi 2.0 atau lebih baru)
   ```bash
   docker-compose --version
   # atau
   docker compose version
   ```

3. **MongoDB Atlas Account** (Recommended - Free tier available)
   - Setup MongoDB Atlas: Lihat [MONGODB_ATLAS_SETUP.md](MONGODB_ATLAS_SETUP.md)
   - Alternatif: MongoDB lokal di server

4. **Git** (untuk clone repository)
   ```bash
   git --version
   ```

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <your-repository-url>
cd english-chat
```

### 2. Setup Environment Variables

Copy file environment production dan sesuaikan:

```bash
cp .env.production .env.production.local
```

Edit file `.env.production.local`:

```bash
nano .env.production.local
```

**Konfigurasi untuk MongoDB Atlas (Recommended):**

```env
# MongoDB Connection - MongoDB Atlas (cloud.mongodb.com)
# Get from: https://cloud.mongodb.com → Connect → Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/online-discussion?retryWrites=true&w=majority

# JWT Secret - generate secure random string
# Use: openssl rand -base64 32
JWT_SECRET=generate-random-secret-key-here-min-32-chars

# Client URL - sesuaikan dengan domain production Anda
CLIENT_URL=http://your-domain.com

# API URL for frontend - sesuaikan dengan domain production Anda
VITE_API_URL=http://your-domain.com:5000
```

**Catatan:**
- Setup MongoDB Atlas: Lihat [MONGODB_ATLAS_SETUP.md](MONGODB_ATLAS_SETUP.md)
- Free tier available: 512MB storage
- Auto backups, monitoring, dan scaling
- Akses dari mana saja (tidak tergantung server lokal)

**Alternative - MongoDB Lokal:**

```env
# Jika menggunakan MongoDB lokal di server
MONGODB_URI=mongodb://localhost:27017/online-discussion

# Atau dari container Docker (uncomment extra_hosts di docker-compose.yml):
# MONGODB_URI=mongodb://host.docker.internal:27017/online-discussion
```

### 3. Deploy Aplikasi

Jalankan script deployment:

```bash
./deploy.sh
```

Pilih option **1** untuk deploy (build and start containers).

Script akan:
1. ✓ Load environment variables
2. ✓ Stop existing containers (jika ada)
3. ✓ Build Docker images untuk backend dan frontend
4. ✓ Start containers
5. ✓ Menampilkan URL aplikasi

## 📦 Struktur Deployment

### Docker Containers

Setelah deployment, akan ada 2 containers:

1. **english-chat-backend** (Port 5000)
   - Node.js Express server
   - Socket.IO untuk real-time chat
   - Koneksi ke MongoDB lokal
   - Volume untuk uploads

2. **english-chat-frontend** (Port 3000)
   - React + Vite production build
   - Served menggunakan `serve`

### Network

- Containers terhubung via Docker network `english-chat-network`
- Backend dapat akses MongoDB lokal via `host.docker.internal`
- Frontend berkomunikasi dengan backend via internal Docker network

### Volumes

```yaml
./backend/uploads:/app/uploads
```

Folder uploads di-mount sebagai volume agar:
- Files yang diupload tetap persistent
- Tidak hilang saat restart container
- Bisa di-backup dengan mudah

## 🔧 Management Commands

### Deploy / Update Aplikasi

```bash
./deploy.sh
# Pilih option 1
```

### Stop Aplikasi

```bash
./deploy.sh
# Pilih option 2

# atau manual:
docker-compose --env-file .env.production.local down
```

### Restart Aplikasi

```bash
./deploy.sh
# Pilih option 3

# atau manual:
docker-compose --env-file .env.production.local restart
```

### View Logs

```bash
./deploy.sh
# Pilih option 4

# atau manual:
docker-compose --env-file .env.production.local logs -f

# View logs untuk service tertentu:
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Update from GitHub and Redeploy

Ketika ada perbaikan code di GitHub, gunakan option ini untuk update dan redeploy otomatis:

```bash
./deploy.sh
# Pilih option 2
```

**Proses yang terjadi:**
1. ✓ Auto backup database dan files sebelum update
2. ✓ Stash local changes (jika ada)
3. ✓ Pull latest code dari GitHub
4. ✓ Rebuild Docker images
5. ✓ Restart containers
6. ✓ Show latest changes

### Backup Database dan Files

```bash
./deploy.sh
# Pilih option 6

# atau manual:
./backup.sh
```

**Yang di-backup:**
- MongoDB database (compressed .tar.gz)
- Uploads folder (compressed .tar.gz)
- Environment file (.env.production.local)
- Backup manifest

**Lokasi backup:** `./backups/<timestamp>/`

**Auto cleanup:** Hanya menyimpan 7 backup terakhir

### Restore from Backup

```bash
./deploy.sh
# Pilih option 7

# atau manual:
./restore.sh <timestamp>
```

**Cara restore:**
1. Script akan menampilkan list backup yang tersedia
2. Pilih backup berdasarkan nomor atau timestamp
3. Konfirmasi restore
4. Database dan files akan di-restore

### Remove Containers dan Images

```bash
./deploy.sh
# Pilih option 8
```

### Check Status Containers

```bash
docker ps
```

Output expected:
```
CONTAINER ID   IMAGE                    STATUS         PORTS
xxxxx          english-chat_backend     Up 2 minutes   0.0.0.0:5000->5000/tcp
xxxxx          english-chat_frontend    Up 2 minutes   0.0.0.0:3000->3000/tcp
```

## 🌐 Accessing the Application

Setelah deployment berhasil:

- **Frontend**: `http://your-server-ip:3000`
- **Backend API**: `http://your-server-ip:5000`
- **Socket.IO**: `http://your-server-ip:5000/socket.io`

## 🔒 Production Configuration

### 1. Setup Reverse Proxy (Nginx/Apache)

Untuk production, sebaiknya gunakan reverse proxy:

**Nginx Example:**

```nginx
# Frontend
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO support
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 2. Setup SSL/HTTPS

Gunakan Let's Encrypt untuk SSL gratis:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d api.your-domain.com
```

### 3. Update Environment Variables

Setelah setup domain dan SSL, update `.env.production.local`:

```env
CLIENT_URL=https://your-domain.com
VITE_API_URL=https://api.your-domain.com
```

Kemudian rebuild:

```bash
./deploy.sh
# Pilih option 1
```

## 🔐 Security Checklist

- [ ] Ganti `JWT_SECRET` dengan random string yang kuat
- [ ] Setup firewall (ufw/iptables)
- [ ] Gunakan HTTPS/SSL
- [ ] Batasi akses MongoDB hanya dari localhost
- [ ] Backup database secara berkala
- [ ] Monitor logs secara regular
- [ ] Update Docker images secara berkala

## 🗃️ Backup & Restore

### Automated Backup (Recommended)

Gunakan script backup yang sudah disediakan:

```bash
# Via deploy menu
./deploy.sh
# Pilih option 6

# Atau langsung
./backup.sh
```

**Backup otomatis meliputi:**
- ✅ MongoDB database (compressed)
- ✅ Uploads folder (semua file yang diupload user)
- ✅ Environment configuration
- ✅ Backup manifest dengan timestamp
- ✅ Auto cleanup (keep last 7 backups)

**Lokasi:** `./backups/<timestamp>/`

**Contoh struktur backup:**
```
backups/
  └── 20250121_143000/
      ├── mongodb-20250121_143000.tar.gz
      ├── uploads-20250121_143000.tar.gz
      ├── env.production.local.backup
      └── manifest.txt
```

### Restore from Backup

```bash
# Via deploy menu (interactive)
./deploy.sh
# Pilih option 7

# Atau langsung dengan timestamp
./restore.sh 20250121_143000

# List available backups
ls -lh backups/
```

**Proses restore:**
1. Script menampilkan available backups
2. Pilih backup yang diinginkan
3. Konfirmasi restore (⚠️ will overwrite current data)
4. Database dan files akan di-restore
5. Current data di-backup terlebih dahulu

### Manual Backup (Advanced)

#### MongoDB Manual Backup

```bash
# Backup database
mongodump --db online-discussion --out /backup/mongodb-$(date +%Y%m%d)

# Backup dengan kompresi
mongodump --db online-discussion --archive=/backup/mongodb-$(date +%Y%m%d).gz --gzip
```

#### MongoDB Manual Restore

```bash
# Restore dari backup
mongorestore --db online-discussion /backup/mongodb-20250101/online-discussion

# Restore dari archive
mongorestore --db online-discussion --archive=/backup/mongodb-20250101.gz --gzip
```

#### Files Manual Backup

```bash
# Backup folder uploads
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz ./backend/uploads
```

### Backup Schedule (Cron)

Setup automatic daily backup:

```bash
# Edit crontab
crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * cd /path/to/english-chat && ./backup.sh >> /var/log/english-chat-backup.log 2>&1
```

## 📊 Monitoring

### Check Container Health

```bash
# Check if containers are running
docker ps

# Check container resource usage
docker stats

# Check container logs
docker logs english-chat-backend
docker logs english-chat-frontend
```

### MongoDB Health Check

```bash
# Connect to MongoDB
mongosh

# Check database status
use online-discussion
db.stats()

# Check collections
show collections
```

## 🐛 Troubleshooting

### Container tidak bisa start

```bash
# Check logs
docker-compose logs

# Check specific service
docker-compose logs backend
docker-compose logs frontend
```

### Backend tidak bisa connect ke MongoDB

1. Pastikan MongoDB running:
   ```bash
   sudo systemctl status mongod
   ```

2. Check MongoDB connection string di `.env.production.local`

3. Pastikan MongoDB accept connections dari Docker:
   ```bash
   # Edit MongoDB config
   sudo nano /etc/mongod.conf

   # Pastikan bindIp includes 0.0.0.0 atau specific IP
   net:
     bindIp: 127.0.0.1,0.0.0.0
   ```

4. Restart MongoDB:
   ```bash
   sudo systemctl restart mongod
   ```

### Port sudah digunakan

```bash
# Check apa yang menggunakan port 5000 atau 3000
sudo lsof -i :5000
sudo lsof -i :3000

# Kill process jika perlu
sudo kill -9 <PID>
```

### Memory/Disk penuh

```bash
# Check disk space
df -h

# Clean Docker
docker system prune -a
docker volume prune

# Remove old images
docker images
docker rmi <image-id>
```

## 🔄 Update Application

Untuk update aplikasi ke versi baru:

1. Pull latest code:
   ```bash
   git pull origin main
   ```

2. Rebuild dan restart:
   ```bash
   ./deploy.sh
   # Pilih option 1
   ```

## 📝 Notes

- **MongoDB Lokal**: Aplikasi menggunakan MongoDB yang sudah ada di server, tidak membuat container MongoDB baru
- **Persistent Data**: Uploads folder di-mount sebagai volume, jadi data tidak hilang saat restart
- **Network**: Containers menggunakan `host.docker.internal` untuk akses ke services di host machine
- **Production Ready**: Configuration sudah siap untuk production deployment

## 📞 Support

Jika ada masalah atau pertanyaan, silakan:
- Check logs: `docker-compose logs -f`
- Review environment variables di `.env.production.local`
- Pastikan MongoDB accessible dari Docker containers
