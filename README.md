# 📘 CGJBCSC Digital Sewa Portal

**Complete Digital Service Application System**  
Built with Django REST Framework + React + JWT Authentication

[![Status](https://img.shields.io/badge/status-operational-brightgreen)]()
[![Django](https://img.shields.io/badge/django-5.2.7-green)]()
[![React](https://img.shields.io/badge/react-18-blue)]()

---

## 🚀 Quick Start

```bash
# Start both servers
bash quick_start.sh
```

**Access:**
- 🌐 Frontend: http://localhost:5173
- 🔌 Backend API: http://localhost:8000
- 👤 Test User: `testuser` / `test123`
- 🔑 Admin: `admin` / `admin123`

---

## 📑 Documentation Structure

| Document | Purpose | Audience |
|----------|---------|----------|
| **README.md** (this file) | Quick start & overview | Everyone |
| **QUICK_START.md** | Common commands & credentials | Developers |
| **COMPLETE_DEBUGGING_GUIDE.md** | Full technical details | Developers |
| **DEBUGGING_SUMMARY.md** | What was fixed | Team leads |

---

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Overview](#api-overview)
- [Authentication](#authentication)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Development](#development)

---

## ✨ Features

### User Features
- ✅ User registration with validation
- ✅ Secure login with JWT tokens
- ✅ Personal dashboard
- ✅ Service application management
- ✅ Document upload system
- ✅ Application status tracking

### Admin Features
- ✅ User management
- ✅ Service management
- ✅ Application review system
- ✅ Application approval/rejection
- ✅ Email notifications
- ✅ Complete admin dashboard

### Technical Features
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ RESTful API
- ✅ CORS configured
- ✅ Token refresh mechanism
- ✅ Protected routes
- ✅ Material-UI design system

---

## 🛠️ Technology Stack

### Backend
- **Framework:** Django 5.2.7
- **API:** Django REST Framework 3.16.1
- **Authentication:** Simple JWT 5.5.1
- **Database:** SQLite3 (development)
- **CORS:** django-cors-headers

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite 7.1.9
- **UI Library:** Material-UI v5
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **State Management:** React Context API

---

## 📦 Installation

### Prerequisites
- Python 3.12+
- Node.js 18+
- npm 9+

### Step 1: Backend Setup

```bash
cd sewa_portal

# Virtual environment already configured at ../sys/
# Run migrations
/home/rohan/Desktop/projects/CGJBCSC/sys/bin/python manage.py migrate

# Create test users (recommended)
cd ..
python create_test_users.py
```

### Step 2: Frontend Setup

```bash
cd frontend

# Install dependencies (if needed)
npm install
```

### Step 3: Start Servers

```bash
# Use the quick start script
bash quick_start.sh

# Or manually:
# Terminal 1 - Django
cd sewa_portal
/home/rohan/Desktop/projects/CGJBCSC/sys/bin/python manage.py runserver

# Terminal 2 - React
cd frontend
npm run dev
```

---

## 🎯 Usage

### For End Users

1. **Register Account**
   - Visit http://localhost:5173/register
   - Fill in all required fields
   - Submit to create account

2. **Login**
   - Visit http://localhost:5173/login
   - Use credentials: `testuser` / `test123`
   - Will redirect to dashboard

3. **Apply for Services**
   - Browse available services
   - Submit application
   - Upload required documents
   - Track status

### For Administrators

1. **Login as Admin**
   - Use credentials: `admin` / `admin123`
   - Access admin dashboard

2. **Manage Services**
   - Create/edit/delete services
   - Set service requirements

3. **Review Applications**
   - View all submitted applications
   - Approve or reject
   - Add rejection reasons
   - System sends email notifications

---

## 🔌 API Overview

**Base URL:** `http://localhost:8000/api/`

### Public Endpoints
```
POST   /api/users/              # Register new user
POST   /api/token/              # Login (get JWT tokens)
POST   /api/token/refresh/      # Refresh access token
GET    /api/services/           # List all services
```

### Protected Endpoints (Require Authentication)
```
GET    /api/users/{id}/         # Get user profile (own or admin)
GET    /api/applications/       # List applications (filtered)
POST   /api/applications/       # Create application
GET    /api/documents/          # List documents
POST   /api/documents/          # Upload document
```

### Admin Only Endpoints
```
GET    /api/users/              # List all users
POST   /api/services/           # Create service
POST   /api/applications/{id}/update_status/  # Update status
```

**Full API Documentation:** See [COMPLETE_DEBUGGING_GUIDE.md](COMPLETE_DEBUGGING_GUIDE.md#api-documentation)

---

## 🔐 Authentication

### How It Works

1. **User Login** → Receives JWT access & refresh tokens
2. **Token Storage** → Stored in localStorage
3. **API Requests** → Include token in Authorization header
4. **Token Validation** → Backend validates on each request
5. **Token Refresh** → Use refresh token when access expires

### Token Configuration

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'USER_ID_FIELD': 'user_id',
    'USER_ID_CLAIM': 'user_id',
}
```

### Using Authentication in Frontend

```javascript
// Login
const response = await axios.post('/api/token/', { username, password });
localStorage.setItem('accessToken', response.data.access);

// Make authenticated request
axios.get('/api/applications/', {
  headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
});

// Refresh token
const refresh = localStorage.getItem('refreshToken');
const response = await axios.post('/api/token/refresh/', { refresh });
localStorage.setItem('accessToken', response.data.access);
```

**More Details:** See [Authentication Section](COMPLETE_DEBUGGING_GUIDE.md#authentication)

---

## 🧪 Testing

### Create Test Users

```bash
cd sewa_portal
python ../create_test_users.py
```

**Test Credentials:**
- User: `testuser` / `test123`
- Admin: `admin` / `admin123`
- Demo: `demo` / `demo123`

### API Testing Examples

```bash
# Register new user
curl -X POST http://localhost:8000/api/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "password123",
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone_number": "1234567890"
  }'

# Login
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'

# Get user profile (replace TOKEN)
curl -X GET http://localhost:8000/api/users/6/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Testing

1. **Registration Flow**
   - Open http://localhost:5173/register
   - Complete form
   - Verify redirect to login

2. **Login Flow**
   - Open http://localhost:5173/login
   - Login with test credentials
   - Verify redirect to dashboard
   - Check localStorage for tokens

3. **Protected Routes**
   - Try accessing /applications without login
   - Should redirect to /login
   - Login and try again
   - Should show applications page

**More Tests:** See [Testing Section](COMPLETE_DEBUGGING_GUIDE.md#testing)

---

## 🔧 Troubleshooting

### Server Won't Start

**Django:**
```bash
# Use correct Python interpreter
/home/rohan/Desktop/projects/CGJBCSC/sys/bin/python manage.py runserver

# Check port is free
lsof -ti:8000 | xargs kill -9
```

**Frontend:**
```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Login Not Working

```bash
# Test API directly
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'

# Reset test users
python create_test_users.py

# Check browser console for errors
```

### 403 Forbidden

- Check Authorization header is sent
- Verify token hasn't expired
- Try refreshing token

### Common Commands

```bash
# Check server status
curl http://localhost:8000/api/
curl http://localhost:5173/

# View logs
tail -f /tmp/django_server.log

# Stop servers
pkill -f "manage.py runserver"
pkill -f "vite"
```

**Full Troubleshooting:** See [Troubleshooting Section](COMPLETE_DEBUGGING_GUIDE.md#troubleshooting)

---

## 💻 Development

### Project Structure

```
CGJBCSC/
├── sewa_portal/              # Django backend
│   ├── core/                 # Main application
│   │   ├── models.py         # Database models
│   │   ├── views.py          # API views
│   │   ├── serializers.py    # DRF serializers
│   │   ├── urls.py           # URL routing
│   │   └── permissions.py    # Custom permissions
│   ├── sewa_portal/          # Project settings
│   └── db.sqlite3            # Database
├── frontend/                 # React frontend
│   └── src/
│       ├── components/       # Reusable components
│       ├── pages/            # Page components
│       ├── services/         # API services
│       ├── context/          # React context
│       └── config/           # Configuration
├── sys/                      # Python virtualenv
├── create_test_users.py      # Test user script
├── quick_start.sh            # Startup script
└── docs/                     # Documentation
```

### Adding New Features

**Backend:**
1. Create model in `models.py`
2. Create serializer in `serializers.py`
3. Create viewset in `views.py`
4. Register route in `urls.py`
5. Run migrations

**Frontend:**
1. Create component in `pages/`
2. Add route in `App.jsx`
3. Add navigation in `Navbar.jsx`
4. Create API service in `services/`

**Full Guide:** See [Development Section](COMPLETE_DEBUGGING_GUIDE.md#development-guide)

### Useful Commands

```bash
# Backend
python manage.py makemigrations    # Create migrations
python manage.py migrate           # Apply migrations
python manage.py createsuperuser   # Create admin
python manage.py shell             # Django shell
python manage.py test              # Run tests

# Frontend
npm run dev                        # Start dev server
npm run build                      # Build for production
npm run preview                    # Preview build

# Utility
python create_test_users.py        # Create test users
bash quick_start.sh                # Start both servers
```

---

## 📚 Documentation Files

- **README.md** - This file (overview & quick start)
- **QUICK_START.md** - Quick reference guide
- **COMPLETE_DEBUGGING_GUIDE.md** - Full technical documentation (700+ lines)
- **DEBUGGING_SUMMARY.md** - Summary of fixes applied
- **docs/archive/** - Historical documentation

---

## ✅ What Was Fixed

All critical issues have been resolved:

1. ✅ **JWT Token Decoding** - Fixed frontend to fetch user profile after login
2. ✅ **User Profile Permissions** - Users can now access their own profiles  
3. ✅ **Server Management** - Created automated startup scripts
4. ✅ **Test Data** - Created test user generation script
5. ✅ **White Screen Issue** - Fixed ProtectedRoute loading states
6. ✅ **Registration 401** - Fixed UserViewSet permissions
7. ✅ **Port Conflicts** - Resolved server startup issues

**Details:** See [DEBUGGING_SUMMARY.md](DEBUGGING_SUMMARY.md)

---

## 🎯 Project Status

| Component | Status | Notes |
|-----------|--------|-------|
| Backend API | ✅ Operational | All endpoints working |
| Frontend | ✅ Operational | All pages rendering |
| Database | ✅ Ready | 8 test users configured |
| Authentication | ✅ Working | JWT tokens functional |
| Documentation | ✅ Complete | All guides written |

**Ready for:** Feature development and testing

---

## 🤝 Contributing

1. Follow the code style guidelines
2. Test your changes
3. Update documentation
4. Submit clear commit messages

---

## 📄 License

[Add your license here]

---

## 📞 Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [COMPLETE_DEBUGGING_GUIDE.md](COMPLETE_DEBUGGING_GUIDE.md)
3. Check [QUICK_START.md](QUICK_START.md) for common commands

---

## 🎉 Credits

**Built with:**
- Django & Django REST Framework
- React & Vite
- Material-UI
- Simple JWT

**Last Updated:** October 12, 2025

---

**⭐ The project is fully operational and ready for development!**
