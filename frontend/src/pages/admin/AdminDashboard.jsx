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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
} from '@mui/material';
import {
  People,
  Assignment,
  CheckCircle,
  HourglassEmpty,
  AdminPanelSettings,
  Visibility,
} from '@mui/icons-material';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
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
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: <People sx={{ fontSize: 40 }} />,
      color: 'primary.main',
    },
    {
      title: 'Total Applications',
      value: applications.length,
      icon: <Assignment sx={{ fontSize: 40 }} />,
      color: 'info.main',
    },
    {
      title: 'Pending Reviews',
      value: applications.filter((app) => app.status === 'Pending').length,
      icon: <HourglassEmpty sx={{ fontSize: 40 }} />,
      color: 'warning.main',
    },
    {
      title: 'Completed',
      value: applications.filter((app) => app.status === 'Completed').length,
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
      color: 'success.main',
    },
  ];

  const pendingApplications = applications.filter((app) => app.status === 'Pending');
  const recentApplications = [...applications].sort(
    (a, b) => new Date(b.submitted_at) - new Date(a.submitted_at)
  ).slice(0, 10);

  const getServiceName = (serviceId) => {
    const service = services.find((s) => s.service_id === serviceId);
    return service?.service_name || 'Unknown';
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.user_id === userId);
    return user?.username || 'Unknown';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <AdminPanelSettings sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4">Admin Dashboard</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Manage users, applications, and services
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {stat.value}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => navigate('/admin/services')}
          >
            Manage Services
          </Button>
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => navigate('/admin/applications')}
          >
            Review Applications
          </Button>
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => navigate('/admin/users')}
          >
            Manage Users
          </Button>
        </Grid>
      </Grid>

      {/* Applications Table with Tabs */}
      <Paper elevation={2}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`Pending (${pendingApplications.length})`} />
          <Tab label="Recent Applications" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {activeTab === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>User</strong></TableCell>
                    <TableCell><strong>Service</strong></TableCell>
                    <TableCell><strong>Submitted</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          No pending applications
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingApplications.map((app) => (
                      <TableRow key={app.application_id}>
                        <TableCell>#{app.application_id}</TableCell>
                        <TableCell>{getUserName(app.user)}</TableCell>
                        <TableCell>{getServiceName(app.service)}</TableCell>
                        <TableCell>{new Date(app.submitted_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <StatusBadge status={app.status} />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => navigate(`/admin/applications/${app.application_id}`)}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {activeTab === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>User</strong></TableCell>
                    <TableCell><strong>Service</strong></TableCell>
                    <TableCell><strong>Submitted</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentApplications.map((app) => (
                    <TableRow key={app.application_id}>
                      <TableCell>#{app.application_id}</TableCell>
                      <TableCell>{getUserName(app.user)}</TableCell>
                      <TableCell>{getServiceName(app.service)}</TableCell>
                      <TableCell>{new Date(app.submitted_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <StatusBadge status={app.status} />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => navigate(`/admin/applications/${app.application_id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminDashboard;
