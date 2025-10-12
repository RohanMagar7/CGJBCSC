import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Paper,
  Alert,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ListAlt,
  Description,
  Add,
  TrendingUp,
} from '@mui/icons-material';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const [services, setServices] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, applicationsRes] = await Promise.all([
        apiService.getServices(),
        apiService.getApplications(),
      ]);
      setServices(servicesRes.data);
      setApplications(applicationsRes.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Applications',
      value: applications.length,
      icon: <ListAlt sx={{ fontSize: 40 }} />,
      color: 'primary.main',
    },
    {
      title: 'Pending',
      value: applications.filter((app) => app.status === 'Pending').length,
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: 'warning.main',
    },
    {
      title: 'Approved',
      value: applications.filter((app) => app.status === 'Approved').length,
      icon: <Description sx={{ fontSize: 40 }} />,
      color: 'success.main',
    },
    {
      title: 'Completed',
      value: applications.filter((app) => app.status === 'Completed').length,
      icon: <DashboardIcon sx={{ fontSize: 40 }} />,
      color: 'info.main',
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.username}!
        </Typography>
        <Typography variant="body1">
          Manage your service applications and track their status
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              elevation={2}
              sx={{
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' },
              }}
            >
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

      {/* Available Services */}
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Available Services
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {services.slice(0, 6).map((service) => (
          <Grid item xs={12} md={6} lg={4} key={service.service_id}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {service.service_name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, minHeight: 60 }}
                >
                  {service.description || 'No description available'}
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Add />}
                  onClick={() => navigate('/applications/new', { state: { service } })}
                >
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Applications */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Recent Applications</Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/applications')}
        >
          View All
        </Button>
      </Box>

      {applications.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No applications yet. Start by applying for a service!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {applications.slice(0, 5).map((app) => (
            <Grid item xs={12} key={app.application_id}>
              <Card elevation={1}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6">
                        {services.find((s) => s.service_id === app.service)?.service_name || 'Service'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Submitted: {new Date(app.submitted_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <StatusBadge status={app.status} />
                      <Button
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => navigate(`/applications/${app.application_id}`)}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard;
