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
  Avatar,
  Divider,
  IconButton,
  Stack,
  useTheme,
} from '@mui/material';
import {
  People,
  Assignment,
  CheckCircle,
  HourglassEmpty,
  Visibility,
  TrendingUp,
  Category,
  ArrowForward,
  Cancel,
  Campaign,
  AccountBalance,
  Payment,
} from '@mui/icons-material';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

const StatCard = ({ title, value, icon, color, link }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    return (
        <Card sx={{ 
            backgroundColor: color, 
            color: theme.palette.getContrastText(color),
            height: '100%',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            '&:hover': {
                transform: 'scale(1.05)'
            }
        }}
        onClick={() => navigate(link)}
        >
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


const AdminDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsRes, usersRes, servicesRes] = await Promise.all([
        apiService.getApplications(),
        apiService.getUsers(),
        apiService.getServices(),
      ]);
      setApplications(appsRes.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      setUsers(usersRes.data);
      setServices(servicesRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUserById = (id) => users.find(u => u.id === id);

  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: <People />,
      color: theme.palette.primary.main,
      link: '/admin/users',
    },
    {
      title: 'Total Applications',
      value: applications.length,
      icon: <Assignment />,
      color: theme.palette.secondary.main,
      link: '/admin/applications',
    },
    {
      title: 'Pending Reviews',
      value: applications.filter((app) => app.status === 'Pending').length,
      icon: <HourglassEmpty />,
      color: theme.palette.warning.main,
      link: '/admin/applications?status=Pending',
    },
    {
      title: 'Active Services',
      value: services.length,
      icon: <Category />,
      color: theme.palette.info.main,
      link: '/admin/services',
    },
  ];

  const recentPendingApplications = applications.filter(app => app.status === 'Pending').slice(0, 5);

  if (loading) return <LoadingSpinner />;

  return (
    <Container sx={{ py: 8 }}>
        <Box mb={4}>
            <Typography variant="h4" component="h1" fontWeight="bold">
                Admin Dashboard
            </Typography>
            <Typography color="text.secondary">
                Overview of the portal's activities and metrics.
            </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={4} mb={6}>
            {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                    <StatCard {...stat} />
                </Grid>
            ))}
        </Grid>

        {/* Management Links */}
        <Grid container spacing={3} mb={6}>
            <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => navigate('/admin/announcements')}>
                    <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: 'primary.light' }}>
                                <Campaign />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight="bold">Announcements</Typography>
                                <Typography variant="body2" color="text.secondary">Manage portal announcements</Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => navigate('/admin/gov-schemes')}>
                    <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: 'success.light' }}>
                                <AccountBalance />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight="bold">Gov Schemes</Typography>
                                <Typography variant="body2" color="text.secondary">Manage government schemes info</Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => navigate('/admin/payments')}>
                    <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: 'warning.light' }}>
                                <Payment />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight="bold">Payments</Typography>
                                <Typography variant="body2" color="text.secondary">Manage payment settings</Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>

        {/* Recent Pending Applications */}
        <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">Recent Pending Applications</Typography>
                <Button size="small" onClick={() => navigate('/admin/applications')}>View All</Button>
            </Stack>
            <Divider />
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Applicant</TableCell>
                            <TableCell>Service</TableCell>
                            <TableCell>Submitted On</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {recentPendingApplications.length > 0 ? (
                            recentPendingApplications.map(app => (
                                <TableRow key={app.id} hover>
                                    <TableCell>{getUserById(app.user)?.username || 'N/A'}</TableCell>
                                    <TableCell>{services.find(s => s.id === app.service)?.name || 'N/A'}</TableCell>
                                    <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell align="right">
                                        <Button 
                                            variant="outlined" 
                                            size="small"
                                            endIcon={<Visibility />}
                                            onClick={() => navigate(`/admin/applications/${app.id}`)}
                                        >
                                            Review
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    <Typography color="text.secondary" p={4}>
                                        No pending applications right now. Great job!
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    </Container>
  );
};

export default AdminDashboard;
