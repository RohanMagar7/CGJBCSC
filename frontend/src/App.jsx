import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Loading component
import LoadingSpinner from './components/common/LoadingSpinner';

// Eager load authentication pages (frequently accessed)
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Home from './pages/user/Home'

// Lazy load other pages for better initial load time
const Applications = lazy(() => import('./pages/user/Applications'));
const ApplicationDetail = lazy(() => import('./pages/user/ApplicationDetail'));
const Services = lazy(() => import('./pages/user/Services'));
const GovSchemesInfo = lazy(() => import('./pages/user/GovSchemesInfo'));
const GopinathScheme = lazy(() => import('./pages/user/GopinathScheme'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminApplications = lazy(() => import('./pages/admin/AdminApplications'));
const AdminGopinathApplications = lazy(() => import('./pages/admin/AdminGopinathApplications'));
const AdminGopinathApplicationReview = lazy(() => import('./pages/admin/AdminGopinathApplicationReview'));
const AdminApplicationReview = lazy(() => import('./pages/admin/AdminApplicationReview'));
const AdminServices = lazy(() => import('./pages/admin/AdminServices'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
const AdminGovSchemes = lazy(() => import('./pages/admin/AdminGovSchemes'));

// Component to handle root route based on user authentication
const RootRoute = () => {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) {
    return null;
  }
  
  // If user is logged in, redirect to their appropriate page
  if (user) {
    return isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/home" replace />;
  }
  
  // If not logged in, redirect to home page
  return <Navigate to="/home" replace />;
};

const theme = createTheme({
  palette: {
    primary: { main: '#667eea' },
    secondary: { main: '#764ba2' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { 
          textTransform: 'none', 
          borderRadius: 8,
          '@media (max-width:600px)': {
            fontSize: '0.875rem',
            padding: '6px 12px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { 
          borderRadius: 12,
          '@media (max-width:600px)': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { 
          borderRadius: 12,
          '@media (max-width:600px)': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            paddingLeft: 16,
            paddingRight: 16,
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh',
            width: '100%',
            overflowX: 'hidden',
          }}>
            <Navbar />
            <Box component="main" sx={{ 
              flexGrow: 1,
              width: '100%',
              overflowX: 'hidden',
            }}>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/" element={<RootRoute />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/dashboard" element={<Navigate to="/applications" replace />} />
                  <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
                  <Route path="/gov-schemes" element={<ProtectedRoute><GovSchemesInfo /></ProtectedRoute>} />
                  <Route path="/gopinath-scheme" element={<ProtectedRoute><GopinathScheme /></ProtectedRoute>} />
                  <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
                  <Route path="/applications/:id" element={<ProtectedRoute><ApplicationDetail /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/admin/applications" element={<ProtectedRoute adminOnly><AdminApplications /></ProtectedRoute>} />
                  <Route path="/admin/gopinath-applications" element={<ProtectedRoute adminOnly><AdminGopinathApplications /></ProtectedRoute>} />
                  <Route path="/admin/gopinath-applications/:id" element={<ProtectedRoute adminOnly><AdminGopinathApplicationReview /></ProtectedRoute>} />
                  <Route path="/admin/applications/:id" element={<ProtectedRoute adminOnly><AdminApplicationReview /></ProtectedRoute>} />
                  <Route path="/admin/services" element={<ProtectedRoute adminOnly><AdminServices /></ProtectedRoute>} />
                  <Route path="/admin/gov-schemes" element={<ProtectedRoute adminOnly><AdminGovSchemes /></ProtectedRoute>} />
                  <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
                  <Route path="/admin/announcements" element={<ProtectedRoute adminOnly><AdminAnnouncements /></ProtectedRoute>} />
                  <Route path="/admin/payments" element={<ProtectedRoute adminOnly><AdminPayments /></ProtectedRoute>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </Box>
            <Footer />
          </Box>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
