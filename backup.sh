#!/bin/bash

# English Chat Application - Backup Script
# This script creates backups of MongoDB database and uploaded files

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================="
echo "English Chat - Backup Script"
echo "========================================="
echo ""

# Configuration
BACKUP_ROOT="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_ROOT}/${TIMESTAMP}"

# Load environment variables if exists
if [ -f .env.production.local ]; then
    export $(cat .env.production.local | grep -v '^#' | xargs)
elif [ -f backend/.env ]; then
    export $(cat backend/.env | grep -v '^#' | xargs)
fi

# Extract database name from MongoDB URI
DB_NAME=$(echo $MONGODB_URI | sed -n 's/.*\/\([^?]*\).*/\1/p')
if [ -z "$DB_NAME" ]; then
    DB_NAME="online-discussion"
fi

echo -e "${BLUE}Database:${NC} $DB_NAME"
echo -e "${BLUE}Backup directory:${NC} $BACKUP_DIR"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup MongoDB
echo -e "${GREEN}1. Backing up MongoDB database...${NC}"
if command -v mongodump &> /dev/null; then
    mongodump --db "$DB_NAME" --out "$BACKUP_DIR/mongodb" --quiet

    # Compress MongoDB backup
    tar -czf "$BACKUP_DIR/mongodb-${TIMESTAMP}.tar.gz" -C "$BACKUP_DIR" mongodb
    rm -rf "$BACKUP_DIR/mongodb"

    echo -e "${GREEN}✓ MongoDB backup completed:${NC} mongodb-${TIMESTAMP}.tar.gz"
else
    echo -e "${YELLOW}⚠ mongodump not found. Skipping MongoDB backup.${NC}"
    echo -e "${YELLOW}  Install with: sudo apt-get install mongodb-database-tools${NC}"
fi

# Backup uploads folder
echo ""
echo -e "${GREEN}2. Backing up uploads folder...${NC}"
if [ -d "backend/uploads" ]; then
    # Count files
    FILE_COUNT=$(find backend/uploads -type f | wc -l)

    if [ $FILE_COUNT -gt 0 ]; then
        tar -czf "$BACKUP_DIR/uploads-${TIMESTAMP}.tar.gz" backend/uploads
        echo -e "${GREEN}✓ Uploads backup completed:${NC} uploads-${TIMESTAMP}.tar.gz ($FILE_COUNT files)"
    else
        echo -e "${YELLOW}⚠ No files found in uploads folder. Skipping.${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Uploads folder not found. Skipping.${NC}"
fi

# Backup environment files
echo ""
echo -e "${GREEN}3. Backing up configuration files...${NC}"
if [ -f ".env.production.local" ]; then
    cp .env.production.local "$BACKUP_DIR/env.production.local.backup"
    echo -e "${GREEN}✓ Environment file backed up${NC}"
fi

# Create backup manifest
echo ""
echo -e "${GREEN}4. Creating backup manifest...${NC}"
cat > "$BACKUP_DIR/manifest.txt" <<EOF
English Chat Application - Backup Manifest
=========================================
Backup Date: $(date)
Database: $DB_NAME
Timestamp: $TIMESTAMP

Contents:
EOF

# List backup files
ls -lh "$BACKUP_DIR" | tail -n +2 | awk '{print "  - " $9 " (" $5 ")"}' >> "$BACKUP_DIR/manifest.txt"

echo -e "${GREEN}✓ Manifest created${NC}"

# Calculate total backup size
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

echo ""
echo "========================================="
echo -e "${GREEN}Backup completed successfully!${NC}"
echo "========================================="
echo ""
echo -e "${BLUE}Backup location:${NC} $BACKUP_DIR"
echo -e "${BLUE}Total size:${NC} $TOTAL_SIZE"
echo ""
echo "Backup contents:"
ls -lh "$BACKUP_DIR" | tail -n +2 | awk '{print "  " $9 " (" $5 ")"}'
echo ""

# Keep only last 7 backups
echo -e "${YELLOW}Cleaning old backups (keeping last 7)...${NC}"
cd "$BACKUP_ROOT"
ls -t | tail -n +8 | xargs -r rm -rf
REMAINING_BACKUPS=$(ls -1 | wc -l)
echo -e "${GREEN}✓ Cleanup completed. Total backups: $REMAINING_BACKUPS${NC}"
echo ""

# Restore instructions
echo "To restore this backup, use:"
echo -e "${BLUE}  ./restore.sh ${TIMESTAMP}${NC}"
echo ""
