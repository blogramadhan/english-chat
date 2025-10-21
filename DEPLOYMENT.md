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

3. **MongoDB** yang sudah berjalan di server lokal
   - Pastikan MongoDB running dan accessible
   - Default: `mongodb://localhost:27017`

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

**Konfigurasi untuk MongoDB Lokal:**

```env
# MongoDB Connection - menggunakan MongoDB lokal yang sudah ada
MONGODB_URI=mongodb://host.docker.internal:27017/online-discussion

# JWT Secret - ganti dengan random string yang aman
JWT_SECRET=generate-random-secret-key-here-min-32-chars

# Client URL - sesuaikan dengan domain production Anda
CLIENT_URL=http://your-domain.com

# API URL for frontend - sesuaikan dengan domain production Anda
VITE_API_URL=http://your-domain.com:5000
```

**Catatan Penting:**
- `host.docker.internal` adalah special DNS name yang mengarah ke host machine dari dalam Docker container
- MongoDB lokal yang sudah ada di server akan tetap digunakan (tidak perlu container MongoDB baru)
- Database existing Anda akan tetap aman dan tidak berubah

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

### Remove Containers dan Images

```bash
./deploy.sh
# Pilih option 5
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

## 🗃️ Database Backup

### Backup MongoDB

```bash
# Backup database
mongodump --db online-discussion --out /backup/mongodb-$(date +%Y%m%d)

# Backup dengan kompresi
mongodump --db online-discussion --archive=/backup/mongodb-$(date +%Y%m%d).gz --gzip
```

### Restore MongoDB

```bash
# Restore dari backup
mongorestore --db online-discussion /backup/mongodb-20250101/online-discussion

# Restore dari archive
mongorestore --db online-discussion --archive=/backup/mongodb-20250101.gz --gzip
```

### Backup Files (Uploads)

```bash
# Backup folder uploads
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz ./backend/uploads
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
