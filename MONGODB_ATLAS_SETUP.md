# MongoDB Atlas Setup Guide

Complete guide for setting up MongoDB Atlas (cloud MongoDB) for the THYNK application.

## 🌐 Why MongoDB Atlas?

**Benefits:**
- ✅ **Free Tier** - 512MB storage free
- ✅ **Cloud-based** - Access from anywhere
- ✅ **Auto Backup** - Built-in backup & restore
- ✅ **Scalable** - Easy to upgrade when traffic increases
- ✅ **Secure** - Encryption & network isolation
- ✅ **Monitoring** - Built-in metrics & alerts
- ✅ **No Maintenance** - Managed service

## 📋 Step-by-Step Setup

### 1. Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with:
   - Email
   - Google Account
   - GitHub Account
3. Verify email

### 2. Create New Cluster

1. Login to https://cloud.mongodb.com
2. Click **"Build a Database"** or **"Create"**
3. Select **"Shared"** (Free Tier)
4. Choose Cloud Provider & Region:
   - **Provider**: AWS / Google Cloud / Azure (choose the closest)
   - **Region**: Choose closest to your server
     - For Indonesia: Singapore (AWS ap-southeast-1)
     - Alternative: Mumbai, Tokyo
5. Cluster Name: `THYNK` (or as desired)
6. Click **"Create Cluster"**

**⏱️ Wait 3-5 minutes** for cluster to be created.

### 3. Setup Database Access (User)

1. In sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. **Authentication Method**: Password
4. **Username**: `thynk-admin` (or as desired)
5. **Password**:
   - Click "Autogenerate Secure Password" or
   - Create your own password (min 8 characters)
   - **SAVE THIS PASSWORD!**
6. **Database User Privileges**:
   - Select **"Read and write to any database"**
7. Click **"Add User"**

### 4. Setup Network Access (Whitelist IP)

1. In sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. Choose one:

   **Option A: Allow from anywhere (Development/Testing)**
   - Click **"Allow Access from Anywhere"**
   - IP: `0.0.0.0/0`
   - ⚠️ **NOT SECURE for production!**

   **Option B: Allow specific IP (Production - Recommended)**
   - Click **"Add Current IP Address"** for your current IP
   - Or manually add production server IP
   - Example: `103.123.45.67/32`

4. Description: `Production Server` or `Development`
5. Click **"Confirm"**

### 5. Get Connection String

1. Return to **"Database"** (sidebar)
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. **Driver**: Node.js
5. **Version**: 4.1 or later
6. **Copy connection string**:

```
mongodb+srv://thynk-admin:<password>@thynk.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

7. **Replace `<password>`** with the user password created in step 3
8. **Add database name** after `.net/`:

```
mongodb+srv://thynk-admin:YOUR_PASSWORD@thynk.xxxxx.mongodb.net/thynk?retryWrites=true&w=majority
```

## 🔧 Application Configuration

### Development (.env)

```bash
cd backend
cp .env.example .env
nano .env
```

Update with connection string:

```env
PORT=5000
MONGODB_URI=mongodb+srv://thynk-admin:YOUR_PASSWORD@thynk.xxxxx.mongodb.net/thynk?retryWrites=true&w=majority
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
MONGODB_URI=mongodb+srv://thynk-admin:YOUR_PASSWORD@thynk.xxxxx.mongodb.net/thynk?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=https://your-domain.com
VITE_API_URL=https://api.your-domain.com
```

## ✅ Test Connection

### Test in Development

```bash
cd backend
npm install
npm run dev
```

Expected output:
```
Server running on port 5000
MongoDB connected successfully  ← MUST SEE THIS
```

### Test in Production (Docker)

```bash
./deploy.sh
# Select option 1

# Check logs
docker logs english-chat-backend

# Should see:
# Server running on port 5000
# MongoDB connected successfully
```

## 🗄️ Database Management

### View Database in Atlas

1. Login to https://cloud.mongodb.com
2. Click **"Browse Collections"** on cluster
3. Will see:
   - **thynk** database
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

1. Login to Atlas
2. Click cluster name
3. Tab **"Metrics"**
4. Monitor:
   - Operations per second
   - Network traffic
   - Storage size
   - Connections

### Set Alerts

1. Sidebar → **"Alerts"**
2. **"Create Alert"**
3. Conditions:
   - Disk usage > 80%
   - Connection limit
   - Query performance
4. Notification: Email/SMS/Slack

## 🔒 Security Best Practices

### 1. IP Whitelist

**Production:**
```
# Allow ONLY server IP
103.123.45.67/32  ← Production server IP
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

Already enabled by default in Atlas.

### 5. Use Connection String with Auth

Don't hardcode password in code:
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
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/thynk" --out=./backup

# Restore
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/" --db=thynk ./backup/thynk
```

### Option 2: Using Backup Script

The automatic script already supports MongoDB Atlas:

```bash
./backup.sh
# Script will detect Atlas URI and backup accordingly
```

### Option 3: Atlas Cloud Backups (Paid)

- **M10+ clusters**: Continuous cloud backups
- Point-in-time recovery
- Automated backup schedule
- Restore to new cluster

## 🚀 Migration from Local to Atlas

### 1. Backup Local Database

```bash
# Backup local MongoDB
mongodump --db thynk --out ./local-backup
```

### 2. Restore to Atlas

```bash
# Restore to Atlas
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/" --db=thynk ./local-backup/thynk
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
# Select option 1
```

## 🆘 Troubleshooting

### Error: "Authentication failed"

**Cause:** Wrong password or user doesn't exist

**Fix:**
1. Check password in Database Access
2. Reset password if needed
3. Update connection string

### Error: "Connection timeout"

**Cause:** IP not whitelisted

**Fix:**
1. Go to Network Access
2. Add server IP address
3. Wait 1-2 minutes for changes to apply

### Error: "Server selection timeout"

**Cause:**
- Network issue
- Cluster not ready yet
- Wrong connection string

**Fix:**
1. Check cluster status (green = active)
2. Verify connection string format
3. Check network connectivity

### Error: "Too many connections"

**Cause:** Free tier limit (500 connections)

**Fix:**
1. Close unused connections
2. Use connection pooling (already default in Mongoose)
3. Upgrade to M10+ if needed

## 📈 Scaling

### Free Tier (M0)
- ✅ 512MB storage
- ✅ Shared RAM
- ✅ Shared vCPU
- ✅ Perfect for development & small apps

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

After setup, verify:

- [ ] Cluster created & active
- [ ] Database user created with password
- [ ] IP address whitelisted
- [ ] Connection string obtained
- [ ] .env updated with connection string
- [ ] Application connects successfully
- [ ] Data visible in Atlas UI
- [ ] Backup strategy determined
