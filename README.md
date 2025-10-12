# Sewa Portal - Digital Service Application System

A Django REST Framework application for managing government service applications, document uploads, and application workflow management.

## 🎉 Project Status: FIXED AND FULLY OPERATIONAL

All critical bugs have been resolved. The project is ready for development and testing.

---

## 🚀 Quick Start

### 1. Start the Server
```bash
# Option A: Use the quick start script
./start_server.sh

# Option B: Manual start
source sys/bin/activate
cd sewa_portal
python manage.py runserver 0.0.0.0:8000
```

### 2. Access the Application
- **API Root:** http://localhost:8000/api/
- **Admin Panel:** http://localhost:8000/admin/
- **API Documentation:** See `API_TESTING_GUIDE.md`

### 3. Set Admin Password (First Time)
```bash
cd sewa_portal
python manage.py changepassword admin
```

---

## 📋 What Was Fixed

### Critical Issues Resolved ✅

1. **Custom User Model** - Added PermissionsMixin, is_staff, is_active fields
2. **ObjectIdField Issues** - Replaced with AutoField for SQLite compatibility
3. **URL Configuration** - Fixed services.urls → core.urls
4. **Permission Safety** - Added safe attribute access for anonymous users
5. **Migration Errors** - Regenerated clean migrations
6. **Database Schema** - Clean SQLite database with all tables

**Details:** See `PROJECT_FIXES_SUMMARY.md` for comprehensive fix documentation.

---

## 🏗️ Project Architecture

### Models
- **User** - Custom user model with role-based access (user/admin)
- **Service** - Service catalog (e.g., Passport, License)
- **UserApplication** - Application workflow with status tracking
- **UserDocument** - User-uploaded supporting documents
- **FinalDocument** - Admin-uploaded final documents

### API Endpoints
```
/api/users/              - User management (admin only)
/api/services/           - Service catalog
/api/applications/       - Application management
/api/documents/          - Document uploads
/api/final_documents/    - Final documents (admin)
/api/token/              - JWT authentication
/api/token/refresh/      - Token refresh
```

### Authentication
- JWT token-based authentication
- Role-based permissions (user/admin)
- Custom permission classes: IsAdminUser, IsOwnerOrAdmin

---

## 📚 Documentation

- **`PROJECT_FIXES_SUMMARY.md`** - Detailed list of all fixes applied
- **`API_TESTING_GUIDE.md`** - Complete API testing guide with curl examples
- **`start_server.sh`** - Quick start script

---

## 🔧 Development Commands

```bash
# Activate virtual environment
source sys/bin/activate

# Navigate to project
cd sewa_portal

# Run system check
python manage.py check

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run server
python manage.py runserver

# Django shell
python manage.py shell

# Run tests
python manage.py test
```

---

## 🧪 Testing the API

### Get Authentication Token
```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your_password"}'
```

### Create a Service
```bash
curl -X POST http://localhost:8000/api/services/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service_name": "Passport Service",
    "description": "Apply for passport"
  }'
```

**More examples:** See `API_TESTING_GUIDE.md`

---

## 📁 Project Structure

```
CGJBCSC/
├── sewa_portal/              # Django project
│   ├── manage.py
│   ├── db.sqlite3           # Database (auto-created)
│   ├── core/                # Main app
│   │   ├── models.py        # ✅ Fixed
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   ├── permissions.py   # ✅ Fixed
│   │   └── migrations/      # ✅ Regenerated
│   └── sewa_portal/         # Settings
│       ├── settings.py
│       ├── urls.py          # ✅ Fixed
│       └── wsgi.py
├── sys/                     # Virtual environment
│   └── bin/
│       └── python
├── frontend/                # (Empty - for future development)
├── start_server.sh          # ✅ Quick start script
├── PROJECT_FIXES_SUMMARY.md # ✅ Detailed fix documentation
└── API_TESTING_GUIDE.md     # ✅ API testing guide
```

---

## 🔐 Default Credentials

**Superuser:**
- Username: `admin`
- Phone: `1234567890`
- Password: *Set using `python manage.py changepassword admin`*

---

## 🌟 Features

### User Features
- Register and login with JWT tokens
- Browse available services
- Submit applications with document uploads
- Track application status (Pending/Approved/Rejected/Completed)
- Receive email notifications on status changes
- Download final documents

### Admin Features
- Manage service catalog
- View all user applications
- Approve/reject applications with reasons
- Upload final documents (auto-completes application)
- User management
- Full admin panel access

### System Features
- File validation (PDF, JPEG, PNG, max 5MB)
- Automatic status updates
- Email notifications
- Role-based access control
- RESTful API with JWT authentication

---

## 🔒 Security

### Current Configuration (Development)
- ⚠️ DEBUG = True (for development)
- ⚠️ Default SECRET_KEY (change for production)
- ⚠️ SQLite database (use PostgreSQL for production)
- ⚠️ Console email backend (configure SMTP for production)

### Production Checklist
- [ ] Set DEBUG = False
- [ ] Change SECRET_KEY
- [ ] Configure ALLOWED_HOSTS
- [ ] Use PostgreSQL/MySQL
- [ ] Enable HTTPS settings
- [ ] Configure real email backend
- [ ] Set up static/media file serving
- [ ] Enable CORS if needed
- [ ] Set up monitoring and logging

---

## 🛠️ Technology Stack

- **Backend:** Django 5.2.7
- **API:** Django REST Framework 3.16.1
- **Authentication:** SimpleJWT 5.5.1
- **Database:** SQLite3 (dev) / PostgreSQL (recommended for production)
- **Python:** 3.12

---

## 📝 Application Workflow

```
1. User registers/logs in
2. User browses services
3. User submits application
4. User uploads supporting documents
5. Admin reviews application
6. Admin approves/rejects (email sent)
7. If approved: Admin uploads final document
8. Application auto-completes (email sent)
9. User downloads final document
```

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check for errors
python manage.py check

# Check migrations
python manage.py showmigrations

# Re-apply migrations
python manage.py migrate
```

### "No such table" errors
```bash
# Delete database and recreate
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

### Permission denied errors
```bash
# Check file permissions
chmod +x start_server.sh
```

### Import errors
```bash
# Activate virtual environment
source sys/bin/activate

# Check installed packages
pip list
```

---

## 📞 Support

For issues or questions:
1. Check `PROJECT_FIXES_SUMMARY.md` for known issues
2. Review `API_TESTING_GUIDE.md` for API usage
3. Run `python manage.py check` for system diagnostics

---

## 🎯 Next Steps

1. **Set admin password:** `python manage.py changepassword admin`
2. **Start server:** `./start_server.sh`
3. **Test API:** Follow examples in `API_TESTING_GUIDE.md`
4. **Develop frontend:** Use the `/api/` endpoints
5. **Write tests:** Add unit tests in `core/tests.py`
6. **Deploy:** Follow production checklist above

---

## ✅ Verification

Run these commands to verify everything works:

```bash
# System check
python manage.py check
# Expected: System check identified no issues

# Show tables
python manage.py dbshell
# Then: .tables (SQLite) or \dt (PostgreSQL)

# Test API
curl http://localhost:8000/api/services/
# Expected: {"detail":"Authentication credentials were not provided."}
# (This is correct - authentication is required)
```

---

## 📄 License

[Add your license here]

---

## 👥 Contributors

[Add contributors here]

---

**Last Updated:** October 12, 2025  
**Status:** ✅ All issues fixed and verified  
**Version:** 1.0.0
