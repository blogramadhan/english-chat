# Frontend Dockerfile for Production
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install serve for production
RUN npm install -g serve

# Copy application files
COPY . .

# Accept build arguments for API URLs
ARG VITE_API_URL
ARG VITE_SOCKET_URL

# Set as environment variables during build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

# Build the application
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the application using serve
CMD ["serve", "-s", "dist", "-l", "3000"]
