# Frontend - Netlify Deployment

This frontend builds with Vite and is ready to deploy to Netlify.

Important: the frontend expects the backend API base URL to be set in the environment variable `VITE_API_URL`.

Example value for your backend (you already deployed to Render):
```
VITE_API_URL=https://cgjbcsc.onrender.com
```

Netlify setup (quick):
1. Push your code to GitHub.
2. On Netlify → New site → Import from Git → select your repo.
3. When prompted, set:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add an environment variable in Netlify site settings:
   - Key: `VITE_API_URL`
   - Value: `https://cgjbcsc.onrender.com`
5. Deploy the site. Once deployed, the frontend will call the backend at the configured URL.

Notes:
- `_redirects` is included in `public/` to ensure SPA routing works on Netlify.
- `netlify.toml` is present to specify build/publish defaults; you can still set env vars in the Netlify UI.
# Sewa Portal - Frontend# React + Vite



A modern React-based frontend application for the Sewa Portal built with Vite, Material-UI, and React Router.This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.



## 🚀 FeaturesCurrently, two official plugins are available:



### User Features- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh

- **Authentication**: Secure JWT-based login and registration- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

- **Dashboard**: Overview of applications and available services

- **Application Management**: ## React Compiler

  - Create new applications

  - Track application statusThe React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

  - Upload required documents

  - Download final documents## Expanding the ESLint configuration

- **Service Discovery**: Browse and apply for government services

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

### Admin Features
- **Admin Dashboard**: 
  - Statistics overview (users, applications, pending, completed)
  - Quick actions for common tasks
  - Recent applications view
- **Application Review**: 
  - Approve/reject applications
  - Add rejection reasons
  - Upload final documents
  - Email notifications
- **Service Management**: 
  - Create, edit, and delete services
  - Set fees and processing times
  - Manage service descriptions
- **User Management**: 
  - View all registered users
  - Edit user information and roles
  - Activate/deactivate users
  - Search and filter users

## 🛠️ Tech Stack

- **Framework**: React 18 with Vite
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **HTTP Client**: Axios with JWT interceptors
- **State Management**: React Context API
- **Date Handling**: date-fns
- **Token Management**: jwt-decode

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running at `http://localhost:8000`

## 🔧 Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable components
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── StatusBadge.jsx
│   │   └── layout/          # Layout components
│   │       ├── Navbar.jsx
│   │       └── Footer.jsx
│   ├── pages/
│   │   ├── auth/            # Authentication pages
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── user/            # User pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Applications.jsx
│   │   │   ├── ApplicationDetail.jsx
│   │   │   └── NewApplication.jsx
│   │   └── admin/           # Admin pages
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminApplicationReview.jsx
│   │       ├── AdminServices.jsx
│   │       └── AdminUsers.jsx
│   ├── services/            # API services
│   │   ├── axios.js         # Axios configuration
│   │   ├── authService.js   # Authentication service
│   │   └── apiService.js    # API endpoints
│   ├── context/             # React Context
│   │   └── AuthContext.jsx
│   ├── config/              # Configuration
│   │   └── api.js
│   ├── utils/               # Utility functions
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── .env                     # Environment variables
├── vite.config.js           # Vite configuration
└── package.json             # Dependencies
```

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. **Login**: Users authenticate with username and password
2. **Token Storage**: Access and refresh tokens are stored in localStorage
3. **Auto-Refresh**: Tokens are automatically refreshed on 401 errors
4. **Protected Routes**: Routes are protected based on authentication and role

### User Roles
- **User**: Regular users can view services and manage their applications
- **Admin**: Admins can review applications, manage services, and manage users

## 🎨 Theming

The application uses a custom Material-UI theme:

- **Primary Color**: `#667eea` (Purple-Blue)
- **Secondary Color**: `#764ba2` (Deep Purple)
- **Border Radius**: 12px for cards and papers, 8px for buttons
- **Typography**: Roboto font family

## 📡 API Integration

The frontend communicates with the Django REST API:

### Base URL
```
http://localhost:8000/api/
```

### Key Endpoints

#### Authentication
- `POST /auth/register/` - User registration
- `POST /auth/login/` - User login
- `POST /auth/token/refresh/` - Refresh access token
- `GET /auth/user/` - Get current user

#### Services
- `GET /services/` - List all services
- `POST /services/` - Create service (Admin only)
- `PUT /services/{id}/` - Update service (Admin only)
- `DELETE /services/{id}/` - Delete service (Admin only)

#### Applications
- `GET /applications/` - List user's applications
- `POST /applications/` - Create new application
- `GET /applications/{id}/` - Get application details
- `PATCH /applications/{id}/approve/` - Approve application (Admin)
- `PATCH /applications/{id}/reject/` - Reject application (Admin)

#### Documents
- `POST /user-documents/` - Upload user document
- `DELETE /user-documents/{id}/` - Delete user document
- `POST /final-documents/` - Upload final document (Admin)
- `GET /final-documents/{id}/download/` - Download final document

#### Users (Admin only)
- `GET /users/` - List all users
- `PUT /users/{id}/` - Update user

## 🚦 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### File Upload Guidelines

- **Allowed Formats**: PDF, JPEG, JPG, PNG
- **Maximum Size**: 5MB per file
- **Validation**: Client-side validation before upload

## 🔒 Security Features

- JWT token management with automatic refresh
- Protected routes based on authentication and roles
- Secure file upload validation
- CSRF protection through token-based authentication
- XSS protection through React's built-in escaping

## 🎯 Key Features by Role

### Regular Users
1. Register and login
2. Browse available services
3. Create new applications
4. Upload required documents
5. Track application status
6. Download approved documents

### Administrators
1. All user features
2. Review and approve/reject applications
3. Manage services (CRUD operations)
4. Manage users (view, edit, activate/deactivate)
5. Upload final documents for approved applications
6. View statistics and reports

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🐛 Troubleshooting

### Common Issues

1. **Cannot connect to API:**
   - Ensure backend is running at `http://localhost:8000`
   - Check `.env` file has correct `VITE_API_URL`

2. **Authentication errors:**
   - Clear localStorage and login again
   - Check token expiration

3. **File upload fails:**
   - Verify file size is under 5MB
   - Check file format (PDF, JPEG, PNG only)

4. **Build errors:**
   - Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Clear Vite cache: `rm -rf node_modules/.vite`

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000` |

## 🚀 Production Build

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Preview the build:**
   ```bash
   npm run preview
   ```

3. **Deploy:**
   - The `dist` folder contains the production build
   - Deploy to any static hosting service (Vercel, Netlify, etc.)
   - Ensure `VITE_API_URL` points to production backend

## 📄 License

This project is part of the Sewa Portal system.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For issues and questions:
- Check the [API Testing Guide](../API_TESTING_GUIDE.md)
- Review the [Backend README](../README.md)
- Open an issue on GitHub

## 🎉 Acknowledgments

- Material-UI team for the excellent component library
- Vite team for the blazing fast build tool
- React team for the amazing framework
