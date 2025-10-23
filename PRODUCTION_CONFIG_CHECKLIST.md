# Production Configuration Checklist

This document provides a comprehensive checklist for deploying the LOOMA application to production.

## ✅ Configuration Files Overview

### 1. Environment Variables (.env.production.local)

**Required variables:**

```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-secure-random-string

# Frontend URL (with https://)
CLIENT_URL=https://looma.thynk.my.id

# Backend API URL (with https://)
VITE_API_URL=https://looma-pi.thynk.my.id

# Optional: Socket URL (defaults to VITE_API_URL if not set)
VITE_SOCKET_URL=https://looma-pi.thynk.my.id
```

**Important Notes:**
- ⚠️ Never commit `.env.production.local` to git
- ✅ Copy from `.env.production` template
- ✅ Use HTTPS URLs in production (Caddy handles SSL)
- ✅ Ensure no trailing slashes in URLs

---

## ✅ Frontend Configuration

### 1. vite.config.js
**Status:** ✅ Configured

```javascript
server: {
  port: 3090,
  proxy: {
    '/api': 'http://localhost:5000',
    '/uploads': 'http://localhost:5000'
  }
}

build: {
  outDir: 'dist',
  sourcemap: false,          // Disabled for production
  minify: 'terser',          // Optimize bundle size
  rollupOptions: {
    output: {
      manualChunks: {       // Code splitting for better caching
        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        'chakra-vendor': ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
        'socket-vendor': ['socket.io-client']
      }
    }
  }
}
```

### 2. frontend/Dockerfile
**Status:** ✅ Configured

- ✅ Uses build arguments (ARG) for VITE_API_URL and VITE_SOCKET_URL
- ✅ Port 3090 exposed and served
- ✅ Uses `npm install` (not `npm ci`)
- ✅ Builds static files with `npm run build`
- ✅ Serves with `serve -s dist -l 3090`

### 3. API Configuration Files

**src/utils/api.js**
- ✅ Uses `import.meta.env.VITE_API_URL` with fallback to '/api'
- ✅ Includes Authorization header interceptor

**src/context/AuthContext.jsx**
- ✅ login() uses VITE_API_URL
- ✅ register() uses VITE_API_URL

**src/pages/Discussion.jsx**
- ✅ Socket.IO connection uses VITE_SOCKET_URL or VITE_API_URL

---

## ✅ Backend Configuration

### 1. backend/server.js
**Status:** ✅ Configured

```javascript
// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3090',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Socket.IO CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3090',
    methods: ['GET', 'POST'],
    credentials: true
  }
});
```

### 2. backend/Dockerfile
**Status:** ✅ Configured

- ✅ Uses `npm install --omit=dev` (production dependencies only)
- ✅ Port 5000 exposed
- ✅ NODE_ENV=production set
- ✅ Creates uploads directory

---

## ✅ Docker Configuration

### docker-compose.yml
**Status:** ✅ Configured

**Backend Service:**
```yaml
ports:
  - "5000:5000"
environment:
  - NODE_ENV=production
  - PORT=5000
  - MONGODB_URI=${MONGODB_URI}
  - JWT_SECRET=${JWT_SECRET}
  - CLIENT_URL=${CLIENT_URL}
volumes:
  - ./backend/uploads:/app/uploads  # Persist uploads
```

**Frontend Service:**
```yaml
build:
  args:
    - VITE_API_URL=${VITE_API_URL}
    - VITE_SOCKET_URL=${VITE_SOCKET_URL:-${VITE_API_URL}}
ports:
  - "3090:3090"
environment:
  - NODE_ENV=production
```

**Key Points:**
- ✅ No `version` field (deprecated in Docker Compose V2)
- ✅ Build args pass environment variables at build time
- ✅ Volumes persist uploaded files
- ✅ Both services on same network for internal communication

---

## ✅ Deployment Script (deploy.sh)

**Status:** ✅ Configured

- ✅ Auto-detects `docker-compose` or `docker compose`
- ✅ Loads `.env.production.local`
- ✅ Multiple deployment options (deploy, update, backup, restore)
- ✅ Builds with `--no-cache` flag
- ✅ Uses `--env-file .env.production.local`

---

## ✅ Caddy Reverse Proxy Configuration

### Caddyfile (example provided)

```caddy
# Frontend
looma.thynk.my.id {
    reverse_proxy localhost:3090
    encode gzip
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
        X-XSS-Protection "1; mode=block"
    }
}

# Backend API
looma-pi.thynk.my.id {
    reverse_proxy localhost:5000
    encode gzip

    # WebSocket support for Socket.IO
    @websockets {
        header Connection *Upgrade*
        header Upgrade websocket
    }
    reverse_proxy @websockets localhost:5000
}
```

**Setup:**
1. Copy `Caddyfile.example` to `/etc/caddy/Caddyfile`
2. Reload Caddy: `sudo systemctl reload caddy`

---

## 🚀 Deployment Steps

### First Time Deployment

1. **Prepare Environment File**
   ```bash
   cp .env.production .env.production.local
   nano .env.production.local  # Edit with actual values
   ```

2. **Run Deployment Script**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   # Select option 1: Deploy (build and start containers)
   ```

3. **Configure Caddy**
   ```bash
   sudo cp Caddyfile.example /etc/caddy/Caddyfile
   sudo systemctl reload caddy
   ```

4. **Verify Deployment**
   - Frontend: https://looma.thynk.my.id
   - Backend: https://looma-pi.thynk.my.id/api/auth/test (if you have a test endpoint)
   - Check logs: `docker compose --env-file .env.production.local logs -f`

### Update Deployment (from GitHub)

```bash
./deploy.sh
# Select option 2: Update from GitHub and redeploy
```

This will:
1. Create automatic backup
2. Pull latest code from GitHub
3. Rebuild Docker images with `--no-cache`
4. Restart containers with new code

---

## 🔍 Verification Checklist

### Before Deployment

- [ ] `.env.production.local` file exists and has all required variables
- [ ] MongoDB Atlas connection string is correct
- [ ] JWT_SECRET is a secure random string
- [ ] CLIENT_URL matches frontend domain (with https://)
- [ ] VITE_API_URL matches backend domain (with https://)
- [ ] Docker and Docker Compose are installed
- [ ] Caddy is installed and configured

### After Deployment

- [ ] Containers are running: `docker ps`
- [ ] No errors in logs: `docker compose logs`
- [ ] Frontend loads at https://looma.thynk.my.id
- [ ] Backend responds at https://looma-pi.thynk.my.id
- [ ] Can register new user
- [ ] Can login successfully
- [ ] Socket.IO connection works (real-time chat)
- [ ] File uploads work (profile pictures, materials)
- [ ] SSL certificates are valid (Caddy auto-manages)

---

## 🐛 Troubleshooting Common Issues

### Issue: "Login failed, An error occurred"

**Check:**
1. Browser console for exact error
2. Network tab - is API URL correct?
3. Backend logs: `docker compose logs backend`
4. CORS configuration in backend/server.js
5. .env.production.local has correct CLIENT_URL

**Solution:**
```bash
# Verify environment variables
docker compose exec frontend env | grep VITE
docker compose exec backend env | grep CLIENT_URL

# Rebuild if environment changed
./deploy.sh  # Option 1: Deploy
```

### Issue: "Welcome, undefined!"

**Cause:** Frontend not connecting to backend properly

**Solution:**
- Ensure VITE_API_URL is set in .env.production.local
- Rebuild frontend: `./deploy.sh` (option 1)
- VITE_ variables are baked into build, not runtime

### Issue: Socket.IO not connecting

**Check:**
1. VITE_SOCKET_URL in .env.production.local
2. Caddy WebSocket configuration
3. Backend Socket.IO CORS settings

**Test:**
```bash
# Check WebSocket connection in browser console
# Should see: "User connected: <socket-id>" in backend logs
docker compose logs backend | grep "User connected"
```

### Issue: Docker Compose command not found

**Solution:**
The deploy.sh script auto-detects both versions. If still failing:

```bash
# For AlmaLinux/RHEL
sudo dnf install docker-compose-plugin -y

# Verify
docker compose version
```

### Issue: npm ci error during build

**Status:** ✅ Fixed - using `npm install` instead

If you see package-lock.json errors, the Dockerfiles have been updated to use `npm install`.

---

## 📊 Production Optimization

### Current Optimizations

1. **Code Splitting**
   - React libraries in separate chunk
   - Chakra UI in separate chunk
   - Socket.IO in separate chunk
   - Better browser caching

2. **Minification**
   - Using Terser for JavaScript minification
   - Reduces bundle size significantly

3. **No Source Maps**
   - Disabled in production for security
   - Faster builds

4. **Gzip Compression**
   - Enabled in Caddy configuration
   - Reduces transfer size

5. **Static File Serving**
   - Using `serve` package for optimized static file delivery
   - Proper caching headers

### Performance Monitoring

Monitor these metrics:
- Initial load time
- Time to interactive
- Bundle sizes (check `frontend/dist` after build)
- API response times
- WebSocket connection stability

---

## 🔐 Security Considerations

### Current Security Measures

1. **HTTPS Only** - Caddy manages SSL certificates automatically
2. **CORS Configured** - Only allows requests from frontend domain
3. **JWT Authentication** - Secure token-based auth
4. **Security Headers** - Set via Caddy (HSTS, X-Frame-Options, etc.)
5. **Credentials: true** - Secure cookie handling
6. **Environment Variables** - Sensitive data not in code
7. **MongoDB Atlas** - Managed database with built-in security

### Additional Recommendations

- [ ] Enable rate limiting (in Caddy or backend)
- [ ] Add CSP (Content Security Policy) headers
- [ ] Regular security updates for dependencies
- [ ] Monitor logs for suspicious activity
- [ ] Regular database backups (use `./deploy.sh` option 6)

---

## 📝 Important Notes

1. **Build-time vs Runtime Variables**
   - `VITE_*` variables are baked into frontend build
   - Backend variables are runtime (can change without rebuild)
   - To change VITE_* vars, must rebuild frontend

2. **Port Mapping**
   - Frontend: External 3090 → Internal 3090
   - Backend: External 5000 → Internal 5000
   - Caddy proxies 443 (HTTPS) to these ports

3. **Data Persistence**
   - Uploads stored in: `./backend/uploads`
   - This directory persists across container restarts
   - Backed up via deploy.sh backup option

4. **Database Reset**
   - Use `node backend/scripts/resetDatabase.js` carefully
   - See RESET_DATABASE.md for details
   - Always backup first!

---

## 📞 Quick Reference Commands

```bash
# View logs
docker compose --env-file .env.production.local logs -f

# Restart services
docker compose --env-file .env.production.local restart

# Stop services
docker compose --env-file .env.production.local down

# Rebuild and restart
./deploy.sh  # Option 1

# Update from GitHub
./deploy.sh  # Option 2

# Backup database
./deploy.sh  # Option 6

# Check running containers
docker ps

# Check Caddy status
sudo systemctl status caddy

# Reload Caddy config
sudo systemctl reload caddy

# View Caddy logs
sudo journalctl -u caddy -f
```

---

## ✅ All Systems Ready

This configuration has been verified for production deployment with:
- ✅ Frontend on port 3090
- ✅ Backend on port 5000
- ✅ Caddy reverse proxy for HTTPS
- ✅ Environment variables properly configured
- ✅ Docker Compose V1 and V2 support
- ✅ Socket.IO with proper CORS
- ✅ Code splitting and optimization
- ✅ File upload persistence
- ✅ Backup and restore capabilities

Your application is ready for production deployment! 🚀
