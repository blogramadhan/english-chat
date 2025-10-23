# Database Reset Guide

Complete guide for resetting all data in the LOOMA application database.

## ⚠️ WARNING

**This operation will permanently delete ALL data including:**
- All user accounts (admin, lecturers, students)
- All groups and their members
- All discussions and messages
- All uploaded files and avatars

**THIS ACTION CANNOT BE UNDONE!**

Only use this in the following scenarios:
- 🧪 Development/Testing: Clean slate for testing
- 🚀 Production Setup: Starting fresh deployment
- 🐛 Database Corruption: Fixing data issues

## 📋 Prerequisites

Before resetting the database:

1. **Backup Important Data** (if needed)
   ```bash
   # Export MongoDB data
   mongodump --uri="mongodb://localhost:27017/thynk" --out=./backup

   # Or for MongoDB Atlas
   mongodump --uri="your-atlas-connection-string" --out=./backup
   ```

2. **Stop Application** (recommended)
   ```bash
   # If running with Docker
   docker-compose down

   # If running manually
   # Stop the backend server (Ctrl+C)
   ```

3. **Backup Uploaded Files** (if needed)
   ```bash
   cp -r backend/uploads backup/uploads
   ```

## 🔄 Reset Database

### Method 1: Using Reset Script (Recommended)

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Run the reset script:
   ```bash
   node scripts/resetDatabase.js
   ```

3. Follow the safety prompts:
   - Type `DELETE ALL DATA` when prompted
   - Type `YES` to confirm

4. Script will:
   - Connect to MongoDB
   - Show current data count
   - Delete all collections
   - Show completion message

### Method 2: Manual MongoDB Commands

1. Connect to MongoDB:
   ```bash
   # For local MongoDB
   mongosh

   # For MongoDB Atlas
   mongosh "your-atlas-connection-string"
   ```

2. Switch to database:
   ```javascript
   use thynk
   ```

3. Drop all collections:
   ```javascript
   db.users.deleteMany({})
   db.groups.deleteMany({})
   db.discussions.deleteMany({})
   db.messages.deleteMany({})
   ```

4. Or drop entire database:
   ```javascript
   db.dropDatabase()
   ```

### Method 3: Using Docker (if using Docker setup)

1. Stop containers:
   ```bash
   docker-compose down
   ```

2. Remove MongoDB volume:
   ```bash
   docker volume rm english-chat_mongodb_data
   ```

3. Restart containers:
   ```bash
   docker-compose up -d
   ```

## 📝 After Reset

### 1. Create Admin Account

After resetting, create a new admin account:

```bash
cd backend
node scripts/createAdmin.js
```

Follow the prompts to create admin credentials.

### 2. Clean Uploaded Files (Optional)

If you want to also remove uploaded files:

```bash
# Remove all uploads
rm -rf backend/uploads/*

# Recreate the directory
mkdir -p backend/uploads
```

### 3. Restart Application

```bash
# If using Docker
docker-compose up -d

# If running manually
cd backend && npm run dev
cd frontend && npm run dev
```

### 4. First Login

1. Go to `http://localhost:5173` (or your domain)
2. Login with admin credentials you just created
3. Start fresh with clean database!

## 🔍 Verification

Verify the reset was successful:

1. **Check MongoDB:**
   ```bash
   mongosh
   use thynk
   db.users.countDocuments()  // Should return 1 (admin only)
   db.groups.countDocuments()  // Should return 0
   db.discussions.countDocuments()  // Should return 0
   db.messages.countDocuments()  // Should return 0
   ```

2. **Check Application:**
   - Login as admin
   - No users to approve
   - No groups or discussions
   - Fresh start!

## 🚨 Troubleshooting

### Script Fails to Connect

**Problem:** Cannot connect to MongoDB

**Solution:**
```bash
# Check if MongoDB is running
systemctl status mongod

# Or check Docker container
docker ps | grep mongo

# Verify MONGODB_URI in .env file
cat backend/.env | grep MONGODB_URI
```

### Permission Denied

**Problem:** Cannot delete files

**Solution:**
```bash
# Run with sudo (Linux/Mac)
sudo node scripts/resetDatabase.js

# Or change file ownership
sudo chown -R $USER:$USER backend/uploads
```

### Database Still Has Data

**Problem:** Some data remains after reset

**Solution:**
```bash
# Connect to MongoDB
mongosh

# Show all databases
show dbs

# Use correct database
use thynk

# Manually drop database
db.dropDatabase()
```

## 📊 Reset Script Output Example

```
=================================================
⚠️  DATABASE RESET SCRIPT ⚠️
=================================================

This script will DELETE ALL DATA from the database:
  - All Users (including admin)
  - All Groups
  - All Discussions
  - All Messages
  - All Uploaded Files

⚠️  THIS ACTION CANNOT BE UNDONE! ⚠️

Connecting to MongoDB...
✅ Connected to MongoDB

Database: thynk

Type "DELETE ALL DATA" to continue: DELETE ALL DATA

Are you absolutely sure? Type "YES" to confirm: YES

🗑️  Starting database reset...

Current data:
  - Users: 15
  - Groups: 8
  - Discussions: 12
  - Messages: 247

Deleting all users...
✅ All users deleted
Deleting all groups...
✅ All groups deleted
Deleting all discussions...
✅ All discussions deleted
Deleting all messages...
✅ All messages deleted

=================================================
✅ DATABASE RESET COMPLETED
=================================================

All data has been deleted successfully.

Next steps:
1. Create a new admin account:
   node scripts/createAdmin.js
2. Start the application:
   npm run dev
```

## 🔐 Security Notes

1. **Never run reset script in production without backup**
2. **Always verify database connection before reset**
3. **Keep admin credentials secure after reset**
4. **Consider access control for reset script**

## 📚 Related Documentation

- [Admin Guide](ADMIN_GUIDE.md) - Creating admin account
- [Deployment Guide](DEPLOYMENT.md) - Production setup
- [Data Persistence](DATA_PERSISTENCE.md) - Data backup

## ❓ FAQ

**Q: Can I undo the reset?**
A: No, deletion is permanent. Always backup first.

**Q: Will this affect my production database?**
A: Only if MONGODB_URI points to production. Check .env first!

**Q: Do I need to reset for every deployment?**
A: No, only when you want a completely fresh start.

**Q: What about MongoDB Atlas?**
A: Script works with Atlas too. Just ensure correct connection string.

**Q: Can I reset only specific collections?**
A: Yes, modify the script or use manual MongoDB commands.

---

**Need Help?** Check the troubleshooting section or create an issue on GitHub.
