#!/bin/bash

# English Chat Application - Production Deployment Script
# This script builds and deploys the application using Docker

set -e  # Exit on error

echo "========================================="
echo "English Chat - Production Deployment"
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

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

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
echo "2. Stop containers"
echo "3. Restart containers"
echo "4. View logs"
echo "5. Remove containers and images"
echo "6. Exit"
echo ""

read -p "Select option (1-6): " option

case $option in
    1)
        echo -e "${GREEN}Building and starting containers...${NC}"
        echo ""

        # Stop existing containers
        echo "Stopping existing containers..."
        docker-compose --env-file .env.production.local down || true

        # Build images
        echo "Building Docker images..."
        docker-compose --env-file .env.production.local build --no-cache

        # Start containers
        echo "Starting containers..."
        docker-compose --env-file .env.production.local up -d

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
        echo "  docker-compose logs -f"
        echo ""
        echo "To stop the application, run:"
        echo "  docker-compose down"
        ;;

    2)
        echo -e "${YELLOW}Stopping containers...${NC}"
        docker-compose --env-file .env.production.local down
        echo -e "${GREEN}✓ Containers stopped${NC}"
        ;;

    3)
        echo -e "${YELLOW}Restarting containers...${NC}"
        docker-compose --env-file .env.production.local restart
        echo -e "${GREEN}✓ Containers restarted${NC}"
        ;;

    4)
        echo -e "${GREEN}Viewing logs (Ctrl+C to exit)...${NC}"
        docker-compose --env-file .env.production.local logs -f
        ;;

    5)
        echo -e "${RED}Warning: This will remove all containers and images!${NC}"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo "Removing containers..."
            docker-compose --env-file .env.production.local down
            echo "Removing images..."
            docker rmi english-chat_backend english-chat_frontend || true
            echo -e "${GREEN}✓ Cleanup completed${NC}"
        else
            echo "Cancelled."
        fi
        ;;

    6)
        echo "Exiting..."
        exit 0
        ;;

    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac
