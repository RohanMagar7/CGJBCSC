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
import Home from './pages/user/Home'

// Lazy load other pages for better initial load time
const Applications = lazy(() => import('./pages/user/Applications'));
const ApplicationDetail = lazy(() => import('./pages/user/ApplicationDetail'));
const Services = lazy(() => import('./pages/user/Services'));
const GovSchemesInfo = lazy(() => import('./pages/user/GovSchemesInfo'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminApplications = lazy(() => import('./pages/admin/AdminApplications'));
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
    mode: 'light',
    primary: {
      main: '#5E50F9', // A vibrant, modern purple
      light: '#8B82FF',
      dark: '#4A40C7',
    },
    secondary: {
      main: '#00C49F', // A contrasting teal for accents
      light: '#52F7CF',
      dark: '#00937E',
    },
    background: {
      default: '#f4f7f9', // A very light, clean gray
      paper: '#ffffff',
    },
    text: {
      primary: '#2A3342', // A softer, more readable dark gray
      secondary: '#5A6474',
    },
    success: {
      main: '#28a745',
    },
    error: {
      main: '#dc3545',
    },
    warning: {
      main: '#ffc107',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: { fontWeight: 700, fontSize: '2.5rem', lineHeight: 1.2 },
    h2: { fontWeight: 700, fontSize: '2rem', lineHeight: 1.2 },
    h3: { fontWeight: 600, fontSize: '1.75rem', lineHeight: 1.2 },
    h4: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.2 },
    h5: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.2 },
    h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.2 },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12, // A more modern, rounded look
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          boxShadow: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)',
          }
        },
        containedPrimary: {
          color: '#fff',
        }
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: { 
          borderRadius: 16,
          border: '1px solid #e0e0e0',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            transform: 'translateY(-4px)',
            borderColor: 'transparent',
          }
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: { 
          borderRadius: 16,
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: 'transparent',
      },
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #e0e0e0',
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body {
          scrollbar-width: thin;
          scrollbar-color: #c1c1c1 #f1f1f1;
        }
        body::-webkit-scrollbar {
          width: 8px;
        }
        body::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        body::-webkit-scrollbar-thumb {
          background-color: #c1c1c1;
          border-radius: 10px;
          border: 2px solid #f1f1f1;
        }
      `,
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
                  <Route path="/" element={<RootRoute />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/dashboard" element={<Navigate to="/applications" replace />} />
                  <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
                  <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
                  <Route path="/applications/:id" element={<ProtectedRoute><ApplicationDetail /></ProtectedRoute>} />
                  <Route path="/gov-schemes" element={<ProtectedRoute><GovSchemesInfo /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/admin/applications" element={<ProtectedRoute adminOnly><AdminApplications /></ProtectedRoute>} />
                  <Route path="/admin/applications/:id" element={<ProtectedRoute adminOnly><AdminApplicationReview /></ProtectedRoute>} />
                  <Route path="/admin/services" element={<ProtectedRoute adminOnly><AdminServices /></ProtectedRoute>} />
                  <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
                  <Route path="/admin/announcements" element={<ProtectedRoute adminOnly><AdminAnnouncements /></ProtectedRoute>} />
                  <Route path="/admin/gov-schemes" element={<ProtectedRoute adminOnly><AdminGovSchemes /></ProtectedRoute>} />
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
