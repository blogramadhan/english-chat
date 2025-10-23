#!/bin/bash

# English Chat Application - Production Deployment Script
# This script builds and deploys the application using Docker

set -e  # Exit on error

echo "========================================="
echo "LOOMA - Production Deployment"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Detect docker compose command (plugin or standalone)
DOCKER_COMPOSE=""
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
    echo -e "${GREEN}✓ Using docker-compose (standalone)${NC}"
elif docker compose version &> /dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
    echo -e "${GREEN}✓ Using docker compose (plugin)${NC}"
else
    echo -e "${RED}Error: Docker Compose is not installed.${NC}"
    echo -e "${YELLOW}Install instructions:${NC}"
    echo "  # For AlmaLinux/RHEL:"
    echo "  sudo dnf install docker-compose-plugin -y"
    echo ""
    echo "  # Or standalone:"
    echo "  sudo curl -L 'https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)' -o /usr/local/bin/docker-compose"
    echo "  sudo chmod +x /usr/local/bin/docker-compose"
    exit 1
fi
echo ""

# Check if .env file exists
if [ ! -f .env.production.local ]; then
    if [ -f .env.production ]; then
        echo -e "${YELLOW}Warning: .env.production.local not found.${NC}"
        echo -e "${YELLOW}Copying .env.production to .env.production.local${NC}"
        cp .env.production .env.production.local
        echo -e "${RED}IMPORTANT: Please edit .env.production.local with your actual values before proceeding!${NC}"
        read -p "Press Enter to continue after editing .env.production.local, or Ctrl+C to cancel..."
    else
        echo -e "${RED}Error: .env.production file not found!${NC}"
        exit 1
    fi
fi

# Load environment variables
export $(cat .env.production.local | grep -v '^#' | xargs)

echo -e "${GREEN}✓ Environment variables loaded${NC}"
echo ""

# Show deployment options
echo "Deployment Options:"
echo "1. Deploy (build and start containers)"
echo "2. Update from GitHub and redeploy"
echo "3. Stop containers"
echo "4. Restart containers"
echo "5. View logs"
echo "6. Backup database and files"
echo "7. Restore from backup"
echo "8. Remove containers and images"
echo "9. Exit"
echo ""

read -p "Select option (1-9): " option

case $option in
    1)
        echo -e "${GREEN}Building and starting containers...${NC}"
        echo ""

        # Stop existing containers (keep volumes and data)
        echo "Stopping existing containers..."
        $DOCKER_COMPOSE --env-file .env.production.local down --remove-orphans || true

        # Build images
        echo "Building Docker images..."
        $DOCKER_COMPOSE --env-file .env.production.local build --no-cache

        # Start containers
        echo "Starting containers..."
        $DOCKER_COMPOSE --env-file .env.production.local up -d

        echo ""
        echo -e "${GREEN}=========================================${NC}"
        echo -e "${GREEN}Deployment completed successfully!${NC}"
        echo -e "${GREEN}=========================================${NC}"
        echo ""
        echo "Application URLs:"
        echo "  Frontend: http://localhost:3000"
        echo "  Backend:  http://localhost:5000"
        echo ""
        echo "To view logs, run:"
        echo "  $DOCKER_COMPOSE logs -f"
        echo ""
        echo "To stop the application, run:"
        echo "  $DOCKER_COMPOSE down"
        ;;

    2)
        echo -e "${GREEN}Updating from GitHub and redeploying...${NC}"
        echo ""

        # Check if git is installed
        if ! command -v git &> /dev/null; then
            echo -e "${RED}Error: Git is not installed${NC}"
            exit 1
        fi

        # Check if it's a git repository
        if [ ! -d .git ]; then
            echo -e "${RED}Error: Not a git repository${NC}"
            echo "Please clone from GitHub first"
            exit 1
        fi

        # Show current branch and status
        echo -e "${YELLOW}Current branch:${NC} $(git branch --show-current)"
        echo -e "${YELLOW}Current commit:${NC} $(git rev-parse --short HEAD)"
        echo ""

        # Backup before update
        echo -e "${YELLOW}Creating backup before update...${NC}"
        ./backup.sh
        echo ""

        # Stash local changes if any
        if ! git diff-index --quiet HEAD --; then
            echo -e "${YELLOW}Stashing local changes...${NC}"
            git stash push -m "Auto-stash before deploy update $(date)"
        fi

        # Pull latest changes
        echo "Pulling latest changes from GitHub..."
        git pull origin $(git branch --show-current)

        if [ $? -ne 0 ]; then
            echo -e "${RED}Error: Failed to pull from GitHub${NC}"
            echo "Please resolve conflicts manually"
            exit 1
        fi

        echo -e "${GREEN}✓ Code updated successfully${NC}"
        echo ""

        # Stop existing containers (keep volumes and data)
        echo "Stopping existing containers..."
        $DOCKER_COMPOSE --env-file .env.production.local down --remove-orphans || true

        # Rebuild images
        echo "Rebuilding Docker images..."
        $DOCKER_COMPOSE --env-file .env.production.local build --no-cache

        # Start containers
        echo "Starting containers..."
        $DOCKER_COMPOSE --env-file .env.production.local up -d

        echo ""
        echo -e "${GREEN}=========================================${NC}"
        echo -e "${GREEN}Update and redeploy completed!${NC}"
        echo -e "${GREEN}=========================================${NC}"
        echo ""
        echo -e "${YELLOW}Changes:${NC}"
        git log --oneline -5
        echo ""
        ;;

    3)
        echo -e "${YELLOW}Stopping containers...${NC}"
        echo -e "${YELLOW}Note: Uploads and backups will be preserved${NC}"
        $DOCKER_COMPOSE --env-file .env.production.local down --remove-orphans
        echo -e "${GREEN}✓ Containers stopped (data preserved)${NC}"
        ;;

    4)
        echo -e "${YELLOW}Restarting containers...${NC}"
        $DOCKER_COMPOSE --env-file .env.production.local restart
        echo -e "${GREEN}✓ Containers restarted${NC}"
        ;;

    5)
        echo -e "${GREEN}Viewing logs (Ctrl+C to exit)...${NC}"
        $DOCKER_COMPOSE --env-file .env.production.local logs -f
        ;;


    6)
        echo -e "${GREEN}Creating backup...${NC}"
        ./backup.sh
        ;;

    7)
        echo -e "${GREEN}Restoring from backup...${NC}"
        echo ""

        if [ ! -d "./backups" ] || [ -z "$(ls -A ./backups 2>/dev/null)" ]; then
            echo -e "${RED}Error: No backups found${NC}"
            exit 1
        fi

        echo "Available backups:"
        ls -1 ./backups | nl -w2 -s'. '
        echo ""

        read -p "Enter backup number or timestamp: " backup_choice

        # Check if it's a number
        if [[ "$backup_choice" =~ ^[0-9]+$ ]]; then
            BACKUP_TIMESTAMP=$(ls -1 ./backups | sed -n "${backup_choice}p")
        else
            BACKUP_TIMESTAMP="$backup_choice"
        fi

        if [ -z "$BACKUP_TIMESTAMP" ]; then
            echo -e "${RED}Invalid selection${NC}"
            exit 1
        fi

        ./restore.sh "$BACKUP_TIMESTAMP"
        ;;

    8)
        echo -e "${RED}Warning: This will remove all containers and images!${NC}"
        echo -e "${YELLOW}Your data (uploads & backups) will be preserved${NC}"
        echo ""
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo "Removing containers..."
            $DOCKER_COMPOSE --env-file .env.production.local down --remove-orphans
            echo "Removing images..."
            docker rmi english-chat_backend english-chat_frontend || true
            echo -e "${GREEN}✓ Cleanup completed${NC}"
            echo -e "${GREEN}✓ Uploads and backups preserved${NC}"
        else
            echo "Cancelled."
        fi
        ;;

    9)
        echo "Exiting..."
        exit 0
        ;;

    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac
