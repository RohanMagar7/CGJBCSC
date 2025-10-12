# ⚡ Quick Start Reference

> **TL;DR:** Run `bash quick_start.sh` and open http://localhost:5173

---

## 🚀 Start Everything
```bash
bash quick_start.sh
```

## 🔐 Test Credentials
| Username | Password | Role |
|----------|----------|------|
| testuser | test123 | User |
| admin | admin123 | Admin |
| demo | demo123 | User |

## 🌐 Access Points
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000/api/
- **Admin Panel:** http://localhost:8000/admin

## 🔧 Manual Start

**Backend:**
```bash
cd sewa_portal
/home/rohan/Desktop/projects/CGJBCSC/sys/bin/python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🧪 Quick Tests

### API Login Test
```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

### Create Test Users
```bash
cd sewa_portal && python ../create_test_users.py
```

---

## 📋 Common Commands

### Start/Stop
```bash
# Start
bash quick_start.sh

# Stop
pkill -f "manage.py runserver" && pkill -f "vite"

# Check status
curl http://localhost:8000/api/
curl http://localhost:5173/
```

### Reset Data
```bash
python create_test_users.py    # Reset test users
```

### View Logs
```bash
tail -f /tmp/django_server.log
```

---

## � Quick Fixes

### Port in Use
```bash
lsof -ti:8000 | xargs kill -9    # Django
lsof -ti:5173 | xargs kill -9    # Frontend
```

### Django Won't Start
```bash
# Use virtualenv Python
/home/rohan/Desktop/projects/CGJBCSC/sys/bin/python manage.py runserver
```

### Frontend Issues
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## � API Endpoints

### Public
```
POST /api/users/              # Register
POST /api/token/              # Login
POST /api/token/refresh/      # Refresh token
GET  /api/services/           # List services
```

### Authenticated
```
GET  /api/users/{id}/         # User profile
GET  /api/applications/       # Applications
POST /api/applications/       # Create app
```

### Admin Only
```
GET  /api/users/              # All users
POST /api/services/           # Create service
POST /api/applications/{id}/update_status/
```

---

## 📚 More Documentation
- **README.md** - Full overview
- **COMPLETE_DEBUGGING_GUIDE.md** - Technical details
- **DEBUGGING_SUMMARY.md** - What was fixed

---

**Status:** ✅ All systems operational  
**Last Updated:** October 12, 2025
