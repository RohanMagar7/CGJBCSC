# Sewa Portal - Quick Start Guide

## 🚀 Quick Start

### Backend Setup

1. **Activate Virtual Environment:**
   ```bash
   cd CGJBCSC
   source sys/bin/activate
   ```

2. **Navigate to Django Project:**
   ```bash
   cd sewa_portal
   ```

3. **Start Backend Server:**
   ```bash
   python manage.py runserver
   ```
   
   Backend will be available at: `http://localhost:8000`

### Frontend Setup

1. **Open New Terminal and Navigate to Frontend:**
   ```bash
   cd CGJBCSC/frontend
   ```

2. **Install Dependencies (First Time Only):**
   ```bash
   npm install
   ```

3. **Start Frontend Development Server:**
   ```bash
   npm run dev
   ```
   
   Frontend will be available at: `http://localhost:5173`

## 📝 Default Admin Credentials

If you need to create an admin user:

```bash
cd sewa_portal
python manage.py createsuperuser
```

Follow the prompts to create your admin account.

## 🔗 Application URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/

## 📚 Key Pages

### User Pages
- **Login**: http://localhost:5173/login
- **Register**: http://localhost:5173/register
- **Dashboard**: http://localhost:5173/
- **Applications**: http://localhost:5173/applications
- **New Application**: http://localhost:5173/applications/new

### Admin Pages
- **Admin Dashboard**: http://localhost:5173/admin
- **Manage Services**: http://localhost:5173/admin/services
- **Manage Users**: http://localhost:5173/admin/users

## 🧪 Testing the Application

### 1. Register a New User
- Go to http://localhost:5173/register
- Fill in the registration form
- Login with your credentials

### 2. Browse Services
- After login, you'll see the dashboard
- Available services are displayed as cards
- Click on a service to apply

### 3. Create an Application
- Click "New Application" or click on a service
- Select the service and submit
- Upload required documents

### 4. Admin Functions (Admin users only)
- Go to http://localhost:5173/admin
- Review pending applications
- Approve/reject applications
- Manage services and users

## 🛠️ Troubleshooting

### Backend Issues

**Port Already in Use:**
```bash
# Kill process using port 8000
lsof -ti:8000 | xargs kill -9
# Then restart
python manage.py runserver
```

**Database Issues:**
```bash
# Re-run migrations
python manage.py migrate
```

### Frontend Issues

**Port Already in Use:**
```bash
# Kill process using port 5173
lsof -ti:5173 | xargs kill -9
# Then restart
npm run dev
```

**Module Not Found:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

**Clear Cache:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## 📦 Project Structure

```
CGJBCSC/
├── sewa_portal/          # Django Backend
│   ├── core/             # Main app with models, views, serializers
│   ├── sewa_portal/      # Project settings
│   ├── db.sqlite3        # Database
│   └── manage.py         # Django management script
│
├── frontend/             # React Frontend
│   ├── src/              # Source code
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── context/      # React context
│   │   └── config/       # Configuration
│   ├── .env              # Environment variables
│   └── package.json      # Dependencies
│
└── sys/                  # Python virtual environment
```

## 🔐 Security Notes

- Never commit `.env` files with sensitive data
- Change `SECRET_KEY` in production
- Use HTTPS in production
- Set `DEBUG = False` in production
- Configure CORS properly for production domains

## 📖 Documentation

- **Backend README**: `sewa_portal/README.md`
- **Frontend README**: `frontend/README.md`
- **API Testing Guide**: `API_TESTING_GUIDE.md`
- **Project Fixes**: `PROJECT_FIXES_SUMMARY.md`

## 🎯 Features Checklist

### User Features
- ✅ User registration and login
- ✅ JWT authentication
- ✅ View available services
- ✅ Create applications
- ✅ Upload documents
- ✅ Track application status
- ✅ Download approved documents

### Admin Features
- ✅ Admin dashboard with statistics
- ✅ Review applications
- ✅ Approve/reject applications
- ✅ Upload final documents
- ✅ Manage services (CRUD)
- ✅ Manage users
- ✅ Search and filter

## 🌐 Browser Compatibility

Tested and working on:
- ✅ Chrome 120+
- ✅ Firefox 120+
- ✅ Safari 17+
- ✅ Edge 120+

## 📱 Responsive Design

The application is fully responsive:
- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (320px - 767px)

## 🚀 Deployment

### Backend Deployment (Example: Railway/Render)
1. Set environment variables
2. Configure PostgreSQL database
3. Run migrations
4. Collect static files
5. Set `DEBUG = False`

### Frontend Deployment (Example: Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set `VITE_API_URL` to production backend URL

## 💡 Tips

1. **Development**: Keep both servers running in separate terminals
2. **Testing**: Use the Django admin panel to create test data
3. **Debugging**: Check browser console and terminal logs for errors
4. **API Testing**: Use Postman or the provided API testing guide

## 🆘 Getting Help

If you encounter issues:

1. Check the terminal logs for errors
2. Review the documentation in the `README.md` files
3. Check `PROJECT_FIXES_SUMMARY.md` for known issues
4. Verify both servers are running
5. Clear browser cache and localStorage

## 🎉 Success!

If you see the login page at http://localhost:5173/login, your setup is complete!

Happy coding! 🚀
