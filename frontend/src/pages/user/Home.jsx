import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  alpha,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  Announcement as AnnouncementIcon,
  Info as InfoIcon,
  LocalLibrary as LocalLibraryIcon,
  Group as GroupIcon,
  EmojiEvents as EmojiEventsIcon,
  TrendingUp as TrendingUpIcon,
  Verified as VerifiedIcon,
  AccessTime as AccessTimeIcon,
  Support as SupportIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { icon: <GroupIcon sx={{ fontSize: 40 }} />, value: '0', label: 'Happy Citizens', color: '#667eea' },
    { icon: <DescriptionIcon sx={{ fontSize: 40 }} />, value: '0', label: 'Applications', color: '#f093fb' },
    { icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />, value: '0', label: 'Services', color: '#43e97b' },
    { icon: <VerifiedIcon sx={{ fontSize: 40 }} />, value: '0%', label: 'Success Rate', color: '#4facfe' },
  ]);

  useEffect(() => {
    fetchAnnouncements();
    fetchStats();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAnnouncements();
      const activeAnnouncements = response.data
        .filter(a => a.is_active)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3);
      setAnnouncements(activeAnnouncements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      let totalUsers = 0;
      let totalApplications = 0;
      let completedApplications = 0;
      let totalServices = 0;

      // Fetch services count (public endpoint)
      try {
        const servicesResponse = await apiService.getServices();
        totalServices = servicesResponse.data?.length || 0;
      } catch (error) {
        console.error('Error fetching services:', error);
      }

      // Try to fetch users and applications (may require admin permissions)
      try {
        const usersResponse = await apiService.getUsers();
        totalUsers = usersResponse.data?.length || 0;
      } catch (error) {
        // If unauthorized, use default/fallback value
        console.log('Unable to fetch users count');
      }

      try {
        const applicationsResponse = await apiService.getApplications();
        totalApplications = applicationsResponse.data?.length || 0;

        // Calculate success rate (completed applications / total applications)
        completedApplications = applicationsResponse.data?.filter(
          app => app.status === 'Completed'
        ).length || 0;
      } catch (error) {
        console.log('Unable to fetch applications count');
      }

      const successRate = totalApplications > 0
        ? Math.round((completedApplications / totalApplications) * 100)
        : 95; // Default fallback

      // Update stats with real data
      setStats([
        {
          icon: <GroupIcon sx={{ fontSize: 40 }} />,
          value: totalUsers > 0
            ? (totalUsers > 1000 ? `${(totalUsers / 1000).toFixed(1)}K+` : `${totalUsers}+`)
            : '100+', // Fallback if no access
          label: 'Happy Citizens',
          color: '#667eea'
        },
        {
          icon: <DescriptionIcon sx={{ fontSize: 40 }} />,
          value: totalApplications > 0
            ? (totalApplications > 1000 ? `${(totalApplications / 1000).toFixed(1)}K+` : `${totalApplications}+`)
            : '50+', // Fallback if no access
          label: 'Applications',
          color: '#f093fb'
        },
        {
          icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />,
          value: `${totalServices}+`,
          label: 'Services',
          color: '#43e97b'
        },
        {
          icon: <VerifiedIcon sx={{ fontSize: 40 }} />,
          value: `${successRate}%`,
          label: 'Success Rate',
          color: '#4facfe'
        },
      ]);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Keep default values if fetch fails
    }
  };

  const features = [
    {
      icon: <SpeedIcon sx={{ fontSize: 48 }} />,
      title: 'Fast Processing',
      description: 'Get your documents processed quickly with our streamlined digital system.',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 48 }} />,
      title: 'Secure & Safe',
      description: 'Bank-level security to protect your personal information and documents.',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      icon: <AccessTimeIcon sx={{ fontSize: 48 }} />,
      title: '24/7 Available',
      description: 'Access services anytime, anywhere. No need to wait in long queues.',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      icon: <SupportIcon sx={{ fontSize: 48 }} />,
      title: 'Expert Support',
      description: 'Our dedicated support team is always ready to help you with your queries.',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
  ];

  const aboutPoints = [
    'Established to provide efficient digital government services',
    'Dedicated to serving citizens with transparency and accountability',
    'Utilizing modern technology to simplify bureaucratic processes',
    'Committed to reducing processing time and improving service quality',
    'Available 24/7 for online applications and status tracking',
  ];

  return (
    <Box sx={{ bgcolor: '#ffffff', width: '100%', overflowX: 'hidden' }}>
      {/* Hero Section - Modern Redesign */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', maxWidth: 900, mx: 'auto' }}>
            <Chip
              icon={<VerifiedIcon />}
              label="Special offer: 15% off on every service for Beed residents!"
              sx={{
                bgcolor: 'rgba(255,255,255,0.25)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                mb: 3,
                fontWeight: 'bold',
                fontSize: '0.9rem',
                py: 2.5,
                px: 1,
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                mb: 3,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                lineHeight: 1.1,
                textShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              Chhatrapati Graphics And Jay Bhagwan Common Service Centre
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 5,
                opacity: 0.95,
                lineHeight: 1.7,
                fontSize: { xs: '1.1rem', md: '1.4rem' },
                fontWeight: 400,
                maxWidth: 700,
                mx: 'auto',
              }}
            >
              Your one-stop solution for all government services. Fast, secure, and accessible from anywhere.
            </Typography>

            {/* Conditional Buttons - Show only for non-logged-in users */}
            {!user && (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
                sx={{ mb: 6 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/register')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 5,
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    borderRadius: 50,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.95)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 5,
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    borderRadius: 50,
                    borderWidth: 2,
                    backdropFilter: 'blur(10px)',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.2)',
                      borderWidth: 2,
                      transform: 'translateY(-3px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Sign In
                </Button>
              </Stack>
            )}

            {/* Buttons for logged-in users */}
            {user && (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
                sx={{ mb: 6 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate(isAdmin ? '/admin' : '/applications')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 5,
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    borderRadius: 50,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.95)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isAdmin ? 'Go to Admin Panel' : 'View My Applications'}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/services')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 5,
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    borderRadius: 50,
                    borderWidth: 2,
                    backdropFilter: 'blur(10px)',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.2)',
                      borderWidth: 2,
                      transform: 'translateY(-3px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  New Application
                </Button>
              </Stack>
            )}

            {/* Trust Indicators */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 4,
                flexWrap: 'wrap',
                opacity: 0.9,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VerifiedIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2" fontWeight="500">
                  Verified & Secure
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2" fontWeight="500">
                  Government Approved
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2" fontWeight="500">
                  24/7 Available
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Stats Section - Modern Cards */}
      <Container maxWidth="lg" sx={{ py: 6, mt: -6, position: 'relative', zIndex: 10 }}>
        <Grid container spacing={2} justifyContent="center">
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper
                elevation={0}
                sx={{
                  textAlign: 'center',
                  p: { xs: 2, md: 3 },
                  borderRadius: 3,
                  bgcolor: 'white',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  border: '1px solid',
                  borderColor: 'grey.100',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: `0 20px 40px ${alpha(stat.color, 0.25)}`,
                    borderColor: stat.color,
                  },
                }}
              >
                <Box
                  sx={{
                    width: { xs: 60, md: 70 },
                    height: { xs: 60, md: 70 },
                    borderRadius: '50%',
                    bgcolor: alpha(stat.color, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    mb: 2,
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography variant="h3" fontWeight="900" color={stat.color} gutterBottom sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="600" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* About Section - Modern Redesign with Interactive Cards */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
          {/* Left Side - Content */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -20,
                  left: -20,
                  width: 100,
                  height: 100,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  opacity: 0.1,
                  zIndex: -1,
                },
              }}
            >
              <Chip
                icon={<InfoIcon />}
                label="ABOUT US"
                sx={{
                  bgcolor: alpha('#667eea', 0.1),
                  color: 'primary.main',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  px: 2,
                  py: 2.5,
                  mb: 2,
                  border: '1px solid',
                  borderColor: alpha('#667eea', 0.3),
                }}
              />
              <Typography
                variant="h2"
                fontWeight="900"
                gutterBottom
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  lineHeight: 1.2,
                  mb: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Empowering Citizens Through Digital Services
              </Typography>
              <Typography
                variant="h6"
                paragraph
                sx={{
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  lineHeight: 1.8,
                  color: 'text.secondary',
                  mb: 3,
                  fontWeight: 400,
                }}
              >
                <strong style={{ color: '#667eea' }}>Chhatrapati Graphics & Jay Bhagwan (CSC) Maha e-Seva Kendra</strong>{' '}
                is <strong style={{ color: '#764ba2' }}>empowering citizens through digital services</strong>, transforming{' '}
                how people across Maharashtra access government and online facilities. Our mission is to bring{' '}
                <strong style={{ color: '#43e97b' }}>every essential public service</strong> to your fingertips eliminating long queues, paperwork, and delays.
              </Typography>

              <Typography
                variant="body1"
                paragraph
                sx={{
                  fontSize: { xs: '0.95rem', md: '1rem' },
                  lineHeight: 1.7,
                  color: 'text.secondary',
                  mb: 4,
                }}
              >
                By combining technology with trust, we make official processes faster, easier, and more transparent —
                from caste and income certificates to scholarships, licenses, and more. With doorstep digital services,
                secure processing, and instant updates via WhatsApp, we help citizens save time and effort while ensuring
                accuracy and reliability. Join thousands who rely on us 
              <strong style={{color: '#764ba2'}}> your one-stop center for every e-service in Maharashtra.
              </strong>
              </Typography>

              {/* Stats Row
              <Grid container spacing={2} sx={{ mb: 3 }} justifyContent="center">
                {[
                  { number: '10K+', label: 'Users', color: '#667eea' },
                  { number: '98%', label: 'Satisfaction', color: '#43e97b' },
                  { number: '24/7', label: 'Support', color: '#f5576c' },
                ].map((stat, idx) => (
                  <Grid item xs={4} key={idx}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography
                        variant="h4"
                        fontWeight="900"
                        sx={{ color: stat.color, mb: 0.5, fontSize: { xs: '1.5rem', md: '2rem' } }}
                      >
                        {stat.number}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid> */}

              {!user && (
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/register')}
                  sx={{
                    px: { xs: 3, md: 5 },
                    py: { xs: 1.5, md: 2 },
                    borderRadius: 50,
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      boxShadow: '0 12px 28px rgba(102, 126, 234, 0.6)',
                      transform: 'translateY(-4px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Get Started Today
                </Button>
              )}
            </Box>
          </Grid>

          {/* Right Side - Feature Cards */}
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative', mt: { xs: 0, md: 0 }, px: { xs: 0, md: 1 }, py: { xs: 0, md: 1 } }}>
              {/* Decorative background circle */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '120%',
                  height: '120%',
                  background: 'radial-gradient(circle, rgba(102, 126, 234, 0.05) 0%, transparent 70%)',
                  borderRadius: '50%',
                  zIndex: -1,
                }}
              />

              <Grid container spacing={3} justifyContent="center">
                {[
                  {
                    icon: <SpeedIcon sx={{ fontSize: 40 }} />,
                    title: 'Lightning Fast',
                    desc: 'Process applications in minutes, not days',
                    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    delay: 0,
                  },
                
                  {
                    icon: <AccessTimeIcon sx={{ fontSize: 40 }} />,
                    title: 'Always Available',
                    desc: 'Access services 24/7 from anywhere',
                    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    delay: 0.2,
                  },
                  {
                    icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
                    title: 'Verified Services',
                    desc: 'Government-approved and certified',
                    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    delay: 0.3,
                  },
                ].map((feature, index) => (
                  <Grid item xs={6} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Card
                      elevation={0}
                      sx={{
                        height: '100%',
                        minHeight: 180,
                        maxWidth: 280,
                        width: '100%',
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor: 'grey.100',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        transitionDelay: `${feature.delay}s`,
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                          borderColor: 'transparent',
                          '& .icon-box': {
                            transform: 'scale(1.1) rotate(5deg)',
                          },
                          '&::before': {
                            opacity: 1,
                          },
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: feature.gradient,
                          opacity: 0,
                          transition: 'opacity 0.4s ease',
                          zIndex: 0,
                        },
                      }}
                    >
                      <CardContent
                        sx={{
                          p: { xs: 2, md: 3 },
                          position: 'relative',
                          zIndex: 1,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <Box
                          className="icon-box"
                          sx={{
                            width: { xs: 50, md: 60 },
                            height: { xs: 50, md: 60 },
                            borderRadius: 3,
                            background: feature.gradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            mb: 1.5,
                            transition: 'all 0.3s ease',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          gutterBottom
                          sx={{
                            fontSize: { xs: '0.95rem', md: '1.1rem' },
                            transition: 'color 0.3s ease',
                            '.MuiCard-root:hover &': {
                              color: 'white',
                            },
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: { xs: '0.8rem', md: '0.875rem' },
                            lineHeight: 1.5,
                            transition: 'color 0.3s ease',
                            '.MuiCard-root:hover &': {
                              color: 'rgba(255,255,255,0.9)',
                            },
                          }}
                        >
                          {feature.desc}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Key Benefits List */}
              <Paper
                elevation={0}
                sx={{
                  mt: 4,
                  p: 3,
                  borderRadius: 4,
                  bgcolor: alpha('#43e97b', 0.05),
                  border: '1px solid',
                  borderColor: alpha('#43e97b', 0.2),
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  Why Citizens Choose Us:
                </Typography>
                <Grid container spacing={1} justifyContent="center">
                  {[
                    'No paperwork hassle',
                    'Real-time tracking',
                    'Instant notifications',
                    'Expert support team',
                  ].map((benefit, idx) => (
                    <Grid item xs={6} key={idx}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon sx={{ color: '#43e97b', fontSize: 20 }} />
                        <Typography variant="body2" fontWeight="500">
                          {benefit}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Announcements Section - Modern Card Design */}
      <Box sx={{ bgcolor: '#f8f9fc', py: { xs: 6, md: 8 }, width: '100%' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
            <Typography
              variant="overline"
              sx={{
                color: 'secondary.main',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                letterSpacing: 2,
              }}
            >
              LATEST UPDATES
            </Typography>
            <Typography
              variant="h2"
              fontWeight="900"
              gutterBottom
              sx={{ fontSize: { xs: '2rem', md: '3rem' }, mt: 1 }}
            >
              Announcements
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Stay informed with our latest news and important notices
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary">
                Loading announcements...
              </Typography>
            </Box>
          ) : announcements.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 4, md: 6 },
                textAlign: 'center',
                borderRadius: 3,
                border: '2px dashed',
                borderColor: 'grey.300',
                bgcolor: 'white',
              }}
            >
              <AnnouncementIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h5" fontWeight="bold" color="text.secondary" gutterBottom>
                No Announcements Yet
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Check back later for important updates and notices.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={{ xs: 2, md: 3 }} justifyContent="center">
              {announcements.map((announcement, index) => (
                <Grid item xs={12} sm={6} md={4} key={announcement.id}>
                  <Card
                    elevation={0}
                    sx={{
                      height: 300,
                      maxWidth: 320,
                      margin: '0 auto',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'grey.100',
                      bgcolor: 'white',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
                        '& .announcement-badge': {
                          transform: 'scale(1.05)',
                        },
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background:
                          announcement.type === 'success' ? 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)' :
                            announcement.type === 'warning' ? 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)' :
                              announcement.type === 'error' ? 'linear-gradient(90deg, #fa709a 0%, #fee140 100%)' :
                                'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.5, flex: '1 1 auto', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, flexShrink: 0 }}>
                        <Chip
                          className="announcement-badge"
                          label={announcement.type ? announcement.type.toUpperCase() : 'INFO'}
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            fontSize: '0.7rem',
                            height: 22,
                            transition: 'transform 0.3s ease',
                            ...(announcement.type === 'success' && {
                              bgcolor: alpha('#43e97b', 0.15),
                              color: '#43e97b',
                            }),
                            ...(announcement.type === 'warning' && {
                              bgcolor: alpha('#f5576c', 0.15),
                              color: '#f5576c',
                            }),
                            ...(announcement.type === 'error' && {
                              bgcolor: alpha('#fa709a', 0.15),
                              color: '#fa709a',
                            }),
                            ...(!announcement.type || announcement.type === 'info') && {
                              bgcolor: alpha('#4facfe', 0.15),
                              color: '#4facfe',
                            },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" fontWeight="500" sx={{ fontSize: '0.7rem' }}>
                          {new Date(announcement.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Typography>
                      </Box>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        gutterBottom
                        title={announcement.title}
                        sx={{
                          mb: 1.5,
                          fontSize: '1.1rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: 52,
                          cursor: 'help',
                        }}
                      >
                        {announcement.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        title={announcement.content}
                        sx={{
                          fontSize: '0.875rem',
                          lineHeight: 1.6,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: 'vertical',
                          cursor: 'help',
                        }}
                      >
                        {announcement.content}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Location & Contact Section - Compact Landscape Design */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="overline"
            sx={{
              color: 'error.main',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              letterSpacing: 2,
            }}
          >
            GET IN TOUCH
          </Typography>
          <Typography
            variant="h2"
            fontWeight="900"
            gutterBottom
            sx={{ fontSize: { xs: '2rem', md: '3rem' }, mt: 1 }}
          >
            Contact Us
          </Typography>
        </Box>

        {/* Contact Info Cards - Horizontal Layout */}
        <Grid container spacing={2} sx={{ mb: 3 }} justifyContent="center">
          {[
            {
              icon: <LocationOnIcon />,
              title: 'Address',
              content: 'Gadhi, Georai 431127',
              color: '#f44336',
            },
            {
              icon: <PhoneIcon />,
              title: 'Phone',
              content: '+91-7218660663 / 9665265424',
              color: '#2196f3',
            },
            {
              icon: <EmailIcon />,
              title: 'Email',
              content: ' jaybhagwanism@gmail.com',
              color: '#4caf50',
            },
            {
              icon: <ScheduleIcon />,
              title: 'Hours',
              content: 'Mon-Fri: 8AM - 6PM',
              color: '#ff9800',
            },
          ].map((item, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: item.color,
                    boxShadow: `0 4px 16px ${alpha(item.color, 0.2)}`,
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    bgcolor: alpha(item.color, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.color,
                    margin: '0 auto',
                    mb: 1.5,
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="text.primary">
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  {item.content}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Map - Reduced Height */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <iframe
            title="Office Location"
            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d366.353816562632!2d75.75875006101172!3d19.203675277843264!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sin!4v1760344991991!5m2!1sen!2sin"
            width="100%"
            height="200"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>

        </Paper>
      </Container>
    </Box>
  );
}
