#!/bin/bash

# Script untuk kill process yang menggunakan port tertentu

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if port number provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Port number required${NC}"
    echo ""
    echo "Usage: ./kill-port.sh <port>"
    echo "Example: ./kill-port.sh 5000"
    exit 1
fi

PORT=$1

echo "Checking port $PORT..."

# Find process using the port
PID=$(lsof -ti:$PORT 2>/dev/null)

if [ -z "$PID" ]; then
    echo -e "${GREEN}✓ Port $PORT is free${NC}"
    exit 0
fi

# Show process info
echo -e "${YELLOW}Process found:${NC}"
ps aux | grep $PID | grep -v grep

echo ""
echo -e "${YELLOW}Killing process $PID on port $PORT...${NC}"

# Kill the process
kill -9 $PID 2>/dev/null

# Wait and verify
sleep 1

# Check if port is now free
NEW_PID=$(lsof -ti:$PORT 2>/dev/null)

if [ -z "$NEW_PID" ]; then
    echo -e "${GREEN}✓ Port $PORT is now free${NC}"
else
    echo -e "${RED}✗ Failed to free port $PORT${NC}"
    exit 1
fi
