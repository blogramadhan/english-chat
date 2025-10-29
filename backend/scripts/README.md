# Migration Scripts

## Quick Start

### Untuk mengatasi error "Failed to save faculty/program" di production:

```bash
# 1. Masuk ke folder backend
cd backend

# 2. Jalankan migration (hapus index lama)
node scripts/removeCodeIndexes.js

# 3. (Optional) Hapus field code dari dokumen lama
node scripts/removeCodeFields.js

# 4. Restart server
pm2 restart all
# atau
npm start
```

## Scripts Available

### 1. removeCodeIndexes.js
**Purpose:** Menghapus unique indexes `code_1_university_1` dan `code_1_faculty_1`

**When to use:** Ketika mendapat error saat membuat faculty/program kedua dengan university/faculty yang sama

**Safe to run:** ✅ Yes, hanya menghapus constraint

```bash
node scripts/removeCodeIndexes.js
```

### 2. removeCodeFields.js
**Purpose:** Menghapus field `code` dari semua dokumen faculty dan program yang ada

**When to use:** Setelah removeCodeIndexes.js, untuk cleanup data lama

**Safe to run:** ✅ Yes, tapi backup dulu!

```bash
node scripts/removeCodeFields.js
```

## Before Running

1. **Backup database:**
   ```bash
   mongodump --uri="mongodb://your-uri" --out=backup-$(date +%Y%m%d)
   ```

2. **Set environment variables:**
   Pastikan file `.env` memiliki `MONGODB_URI`

3. **Test di development dulu:**
   Jika memungkinkan, test di development environment terlebih dahulu

## Verification

Setelah migration, verify dengan:

```bash
# Login ke MongoDB shell
mongosh "your-mongodb-uri"

# Check indexes
db.faculties.getIndexes()
db.programs.getIndexes()

# Check documents (pastikan tidak ada field 'code')
db.faculties.findOne()
db.programs.findOne()
```

## Rollback

Jika perlu rollback:

```bash
mongorestore --uri="mongodb://your-uri" backup-YYYYMMDD/
```

## Common Errors

### "Cannot connect to MongoDB"
- Cek MONGODB_URI di .env
- Cek network/firewall
- Cek MongoDB server status

### "Index not found"
- Index sudah terhapus atau tidak ada
- Ini normal, skip saja

### "Permission denied"
- User MongoDB tidak punya permission drop index
- Hubungi database administrator

## Support

Lihat [MIGRATION_GUIDE.md](../../MIGRATION_GUIDE.md) untuk dokumentasi lengkap.
