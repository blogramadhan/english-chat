# Data Persistence Guide

Complete guide on how THYNK application data remains safe and persistent during deployment.

## 📦 Persisted Data

### 1. **MongoDB Database**
- **Location**: Local MongoDB on host machine
- **Path**: Default `mongodb://localhost:27017/thynk`
- **Persistence**: ✅ **ALWAYS PERSISTENT**
- **Reason**: MongoDB runs on host, NOT in container

### 2. **Uploads Folder**
- **Location**: `./backend/uploads/`
- **Mount**: Bind mount from host to container
- **Persistence**: ✅ **ALWAYS PERSISTENT**
- **Reason**: Uses volume binding to host folder

### 3. **Backups Folder**
- **Location**: `./backups/`
- **Persistence**: ✅ **ALWAYS PERSISTENT**
- **Reason**: Folder on host machine, outside container

### 4. **Environment Config**
- **Location**: `.env.production.local`
- **Persistence**: ✅ **ALWAYS PERSISTENT**
- **Reason**: File on host machine

---

## 🔄 What Happens During Deploy/Update?

### Option 1: Deploy (Build and Start)
```bash
./deploy.sh → Option 1
```

**What happens:**
1. ❌ Stop containers (only containers, not data)
2. ❌ Remove old containers
3. ✅ Build new images
4. ✅ Create new containers
5. ✅ Mount existing volumes

**Data Status:**
- ✅ MongoDB: SAFE (untouched)
- ✅ Uploads: SAFE (remains in ./backend/uploads)
- ✅ Backups: SAFE (remains in ./backups)
- ✅ Env Config: SAFE

### Option 2: Update from GitHub
```bash
./deploy.sh → Option 2
```

**What happens:**
1. ✅ **AUTO BACKUP** database & files
2. ✅ Stash local changes
3. ✅ Pull latest code
4. ❌ Stop containers
5. ❌ Remove old containers
6. ✅ Build new images with updated code
7. ✅ Create new containers
8. ✅ Mount existing volumes

**Data Status:**
- ✅ MongoDB: SAFE + BACKED UP
- ✅ Uploads: SAFE + BACKED UP
- ✅ Backups: INCREASED (new backup created)
- ✅ Env Config: SAFE

### Option 3: Stop Containers
```bash
./deploy.sh → Option 3
```

**What happens:**
1. ❌ Stop containers
2. ❌ Remove containers

**Data Status:**
- ✅ MongoDB: SAFE
- ✅ Uploads: SAFE
- ✅ Backups: SAFE
- ✅ Env Config: SAFE

### Option 8: Remove Containers and Images
```bash
./deploy.sh → Option 8
```

**What happens:**
1. ❌ Stop containers
2. ❌ Remove containers
3. ❌ Remove Docker images

**Data Status:**
- ✅ MongoDB: SAFE
- ✅ Uploads: SAFE
- ✅ Backups: SAFE
- ✅ Env Config: SAFE

---

## 🛡️ Data Protection

### 1. Bind Mount (Not Using Named Volumes)

**Docker Compose Config:**
```yaml
volumes:
  - ./backend/uploads:/app/uploads  # Bind mount to host folder
```

**Benefits:**
- ✅ Data remains on host machine
- ✅ Easy to backup (regular folder)
- ✅ Can be accessed directly from host
- ✅ Not lost on `docker-compose down`

**Difference from Named Volumes:**
```yaml
# Named volume (NOT used)
volumes:
  - uploads_data:/app/uploads  # Volume managed by Docker

# Issues with named volumes:
# - Can be deleted with docker-compose down -v
# - Hard to access from host
# - Requires docker volume commands
```

### 2. MongoDB on Host Machine

MongoDB runs on **host machine**, NOT in Docker container.

**Reasons:**
- ✅ Existing database continues to be used
- ✅ No need for data migration
- ✅ Better performance
- ✅ Easier backup
- ✅ Not dependent on Docker lifecycle

**Access from Container:**
```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

Container accesses MongoDB on host via `host.docker.internal`.

---

## ⚠️ When Can Data Be Lost?

### Scenarios Where Data is SAFE ✅

1. `docker-compose down` ✅
2. `docker-compose down --remove-orphans` ✅
3. `docker-compose restart` ✅
4. Rebuild images ✅
5. Update application ✅
6. Server reboot ✅

### Scenarios Where Data is at RISK ⚠️

1. `docker-compose down -v` or `--volumes` ❌
   - Flag `-v` will **REMOVE VOLUMES**
   - **SOLUTION**: Script does NOT use `-v` flag

2. `rm -rf backend/uploads` ❌
   - Manual delete folder
   - **SOLUTION**: Don't delete manually, use backup script

3. `rm -rf backups` ❌
   - Manual delete backups
   - **SOLUTION**: Backups auto-cleanup (keep last 7)

4. MongoDB crash without backup ❌
   - **SOLUTION**: Use regular backups (cron job)

---

## 🔍 Verify Data Persistence

### Check Uploads Folder

```bash
# View uploads contents
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
use thynk

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
│  │ - thynk DB               │          │
│  └──────────────────────────┘          │
│          ↑                              │
│          └─── host.docker.internal      │
└──────────────────────────────────────────┘
```

---

## ✅ Best Practices

### 1. Regular Backups

Setup cron job for automatic backups:

```bash
# Daily backup at 2 AM
0 2 * * * cd /path/to/english-chat && ./backup.sh >> /var/log/backup.log 2>&1
```

### 2. Verify Backups

After backup, verify:

```bash
# Check backup exists
ls -lh backups/$(ls -t backups/ | head -1)

# Test restore (in staging/test environment)
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

Periodically test restore in test environment:

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

**If uploads deleted:**

```bash
./deploy.sh → Option 7
# Select latest backup
# Uploads will be restored
```

**If MongoDB corrupt:**

```bash
# Stop application
./deploy.sh → Option 3

# Restore database
./restore.sh <timestamp>

# Restart application
./deploy.sh → Option 4
```

### Scenario 2: Problematic Update

```bash
# Application error after update
./deploy.sh → Option 7
# Select backup before update
# System returns to previous state

# Or manually:
git log --oneline -10
git reset --hard <commit-before-update>
./deploy.sh → Option 1
```

### Scenario 3: Total Server Failure

**Offsite backup:**

```bash
# Periodic backup to remote server
rsync -avz backups/ user@backup-server:/backups/thynk/

# Or upload to cloud storage
rclone sync backups/ gdrive:thynk-backups/
```

**Restore on new server:**

```bash
# 1. Setup new server
# 2. Install Docker, MongoDB
# 3. Clone repository
# 4. Copy backups from offsite
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

**Conclusion:**
- ✅ All user data is SAFE and PERSISTENT
- ✅ Deploy/update does NOT delete data
- ✅ Auto backup before update
- ✅ Easy rollback if issues occur
