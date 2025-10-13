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
  Chip,
  Divider,
  CardActions,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ListAlt,
  Description,
  Add,
  TrendingUp,
  CheckCircle,
  Schedule,
  LocalOffer,
  ArrowForward,
  Stars,
} from '@mui/icons-material';
import apiService from '../services/apiService';
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
      bgColor: 'rgba(102, 126, 234, 0.1)',
    },
    {
      title: 'Pending Review',
      value: applications.filter((app) => app.status === 'Pending').length,
      icon: <Schedule sx={{ fontSize: 40 }} />,
      color: 'warning.main',
      bgColor: 'rgba(255, 152, 0, 0.1)',
    },
    {
      title: 'Approved',
      value: applications.filter((app) => app.status === 'Approved').length,
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
      color: 'success.main',
      bgColor: 'rgba(76, 175, 80, 0.1)',
    },
    {
      title: 'Completed',
      value: applications.filter((app) => app.status === 'Completed').length,
      icon: <Stars sx={{ fontSize: 40 }} />,
      color: 'info.main',
      bgColor: 'rgba(33, 150, 243, 0.1)',
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Hero Section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            mb: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Chip
              icon={<Stars />}
              label="Digital Sewa Portal"
              sx={{
                mb: 2,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 'bold',
              }}
            />
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
              Welcome back, {user?.username}! 👋
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              Manage your service applications and track their progress
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={() => navigate('/applications/new')}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                  fontWeight: 'bold',
                }}
              >
                New Application
              </Button>
              <Button
                variant="outlined"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/applications')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                View All Applications
              </Button>
            </Box>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        

        {/* Available Services Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                Available Services
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Choose from our wide range of digital services
              </Typography>
            </Box>
            <Chip
              icon={<LocalOffer />}
              label={`${services.length} Services`}
              color="primary"
              variant="outlined"
            />
          </Box>
          <Grid container spacing={3} sx={{ mb: 5 }}>
            {services.slice(0, 6).map((service) => (
              <Grid item xs={12} md={6} lg={4} key={service.service_id}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(102, 126, 234, 0.2)',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        mb: 2,
                      }}
                    >
                      <Description sx={{ fontSize: 28 }} />
                    </Box>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      {service.service_name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, minHeight: 40 }}
                    >
                      {service.description || 'No description available'}
                    </Typography>
                  </CardContent>
                  <Divider />
                  <CardActions sx={{ p: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Add />}
                      onClick={() => navigate('/applications/new', { state: { service } })}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                    >
                      Apply Now
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
