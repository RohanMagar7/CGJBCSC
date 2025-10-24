import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Divider,
  IconButton,
  alpha,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  People,
  Assignment,
  CheckCircle,
  HourglassEmpty,
  AdminPanelSettings,
  AccountBalance,
  Visibility,
  TrendingUp,
  Category,
  ArrowForward,
  ManageAccounts,
  Settings,
  Description,
  CloudUpload,
} from '@mui/icons-material';
import apiService from '../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

const AdminDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backupLoading, setBackupLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appsRes, usersRes, servicesRes] = await Promise.all([
        apiService.getApplications(),
        apiService.getUsers(),
        apiService.getServices(),
      ]);
      setApplications(appsRes.data);
      setUsers(usersRes.data);
      setServices(servicesRes.data);
        // Try to fetch gov schemes count for admin quick action (non-blocking)
        try {
          const schemesRes = await apiService.getGovSchemes?.();
          setSchemes(schemesRes?.data || []);
        } catch (e) {
          // ignore, optional feature
          setSchemes([]);
        }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const response = await apiService.createBackup();
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: `Backup created successfully: ${response.data.backup?.name || 'backup file'}`,
          severity: 'success',
        });
      } else {
        // Check if it's a development environment error
        const isDevelopmentError = response.data.message?.includes('DATABASE_URL not set') || 
                                   response.data.message?.includes('Production database not configured');
        
        setSnackbar({
          open: true,
          message: isDevelopmentError 
            ? '⚠️ Backups only work in production with PostgreSQL. This is a development environment using SQLite.'
            : response.data.message || 'Failed to create backup',
          severity: isDevelopmentError ? 'warning' : 'error',
        });
      }
    } catch (err) {
      console.error('Backup error:', err);
      
      // Check if it's a development environment error
      const errorMessage = err.response?.data?.message || '';
      const isDevelopmentError = errorMessage.includes('DATABASE_URL not set') || 
                                 errorMessage.includes('Production database not configured');
      
      setSnackbar({
        open: true,
        message: isDevelopmentError 
          ? '⚠️ Backups only work in production with PostgreSQL. This is a development environment using SQLite.'
          : errorMessage || 'Failed to create backup. Please try again.',
        severity: isDevelopmentError ? 'warning' : 'error',
      });
    } finally {
      setBackupLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#667eea',
      bgColor: alpha('#667eea', 0.1),
      change: '+12%',
      link: '/admin/users',
    },
    {
      title: 'Total Applications',
      value: applications.length,
      icon: <Assignment sx={{ fontSize: 40 }} />,
      color: '#f093fb',
      bgColor: alpha('#f093fb', 0.1),
      change: '+18%',
      link: '/admin/applications',
    },
    {
      title: 'Pending Reviews',
      value: applications.filter((app) => app.status === 'Pending').length,
      icon: <HourglassEmpty sx={{ fontSize: 40 }} />,
      color: '#ffa726',
      bgColor: alpha('#ffa726', 0.1),
      urgent: true,
      link: '/admin/applications',
    },
    {
      title: 'Active Services',
      value: services.length,
      icon: <Category sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      bgColor: alpha('#4caf50', 0.1),
      change: '+3',
      link: '/admin/services',
    },
  ];

  const pendingApplications = applications.filter((app) => app.status === 'Pending');
  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
    .slice(0, 5);

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.date_joined || 0) - new Date(a.date_joined || 0))
    .slice(0, 5);

  const getServiceName = (serviceId) => {
    const service = services.find((s) => s.service_id === serviceId);
    return service?.service_name || 'Unknown';
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.user_id === userId);
    return user?.username || 'Unknown';
  };

  const quickActions = [
    {
      title: 'Manage Applications',
      description: 'Review and process pending applications',
      icon: <Assignment sx={{ fontSize: 40 }} />,
      color: '#667eea',
      bgColor: alpha('#667eea', 0.1),
      link: '/admin/applications',
      count: pendingApplications.length,
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: <ManageAccounts sx={{ fontSize: 40 }} />,
      color: '#f093fb',
      bgColor: alpha('#f093fb', 0.1),
      link: '/admin/users',
      count: users.length,
    },
    {
      title: 'Manage Services',
      description: 'Add, edit, or remove services',
      icon: <Settings sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      bgColor: alpha('#4caf50', 0.1),
      link: '/admin/services',
      count: services.length,
    },
    {
      title: 'Manage Gov Schemes',
      description: 'Create and manage government schemes visible to users',
      icon: <AccountBalance sx={{ fontSize: 40 }} />,
      color: '#2196f3',
      bgColor: alpha('#2196f3', 0.08),
      link: '/admin/gov-schemes',
      count: schemes.length,
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Hero Header */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                <AdminPanelSettings sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  Admin Dashboard
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Manage and monitor your digital sewa portal
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 24px ${alpha(stat.color, 0.2)}`,
                    borderColor: stat.color,
                  },
                }}
                onClick={() => navigate(stat.link)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: stat.bgColor,
                        color: stat.color,
                        display: 'flex',
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', color: stat.color }}>
                        {stat.value}
                      </Typography>
                      {stat.change && (
                        <Chip
                          label={stat.change}
                          size="small"
                          sx={{
                            mt: 0.5,
                            bgcolor: alpha(stat.color, 0.1),
                            color: stat.color,
                            fontWeight: 'bold',
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                  <Typography variant="body1" fontWeight="500" color="text.secondary">
                    {stat.title}
                  </Typography>
                  {stat.urgent && stat.value > 0 && (
                    <Chip
                      label="Needs Attention"
                      size="small"
                      color="warning"
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={3}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 16px ${alpha(action.color, 0.2)}`,
                      borderColor: action.color,
                    },
                  }}
                  onClick={() => navigate(action.link)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 2,
                        bgcolor: action.bgColor,
                        color: action.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                      }}
                    >
                      {action.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {action.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        label={`${action.count} items`}
                        size="small"
                        sx={{ bgcolor: action.bgColor, color: action.color, fontWeight: 'bold' }}
                      />
                      <IconButton size="small" sx={{ color: action.color }}>
                        <ArrowForward />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Database Backup Section */}
        <Box sx={{ mb: 4 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 2,
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CloudUpload sx={{ fontSize: 32 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                      Database Backup (Production Only)
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      Create a backup of the PostgreSQL database to Dropbox
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 0.5, display: 'block' }}>
                      ⚠️ Requires DATABASE_URL (Production) • Auto-backup every 2 days
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={backupLoading ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
                  disabled={backupLoading}
                  onClick={handleBackup}
                  sx={{
                    bgcolor: 'white',
                    color: '#667eea',
                    px: 3,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    },
                    '&:disabled': {
                      bgcolor: 'rgba(255, 255, 255, 0.5)',
                    },
                  }}
                >
                  {backupLoading ? 'Creating Backup...' : 'Create Backup Now'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Recent Applications */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Recent Applications
            </Typography>
            <Button
              variant="outlined"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/admin/applications')}
              sx={{ borderRadius: 2 }}
            >
              View All
            </Button>
          </Box>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha('#667eea', 0.05) }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Application ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Service</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Submitted</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Description sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No applications yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentApplications.map((app) => (
                      <TableRow
                        key={app.application_id}
                        sx={{
                          '&:hover': { bgcolor: alpha('#667eea', 0.02) },
                          cursor: 'pointer',
                        }}
                        onClick={() => navigate(`/admin/applications/${app.application_id}`)}
                      >
                        <TableCell>
                          <Chip label={`#${app.application_id}`} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>{getUserName(app.user)}</TableCell>
                        <TableCell>{getServiceName(app.service)}</TableCell>
                        <TableCell>
                          {new Date(app.submitted_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={app.status} />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/applications/${app.application_id}`);
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>

        {/* Recent Users */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Recent Users
            </Typography>
            <Button
              variant="outlined"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/admin/users')}
              sx={{ borderRadius: 2 }}
            >
              View All
            </Button>
          </Box>
          <Grid container spacing={2}>
            {recentUsers.slice(0, 4).map((user) => (
              <Grid item xs={12} sm={6} md={3} key={user.user_id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      borderColor: 'primary.light',
                    },
                  }}
                  onClick={() => navigate('/admin/users')}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: user.role === 'Admin' ? 'error.main' : 'primary.main',
                        margin: '0 auto',
                        mb: 2,
                      }}
                    >
                      {user.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      {user.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {user.email || 'No email'}
                    </Typography>
                    <Chip
                      label={user.role || 'User'}
                      size="small"
                      color={user.role === 'Admin' ? 'error' : 'primary'}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;
