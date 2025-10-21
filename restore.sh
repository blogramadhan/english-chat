#!/bin/bash

# English Chat Application - Restore Script
# This script restores MongoDB database and uploaded files from backup

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================="
echo "English Chat - Restore Script"
echo "========================================="
echo ""

# Check if backup timestamp is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Backup timestamp required${NC}"
    echo ""
    echo "Usage: ./restore.sh <timestamp>"
    echo ""
    echo "Available backups:"
    if [ -d "./backups" ]; then
        ls -1 ./backups | while read backup; do
            if [ -f "./backups/$backup/manifest.txt" ]; then
                echo -e "  ${GREEN}$backup${NC}"
                head -n 5 "./backups/$backup/manifest.txt" | tail -n 3 | sed 's/^/    /'
                echo ""
            fi
        done
    else
        echo "  No backups found"
    fi
    exit 1
fi

TIMESTAMP=$1
BACKUP_DIR="./backups/${TIMESTAMP}"

# Check if backup exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}Error: Backup not found: $BACKUP_DIR${NC}"
    exit 1
fi

echo -e "${BLUE}Restoring from backup:${NC} $TIMESTAMP"
echo ""

# Show backup manifest
if [ -f "$BACKUP_DIR/manifest.txt" ]; then
    echo -e "${BLUE}Backup Information:${NC}"
    cat "$BACKUP_DIR/manifest.txt"
    echo ""
fi

# Confirm restore
echo -e "${YELLOW}⚠ WARNING: This will overwrite current data!${NC}"
read -p "Are you sure you want to restore this backup? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo ""

# Load environment variables
if [ -f .env.production.local ]; then
    export $(cat .env.production.local | grep -v '^#' | xargs)
elif [ -f backend/.env ]; then
    export $(cat backend/.env | grep -v '^#' | xargs)
fi

# Extract database name
DB_NAME=$(echo $MONGODB_URI | sed -n 's/.*\/\([^?]*\).*/\1/p')
if [ -z "$DB_NAME" ]; then
    DB_NAME="online-discussion"
fi

# Restore MongoDB
echo -e "${GREEN}1. Restoring MongoDB database...${NC}"
MONGODB_BACKUP="$BACKUP_DIR/mongodb-${TIMESTAMP}.tar.gz"

if [ -f "$MONGODB_BACKUP" ]; then
    if command -v mongorestore &> /dev/null; then
        # Extract backup
        TEMP_DIR=$(mktemp -d)
        tar -xzf "$MONGODB_BACKUP" -C "$TEMP_DIR"

        # Restore database
        mongorestore --db "$DB_NAME" --drop "$TEMP_DIR/mongodb/$DB_NAME"

        # Cleanup
        rm -rf "$TEMP_DIR"

        echo -e "${GREEN}✓ MongoDB restored successfully${NC}"
    else
        echo -e "${YELLOW}⚠ mongorestore not found. Skipping MongoDB restore.${NC}"
        echo -e "${YELLOW}  Install with: sudo apt-get install mongodb-database-tools${NC}"
    fi
else
    echo -e "${YELLOW}⚠ MongoDB backup not found. Skipping.${NC}"
fi

# Restore uploads folder
echo ""
echo -e "${GREEN}2. Restoring uploads folder...${NC}"
UPLOADS_BACKUP="$BACKUP_DIR/uploads-${TIMESTAMP}.tar.gz"

if [ -f "$UPLOADS_BACKUP" ]; then
    # Backup current uploads if exists
    if [ -d "backend/uploads" ]; then
        CURRENT_BACKUP="backend/uploads.backup.$(date +%Y%m%d_%H%M%S)"
        echo -e "${YELLOW}  Backing up current uploads to: $CURRENT_BACKUP${NC}"
        mv backend/uploads "$CURRENT_BACKUP"
    fi

    # Extract uploads backup
    tar -xzf "$UPLOADS_BACKUP"

    echo -e "${GREEN}✓ Uploads restored successfully${NC}"
else
    echo -e "${YELLOW}⚠ Uploads backup not found. Skipping.${NC}"
fi

# Restore environment file
echo ""
echo -e "${GREEN}3. Restoring configuration files...${NC}"
if [ -f "$BACKUP_DIR/env.production.local.backup" ]; then
    if [ -f ".env.production.local" ]; then
        cp .env.production.local ".env.production.local.backup.$(date +%Y%m%d_%H%M%S)"
        echo -e "${YELLOW}  Current .env backed up${NC}"
    fi
    cp "$BACKUP_DIR/env.production.local.backup" .env.production.local
    echo -e "${GREEN}✓ Configuration file restored${NC}"
else
    echo -e "${YELLOW}⚠ Configuration backup not found. Skipping.${NC}"
fi

echo ""
echo "========================================="
echo -e "${GREEN}Restore completed successfully!${NC}"
echo "========================================="
echo ""
echo -e "${BLUE}Restored from:${NC} $BACKUP_DIR"
echo ""
echo "Next steps:"
echo "  1. Verify the restored data"
echo "  2. Restart the application if running"
echo "  3. Test application functionality"
echo ""
