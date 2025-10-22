# Deployment Guide - THYNK Platform

Complete guide for deploying the THYNK application using Docker on production server.

## 📋 Prerequisites

Before deployment, ensure your server has:

1. **Docker** (version 20.10 or newer)
   ```bash
   docker --version
   ```

2. **Docker Compose** (version 2.0 or newer)
   ```bash
   docker-compose --version
   # or
   docker compose version
   ```

3. **MongoDB Atlas Account** (Recommended - Free tier available)
   - Setup MongoDB Atlas: See [MONGODB_ATLAS_SETUP.md](MONGODB_ATLAS_SETUP.md)
   - Alternative: Local MongoDB on server

4. **Git** (to clone repository)
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

Copy the production environment file and adjust:

```bash
cp .env.production .env.production.local
```

Edit the `.env.production.local` file:

```bash
nano .env.production.local
```

**Configuration for MongoDB Atlas (Recommended):**

```env
# MongoDB Connection - MongoDB Atlas (cloud.mongodb.com)
# Get from: https://cloud.mongodb.com → Connect → Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/thynk?retryWrites=true&w=majority

# JWT Secret - generate secure random string
# Use: openssl rand -base64 32
JWT_SECRET=generate-random-secret-key-here-min-32-chars

# Client URL - adjust to your production domain
CLIENT_URL=http://your-domain.com

# API URL for frontend - adjust to your production domain
VITE_API_URL=http://your-domain.com:5000
```

**Note:**
- Setup MongoDB Atlas: See [MONGODB_ATLAS_SETUP.md](MONGODB_ATLAS_SETUP.md)
- Free tier available: 512MB storage
- Auto backups, monitoring, and scaling
- Access from anywhere (not dependent on local server)

**Alternative - Local MongoDB:**

```env
# If using local MongoDB on server
MONGODB_URI=mongodb://localhost:27017/thynk

# Or from Docker container (uncomment extra_hosts in docker-compose.yml):
# MONGODB_URI=mongodb://host.docker.internal:27017/thynk
```

### 3. Deploy Application

Run the deployment script:

```bash
./deploy.sh
```

Select option **1** to deploy (build and start containers).

The script will:
1. ✓ Load environment variables
2. ✓ Stop existing containers (if any)
3. ✓ Build Docker images for backend and frontend
4. ✓ Start containers
5. ✓ Display application URL

## 📦 Deployment Structure

### Docker Containers

After deployment, there will be 2 containers:

1. **english-chat-backend** (Port 5000)
   - Node.js Express server
   - Socket.IO for real-time chat
   - Connection to local MongoDB
   - Volume for uploads

2. **english-chat-frontend** (Port 3000)
   - React + Vite production build
   - Served using `serve`

### Network

- Containers connected via Docker network `english-chat-network`
- Backend can access local MongoDB via `host.docker.internal`
- Frontend communicates with backend via internal Docker network

### Volumes

```yaml
./backend/uploads:/app/uploads
```

The uploads folder is mounted as a volume so that:
- Uploaded files remain persistent
- Not lost on container restart
- Easy to backup

## 🔧 Management Commands

### Deploy / Update Application

```bash
./deploy.sh
# Select option 1
```

### Stop Application

```bash
./deploy.sh
# Select option 2

# or manual:
docker-compose --env-file .env.production.local down
```

### Restart Application

```bash
./deploy.sh
# Select option 3

# or manual:
docker-compose --env-file .env.production.local restart
```

### View Logs

```bash
./deploy.sh
# Select option 4

# or manual:
docker-compose --env-file .env.production.local logs -f

# View logs for specific service:
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Update from GitHub and Redeploy

When there are code fixes on GitHub, use this option to update and redeploy automatically:

```bash
./deploy.sh
# Select option 2
```

**Process that occurs:**
1. ✓ Auto backup database and files before update
2. ✓ Stash local changes (if any)
3. ✓ Pull latest code from GitHub
4. ✓ Rebuild Docker images
5. ✓ Restart containers
6. ✓ Show latest changes

### Backup Database and Files

```bash
./deploy.sh
# Select option 6

# or manual:
./backup.sh
```

**What gets backed up:**
- MongoDB database (compressed .tar.gz)
- Uploads folder (compressed .tar.gz)
- Environment file (.env.production.local)
- Backup manifest

**Backup location:** `./backups/<timestamp>/`

**Auto cleanup:** Only keeps last 7 backups

### Restore from Backup

```bash
./deploy.sh
# Select option 7

# or manual:
./restore.sh <timestamp>
```

**How to restore:**
1. Script will display available backups
2. Select backup by number or timestamp
3. Confirm restore
4. Database and files will be restored

### Remove Containers and Images

```bash
./deploy.sh
# Select option 8
```

### Check Container Status

```bash
docker ps
```

Expected output:
```
CONTAINER ID   IMAGE                    STATUS         PORTS
xxxxx          english-chat_backend     Up 2 minutes   0.0.0.0:5000->5000/tcp
xxxxx          english-chat_frontend    Up 2 minutes   0.0.0.0:3000->3000/tcp
```

## 🌐 Accessing the Application

After successful deployment:

- **Frontend**: `http://your-server-ip:3000`
- **Backend API**: `http://your-server-ip:5000`
- **Socket.IO**: `http://your-server-ip:5000/socket.io`

## 🔒 Production Configuration

### 1. Setup Reverse Proxy (Nginx/Apache)

For production, it's recommended to use a reverse proxy:

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

Use Let's Encrypt for free SSL:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d api.your-domain.com
```

### 3. Update Environment Variables

After setting up domain and SSL, update `.env.production.local`:

```env
CLIENT_URL=https://your-domain.com
VITE_API_URL=https://api.your-domain.com
```

Then rebuild:

```bash
./deploy.sh
# Select option 1
```

## 🔐 Security Checklist

- [ ] Replace `JWT_SECRET` with a strong random string
- [ ] Setup firewall (ufw/iptables)
- [ ] Use HTTPS/SSL
- [ ] Restrict MongoDB access to localhost only
- [ ] Backup database regularly
- [ ] Monitor logs regularly
- [ ] Update Docker images regularly

## 🗃️ Backup & Restore

### Automated Backup (Recommended)

Use the provided backup script:

```bash
# Via deploy menu
./deploy.sh
# Select option 6

# Or directly
./backup.sh
```

**Automatic backup includes:**
- ✅ MongoDB database (compressed)
- ✅ Uploads folder (all user uploaded files)
- ✅ Environment configuration
- ✅ Backup manifest with timestamp
- ✅ Auto cleanup (keep last 7 backups)

**Location:** `./backups/<timestamp>/`

**Example backup structure:**
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
# Select option 7

# Or directly with timestamp
./restore.sh 20250121_143000

# List available backups
ls -lh backups/
```

**Restore process:**
1. Script displays available backups
2. Select desired backup
3. Confirm restore (⚠️ will overwrite current data)
4. Database and files will be restored
5. Current data is backed up first

### Manual Backup (Advanced)

#### MongoDB Manual Backup

```bash
# Backup database
mongodump --db thynk --out /backup/mongodb-$(date +%Y%m%d)

# Backup with compression
mongodump --db thynk --archive=/backup/mongodb-$(date +%Y%m%d).gz --gzip
```

#### MongoDB Manual Restore

```bash
# Restore from backup
mongorestore --db thynk /backup/mongodb-20250101/thynk

# Restore from archive
mongorestore --db thynk --archive=/backup/mongodb-20250101.gz --gzip
```

#### Files Manual Backup

```bash
# Backup uploads folder
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
use thynk
db.stats()

# Check collections
show collections
```

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs

# Check specific service
docker-compose logs backend
docker-compose logs frontend
```

### Backend Can't Connect to MongoDB

1. Ensure MongoDB is running:
   ```bash
   sudo systemctl status mongod
   ```

2. Check MongoDB connection string in `.env.production.local`

3. Ensure MongoDB accepts connections from Docker:
   ```bash
   # Edit MongoDB config
   sudo nano /etc/mongod.conf

   # Ensure bindIp includes 0.0.0.0 or specific IP
   net:
     bindIp: 127.0.0.1,0.0.0.0
   ```

4. Restart MongoDB:
   ```bash
   sudo systemctl restart mongod
   ```

### Port Already in Use

```bash
# Check what's using port 5000 or 3000
sudo lsof -i :5000
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 <PID>
```

### Memory/Disk Full

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

To update application to a new version:

1. Pull latest code:
   ```bash
   git pull origin main
   ```

2. Rebuild and restart:
   ```bash
   ./deploy.sh
   # Select option 1
   ```

## 📝 Notes

- **Local MongoDB**: Application uses existing MongoDB on server, does not create new MongoDB container
- **Persistent Data**: Uploads folder is mounted as volume, so data is not lost on restart
- **Network**: Containers use `host.docker.internal` to access services on host machine
- **Production Ready**: Configuration is ready for production deployment

## 📞 Support

If you have issues or questions, please:
- Check logs: `docker-compose logs -f`
- Review environment variables in `.env.production.local`
- Ensure MongoDB is accessible from Docker containers
