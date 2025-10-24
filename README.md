# 📘 CGJBCSC Digital Sewa Portal

**Complete Digital Service Application & Government Schemes Management System**  
Built with Django REST Framework + React + Vite + JWT Authentication + Dropbox Storage

[![Status](https://img.shields.io/badge/status-production--ready-brightgreen)]()
[![Django](https://img.shields.io/badge/django-5.2.7-green)]()
[![React](https://img.shields.io/badge/react-19.1.1-blue)]()
[![Vite](https://img.shields.io/badge/vite-7.1.7-purple)]()
[![Deployment](https://img.shields.io/badge/deploy-Render%20%2B%20Netlify-orange)]()

---

## 🌟 Live Demo

- 🌐 **Frontend:** [https://cgjbcsc.netlify.app](https://cgjbcsc.netlify.app)
- 🔌 **Backend API:** [https://cgjbcsc.onrender.com](https://cgjbcsc.onrender.com)
- � **Admin Panel:** [https://cgjbcsc.onrender.com/admin](https://cgjbcsc.onrender.com/admin)

---

## �🚀 Quick Start (Local Development)

```bash
# Clone repository
git clone https://github.com/RohanMagar7/CGJBCSC.git
cd CGJBCSC

# Backend setup
cd sewa_portal
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

**Access:**
- 🌐 Frontend: http://localhost:5173
- 🔌 Backend API: http://localhost:8000
- 👤 Admin Panel: http://localhost:8000/admin

---

## 📑 Documentation Structure

| Document | Purpose | Audience |
|----------|---------|----------|
| **README.md** (this file) | Project overview & setup | Everyone |
| **DEPLOYMENT_GUIDE.md** | Production deployment steps | DevOps/Admins |
| **API_DOCUMENTATION.md** | API endpoints reference | Developers |

---

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Overview](#api-overview)
- [Authentication](#authentication)
- [Deployment](#deployment)
- [Development](#development)
- [Contributing](#contributing)

---

## ✨ Features

### 👥 User Features
- ✅ User registration & authentication
- ✅ Personal dashboard with application tracking
- ✅ Browse and apply for government services
- ✅ Upload supporting documents (stored in Dropbox)
- ✅ Real-time application status updates
- ✅ Payment tracking and management
- ✅ View active government schemes with details
- ✅ Download final documents

### 🔐 Admin Features
- ✅ Complete user management
- ✅ Service catalog management
- ✅ Application review & approval workflow
- ✅ Document verification system
- ✅ Upload final documents to users
- ✅ Payment management & tracking
- ✅ Payment statistics dashboard
- ✅ Government schemes CRUD (Create/Read/Update/Delete)
- ✅ System announcements management
- ✅ UPI/QR code payment settings

### 🎯 Government Schemes Module (NEW)
- ✅ Admin can create/edit/delete government schemes
- ✅ Categorized schemes (Education, Health, Agriculture, etc.)
- ✅ Detailed scheme information (eligibility, benefits, documents)
- ✅ Public view for active schemes
- ✅ Search and filter by category
- ✅ Step-by-step application guide
- ✅ Official website links

### 🛡️ Technical Features
- ✅ JWT-based authentication with token refresh
- ✅ Role-based access control (User/Admin)
- ✅ RESTful API with Django REST Framework
- ✅ Dropbox cloud storage for documents
- ✅ CORS configured for production
- ✅ Optimized database queries with indexes
- ✅ Frontend caching for better performance
- ✅ Code splitting & lazy loading
- ✅ Responsive Material-UI design
- ✅ Protected routes on frontend
- ✅ Secure file upload validation

---

## 🛠️ Technology Stack

### Backend
- **Framework:** Django 5.2.7
- **API:** Django REST Framework 3.16.1
- **Authentication:** djangorestframework-simplejwt 5.5.1
- **Database:** PostgreSQL (production) / SQLite3 (development)
- **Storage:** Dropbox via django-storages 1.14.4
- **Server:** Gunicorn 21.2.0 + WhiteNoise 6.5.0
- **CORS:** django-cors-headers 4.9.0

### Frontend
- **Framework:** React 19.1.1
- **Build Tool:** Vite 7.1.7
- **UI Library:** Material-UI 7.3.4
- **Routing:** React Router 7.9.4
- **HTTP Client:** Axios 1.12.2
- **State Management:** React Context API + Local State
- **Auth:** JWT with localStorage & token refresh

### DevOps & Deployment
- **Backend Hosting:** Render.com
- **Frontend Hosting:** Netlify
- **Database:** Render PostgreSQL
- **File Storage:** Dropbox Cloud
- **CI/CD:** Git-based auto-deploy

---

## 📁 Project Structure

```
CGJBCSC/
├── frontend/                  # React + Vite Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   │   ├── admin/         # Admin pages (protected)
│   │   │   ├── auth/          # Login/Register
│   │   │   └── user/          # User pages
│   │   ├── services/          # API service layer
│   │   ├── context/           # React Context providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Helper functions
│   │   └── config/            # Configuration files
│   ├── public/                # Static assets
│   └── package.json
│
└── sewa_portal/               # Django Backend
    ├── core/                  # Main Django app
    │   ├── models.py          # Database models
    │   ├── serializers.py     # DRF serializers
    │   ├── views.py           # API viewsets
    │   ├── urls.py            # API routes
    │   ├── admin.py           # Django admin config
    │   ├── permissions.py     # Custom permissions
    │   └── migrations/        # Database migrations
    ├── sewa_portal/           # Project settings
    │   ├── settings.py        # Django configuration
    │   └── urls.py            # Root URL config
    ├── requirements.txt       # Python dependencies
    ├── render.yaml           # Render deployment config
    └── manage.py             # Django CLI
```

---

## 📦 Installation

### Prerequisites
- Python 3.12+
- Node.js 18+
- npm or yarn
- Git

### Step 1: Clone Repository

```bash
git clone https://github.com/RohanMagar7/CGJBCSC.git
cd CGJBCSC
```

### Step 2: Backend Setup

```bash
cd sewa_portal

# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (admin account)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Backend will be available at: http://localhost:8000

### Step 3: Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:5173

---

## ⚙️ Configuration

### Backend Environment Variables

Create `.env` file in `sewa_portal/` directory:

```env
# Django Settings
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Database (Production)
DATABASE_URL=postgresql://user:password@host:port/dbname

# Dropbox Storage
DROPBOX_APP_KEY=your-app-key
DROPBOX_APP_SECRET=your-app-secret
DROPBOX_REFRESH_TOKEN=your-refresh-token

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Security (Production only)
SECURE_SSL_REDIRECT=False
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False
```

### Frontend Environment Variables

Edit `frontend/public/env.js`:

```javascript
window.__env = {
  VITE_API_URL: 'http://127.0.0.1:8000'  // Backend API URL
};
```

---

## 🔌 API Overview

### Base URL
- **Development:** `http://localhost:8000/api/`
- **Production:** `https://cgjbcsc.onrender.com/api/`

### Main Endpoints

#### Authentication
- `POST /api/token/` - Login (get access & refresh tokens)
- `POST /api/token/refresh/` - Refresh access token

#### Users
- `GET /api/users/` - List users (admin only)
- `POST /api/users/` - Register new user
- `GET /api/users/{id}/` - Get user details
- `PATCH /api/users/{id}/` - Update user
- `DELETE /api/users/{id}/` - Delete user (admin only)

#### Services
- `GET /api/services/` - List all services
- `POST /api/services/` - Create service (admin only)
- `GET /api/services/{id}/` - Get service details
- `PATCH /api/services/{id}/` - Update service (admin only)
- `DELETE /api/services/{id}/` - Delete service (admin only)

#### Applications
- `GET /api/applications/` - List applications
- `POST /api/applications/` - Create new application
- `GET /api/applications/{id}/` - Get application details
- `POST /api/applications/{id}/update_status/` - Update status (admin only)

#### Government Schemes (NEW)
- `GET /api/gov-schemes/` - List schemes (public: active only)
- `POST /api/gov-schemes/` - Create scheme (admin only)
- `GET /api/gov-schemes/{id}/` - Get scheme details
- `PATCH /api/gov-schemes/{id}/` - Update scheme (admin only)
- `DELETE /api/gov-schemes/{id}/` - Delete scheme (admin only)

#### Payments
- `GET /api/payments/` - List payments
- `POST /api/payments/` - Create payment
- `POST /api/payments/{id}/mark_completed/` - Mark as completed (admin)
- `GET /api/payments/statistics/` - Payment statistics (admin)

#### Announcements
- `GET /api/announcements/` - List announcements
- `POST /api/announcements/` - Create announcement (admin only)

**Full API documentation:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 🔐 Authentication

### JWT Token Flow

1. **Login:** POST to `/api/token/` with credentials
   ```json
   {
     "username": "testuser",
     "password": "test123"
   }
   ```

2. **Response:** Receive access & refresh tokens
   ```json
   {
     "access": "eyJ0eXAiOiJKV1QiLCJhb...",
     "refresh": "eyJ0eXAiOiJKV1QiLCJhb...",
     "user": {...}
   }
   ```

3. **Use Token:** Include in Authorization header
   ```
   Authorization: Bearer <access_token>
   ```

4. **Token Refresh:** When access token expires
   ```json
   POST /api/token/refresh/
   {
     "refresh": "your_refresh_token"
   }
   ```

### User Roles

- **User:** Can create applications, upload documents, view own data
- **Admin:** Full access to all features + management capabilities

---

## 🚀 Deployment

### Backend (Render.com)

1. **Create Web Service**
   - Connect GitHub repository
   - Branch: `deploy`
   - Root directory: `sewa_portal`

2. **Build Settings**
   ```bash
   Build Command: pip install -r requirements.txt && python manage.py migrate --noinput && python manage.py collectstatic --noinput
   Start Command: gunicorn sewa_portal.wsgi:application --bind 0.0.0.0:$PORT
   ```

3. **Environment Variables**
   ```
   DJANGO_SECRET_KEY=<generate-secure-key>
   DJANGO_DEBUG=False
   DJANGO_ALLOWED_HOSTS=cgjbcsc.onrender.com
   DATABASE_URL=<postgres-url>
   DROPBOX_APP_KEY=<your-key>
   DROPBOX_APP_SECRET=<your-secret>
   DROPBOX_REFRESH_TOKEN=<your-token>
   SECURE_SSL_REDIRECT=True
   SESSION_COOKIE_SECURE=True
   CSRF_COOKIE_SECURE=True
   CORS_ALLOWED_ORIGINS=https://cgjbcsc.netlify.app
   ```

4. **Add PostgreSQL Database**
   - Create database in Render
   - Copy DATABASE_URL to environment variables

### Frontend (Netlify)

1. **Create New Site**
   - Connect GitHub repository
   - Branch: `deploy`
   - Base directory: `frontend`

2. **Build Settings**
   ```bash
   Build command: npm run build
   Publish directory: dist
   ```

3. **Update API URL**
   - Edit `frontend/public/env.js`:
   ```javascript
   window.__env = {
     VITE_API_URL: 'https://cgjbcsc.onrender.com'
   };
   ```

4. **Deploy**
   - Commit and push changes
   - Netlify will auto-deploy

### Post-Deployment

1. Create superuser via Render shell:
   ```bash
   python manage.py createsuperuser
   ```

2. Test all endpoints

3. Add some initial data via Django admin

---

## 🛠️ Development

### Database Migrations

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# View migration status
python manage.py showmigrations
```

### Running Tests

```bash
# Backend tests
cd sewa_portal
python manage.py test

# Frontend tests
cd frontend
npm test
```

### Code Quality

```bash
# Frontend linting
cd frontend
npm run lint

# Backend linting (if configured)
cd sewa_portal
flake8 .
```

### Database Management

```bash
# Access Django shell
python manage.py shell

# Create database backup
python manage.py dumpdata > backup.json

# Load database backup
python manage.py loaddata backup.json

# Access database directly
python manage.py dbshell
```

---

## 📊 Database Schema

### Main Models

- **User:** Custom user model with role field (user/admin)
- **Service:** Government services catalog
- **RequiredDocument:** Required documents for each service
- **UserApplication:** User application submissions
- **UserDocument:** Uploaded user documents (Dropbox)
- **FinalDocument:** Admin uploaded final documents
- **Payment:** Payment tracking and management
- **PaymentSettings:** UPI/QR code settings
- **Announcement:** System announcements
- **GovScheme:** Government schemes information (NEW)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/YourFeature`
3. Commit changes: `git commit -m 'Add YourFeature'`
4. Push to branch: `git push origin feature/YourFeature`
5. Submit a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Rohan Magar**
- GitHub: [@RohanMagar7](https://github.com/RohanMagar7)
- Project: [CGJBCSC](https://github.com/RohanMagar7/CGJBCSC)

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact via project repository

---

## 🙏 Acknowledgments

- Django REST Framework team
- React and Vite communities
- Material-UI team
- All open-source contributors

---

**⭐ Star this repository if you find it helpful!**

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
