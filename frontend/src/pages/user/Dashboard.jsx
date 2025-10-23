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
  Divider,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Stack,
  useTheme,
} from '@mui/material';
import {
  ListAlt,
  Add,
  TrendingUp,
  CheckCircle,
  Schedule,
  ArrowForward,
  Stars,
  HourglassEmpty,
  AssignmentTurnedIn,
  Cancel,
} from '@mui/icons-material';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ title, value, icon, color }) => {
    const theme = useTheme();
    return (
        <Card sx={{ 
            backgroundColor: color, 
            color: theme.palette.getContrastText(color),
            height: '100%' 
        }}>
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                        {icon}
                    </Avatar>
                    <Box>
                        <Typography variant="h6" component="div" fontWeight="bold">
                            {value}
                        </Typography>
                        <Typography variant="body2">
                            {title}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

const Dashboard = () => {
  const [services, setServices] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [servicesRes, applicationsRes] = await Promise.all([
        apiService.getServices(),
        apiService.getApplications(),
      ]);
      setServices(servicesRes.data);
      setApplications(applicationsRes.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getServiceName = (serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    return service?.name || 'Unknown Service';
  };

  const stats = [
    {
      title: 'Total Applications',
      value: applications.length,
      icon: <ListAlt />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Pending',
      value: applications.filter((app) => app.status === 'Pending').length,
      icon: <HourglassEmpty />,
      color: theme.palette.warning.main,
    },
    {
      title: 'In Progress',
      value: applications.filter((app) => app.status === 'In Progress').length,
      icon: <TrendingUp />,
      color: theme.palette.info.main,
    },
    {
      title: 'Completed',
      value: applications.filter((app) => app.status === 'Completed').length,
      icon: <AssignmentTurnedIn />,
      color: theme.palette.success.main,
    },
  ];

  const recentApplications = applications.slice(0, 5);
  const featuredServices = services.slice(0, 3);

  if (loading) return <LoadingSpinner />;

  return (
    <Container sx={{ py: 8 }}>
        <Box mb={4}>
            <Typography variant="h4" component="h1" fontWeight="bold">
                Welcome, {user?.username || 'User'}!
            </Typography>
            <Typography color="text.secondary">
                Here's a summary of your activities and available services.
            </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

        {/* Stats Grid */}
        <Grid container spacing={4} mb={6}>
            {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                    <StatCard {...stat} />
                </Grid>
            ))}
        </Grid>

        <Grid container spacing={4}>
            {/* Recent Applications */}
            <Grid item xs={12} lg={8}>
                <Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" fontWeight="bold">Recent Applications</Typography>
                        <Button size="small" onClick={() => navigate('/applications')}>View All</Button>
                    </Stack>
                    <Divider />
                    <List>
                        {recentApplications.length > 0 ? (
                            recentApplications.map(app => (
                                <ListItem 
                                    key={app.id} 
                                    divider
                                    secondaryAction={
                                        <IconButton edge="end" onClick={() => navigate(`/applications/${app.id}`)}>
                                            <ArrowForward />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText 
                                        primary={getServiceName(app.service)}
                                        secondary={`Submitted: ${new Date(app.created_at).toLocaleDateString()}`}
                                    />
                                    <StatusBadge status={app.status} />
                                </ListItem>
                            ))
                        ) : (
                            <Typography color="text.secondary" sx={{ textAlign: 'center', p: 4 }}>
                                You have no recent applications.
                            </Typography>
                        )}
                    </List>
                </Paper>
            </Grid>

            {/* Quick Actions / Featured Services */}
            <Grid item xs={12} lg={4}>
                <Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>Quick Actions</Typography>
                    <Divider sx={{ mb: 2 }}/>
                    <Stack spacing={2}>
                        <Button 
                            variant="contained" 
                            startIcon={<Add />} 
                            onClick={() => navigate('/services')}
                            fullWidth
                        >
                            Apply for a New Service
                        </Button>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ pt: 2 }}>Featured Services</Typography>
                        {featuredServices.map(service => (
                            <Card key={service.id} variant="outlined">
                                <CardContent>
                                    <Typography variant="body1" fontWeight="bold">{service.name}</Typography>
                                    <Typography variant="body2" color="text.secondary" noWrap>{service.description}</Typography>
                                </CardContent>
                                <CardActions sx={{justifyContent: 'flex-end'}}>
                                    <Button size="small" onClick={() => navigate('/services')}>Learn More</Button>
                                </CardActions>
                            </Card>
                        ))}
                    </Stack>
                </Paper>
            </Grid>
        </Grid>
    </Container>
  );
};

export default Dashboard;
