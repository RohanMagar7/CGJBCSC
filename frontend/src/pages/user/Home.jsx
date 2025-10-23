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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  alpha,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Announcement as AnnouncementIcon,
  Group as GroupIcon,
  EmojiEvents as EmojiEventsIcon,
  Verified as VerifiedIcon,
  Support as SupportIcon,
  ExpandMore as ExpandMoreIcon,
  FormatQuote as FormatQuoteIcon,
  Business as BusinessIcon,
  TrackChanges as TrackChangesIcon,
  HowToReg as HowToRegIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  RateReview as RateReviewIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  People as PeopleIcon,
  Bolt as BoltIcon,
  Shield as ShieldIcon,
  HeadsetMic as HeadsetMicIcon,
  Campaign as CampaignIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

// --- Reusable Components ---

const StatCard = ({ item }) => (
  <Card sx={{ 
      background: `linear-gradient(135deg, ${item.color} 0%, ${alpha(item.color, 0.7)} 100%)`, 
      color: 'white',
      textAlign: 'center',
      height: '100%'
  }}>
    <CardContent>
      <Stack alignItems="center" justifyContent="center" spacing={1}>
        {item.icon}
        <Typography variant="h4" component="div" fontWeight="bold">
          {item.value}
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          {item.label}
        </Typography>
      </Stack>
    </CardContent>
  </Card>
);

const FeatureCard = ({ icon, title, description }) => (
  <Paper elevation={0} variant="outlined" sx={{ p: 3, height: '100%', textAlign: 'center' }}>
    <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, mb: 2, mx: 'auto' }}>
      {icon}
    </Avatar>
    <Typography variant="h6" gutterBottom fontWeight="bold">
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {description}
    </Typography>
  </Paper>
);

const HowItWorksStep = ({ icon, step, title, description }) => (
    <Stack alignItems="center" textAlign="center" spacing={1}>
        <Avatar sx={{ bgcolor: 'secondary.main', color: 'white', width: 64, height: 64, mb: 1 }}>
            {icon}
        </Avatar>
        <Typography variant="caption" color="secondary.main" fontWeight="bold">
            {step}
        </Typography>
        <Typography variant="h6" fontWeight="bold">{title}</Typography>
        <Typography variant="body2" color="text.secondary">{description}</Typography>
    </Stack>
);

const TestimonialCard = ({ name, role, quote }) => (
    <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
        <FormatQuoteIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="body1" fontStyle="italic" color="text.secondary" sx={{ mb: 2 }}>
            "{quote}"
        </Typography>
        <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'primary.light' }}>{name.charAt(0)}</Avatar>
            <Box>
                <Typography fontWeight="bold">{name}</Typography>
                <Typography variant="caption" color="text.secondary">{role}</Typography>
            </Box>
        </Stack>
    </Paper>
);


// --- Main Home Page Component ---

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch announcements
        const annRes = await apiService.getAnnouncements();
        setAnnouncements(annRes.data.filter(a => a.is_active).slice(0, 3));

        // Fetch stats
        const [usersRes, appsRes, servicesRes] = await Promise.all([
          apiService.getUsers().catch(() => ({ data: [] })),
          apiService.getApplications().catch(() => ({ data: [] })),
          apiService.getServices().catch(() => ({ data: [] })),
        ]);
        
        const totalUsers = usersRes.data.length;
        const totalApplications = appsRes.data.length;
        const completedApplications = appsRes.data.filter(app => app.status === 'Completed').length;
        const totalServices = servicesRes.data.length;
        const successRate = totalApplications > 0 ? ((completedApplications / totalApplications) * 100).toFixed(0) : 100;

        setStats([
          { icon: <PeopleIcon sx={{ fontSize: 40 }} />, value: totalUsers, label: 'Happy Citizens', color: theme.palette.primary.main },
          { icon: <AssignmentTurnedInIcon sx={{ fontSize: 40 }} />, value: totalApplications, label: 'Applications Filed', color: theme.palette.secondary.main },
          { icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />, value: totalServices, label: 'Services Offered', color: theme.palette.success.main },
          { icon: <VerifiedIcon sx={{ fontSize: 40 }} />, value: `${successRate}%`, label: 'Success Rate', color: theme.palette.info.main },
        ]);
      } catch (error) {
        console.error("Failed to fetch home page data:", error);
      }
    };
    fetchData();
  }, [theme.palette]);

  const features = [
    { icon: <BoltIcon />, title: 'Fast & Easy Application', description: 'Our streamlined process ensures your applications are submitted in minutes.' },
    { icon: <ShieldIcon />, title: 'Secure & Confidential', description: 'Your data is protected with the highest standards of security and privacy.' },
    { icon: <HeadsetMicIcon />, title: 'Dedicated Support', description: 'Our expert team is here to help you every step of the way.' },
  ];

  const testimonials = [
      { name: 'Rohan M.', role: 'Small Business Owner', quote: 'The platform made a complex process incredibly simple. I got my permit much faster than I expected!'},
      { name: 'Aasha S.', role: 'New Resident', quote: 'As someone new to the area, I was lost. This portal was a lifesaver for getting all my local registrations done.'},
      { name: 'Prakash T.', role: 'Contractor', quote: 'I manage multiple applications for my clients. The dashboard is fantastic for tracking everything in one place.'},
  ];

  const faqs = [
      { q: 'How do I start an application?', a: 'First, register for an account. Once logged in, head to the "Services" page, choose the service you need, and click "Apply Now".' },
      { q: 'What documents do I need?', a: 'Each service has a list of required documents. You can see this on the service details page before you apply. You can upload documents directly through the portal.' },
      { q: 'How can I track my application status?', a: 'You can see the real-time status of all your applications in your personal "Dashboard" after you log in.' },
      { q: 'Is my personal information secure?', a: 'Absolutely. We use industry-standard encryption and security protocols to protect all your data.' },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`, color: 'white', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h2" component="h1" fontWeight="bold">
            Chhatrapati Graphics And Jay Bhagwan Common Service Centre
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, mb: 4, opacity: 0.9 }}>
            Your trusted digital gateway for streamlined applications, transparent processing, and timely public services.
          </Typography>
          <Button variant="contained" size="large" color="secondary" endIcon={<ArrowForwardIcon />} onClick={() => navigate(user ? '/services' : '/register')}>
            {user ? 'Explore Services' : 'Get Started Now'}
          </Button>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container sx={{ py: 8 }}>
        <Grid container spacing={4} justifyContent="center">
          {stats.map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatCard item={item} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Why Choose Us Section */}
      <Box sx={{ bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" fontWeight="bold" textAlign="center" sx={{ mb: 6 }}>
            A Better Way to Manage Civic Services
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {features.map((feat, i) => (
              <Grid item xs={12} md={4} key={i}>
                <FeatureCard {...feat} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
{/* 
      How It Works Section
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" fontWeight="bold" textAlign="center" sx={{ mb: 6 }}>
          Get Started in 3 Simple Steps
        </Typography>
        <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={4}><HowItWorksStep icon={<HowToRegIcon />} step="STEP 1" title="Register an Account" description="Quickly sign up to create your secure personal dashboard." /></Grid>
            <Grid item xs={12} md={4}><HowItWorksStep icon={<PlaylistAddCheckIcon />} step="STEP 2" title="Submit Your Application" description="Choose a service, fill out the form, and upload required documents with ease." /></Grid>
            <Grid item xs={12} md={4}><HowItWorksStep icon={<RateReviewIcon />} step="STEP 3" title="Track and Receive" description="Monitor your application status in real-time and get notified upon completion." /></Grid>
        </Grid>
      </Container>
 */}
      {/* About Us & Announcements Section */}
      <Box sx={{ bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="stretch" justifyContent="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
                🚩Chhatrapati Graphics & Jay Bhagwan (CSC) Maha e-Seva Kendra🚩
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Providing all online services for citizens across Maharashtra in one convenient place. 💻
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                From government schemes to school, job, and agriculture forms — everything made simple. 🏠
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Dedicated to making digital services accessible, fast, and reliable for everyone.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, textAlign: 'center', width: '100%' }}>Latest Announcements</Typography>
              <Grid container spacing={2} justifyContent="center">
                {announcements.length > 0 ? announcements.map(ann => (
                  <Grid item xs={12} sm={6} key={ann.id}>
                    <Card 
                      elevation={2} 
                      sx={{ 
                        p: 2.5, 
                        height: '100%',
                        minHeight: 200,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Box>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
                            <CampaignIcon sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Chip 
                            label={ann.type} 
                            size="small" 
                            color={ann.type === 'alert' ? 'error' : ann.type === 'warning' ? 'warning' : 'info'}
                          />
                        </Stack>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                          {ann.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                          {ann.content}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.disabled">
                        {new Date(ann.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric' 
                        })}
                      </Typography>
                    </Card>
                  </Grid>
                )) : (
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                      <CampaignIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography color="text.secondary">No new announcements at this time.</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      {/* <Container sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" fontWeight="bold" textAlign="center" sx={{ mb: 6 }}>
          What Our Users Are Saying
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {testimonials.map((t, i) => (
            <Grid item xs={12} md={4} key={i}>
              <TestimonialCard {...t} />
            </Grid>
          ))}
        </Grid>
      </Container> */}

      {/* FAQ Section */}
      <Box sx={{ bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" fontWeight="bold" textAlign="center" sx={{ mb: 6 }}>
            Frequently Asked Questions
          </Typography>
          {faqs.map((faq, i) => (
            <Accordion key={i} elevation={1}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="medium">{faq.q}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">{faq.a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Container>
      </Box>

      {/* Contact Us Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Typography variant="body1" color="secondary.main" fontWeight="bold">
            GET IN TOUCH
          </Typography>
          <Typography variant="h4" component="h2" fontWeight="bold" sx={{ mb: 6 }}>
            Contact Us
          </Typography>
          <Grid container spacing={4} justifyContent="center" sx={{ mb: 6 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}><LocationOnIcon /></Avatar>
                <Box textAlign="left">
                  <Typography fontWeight="bold">Address</Typography>
                  <Typography color="text.secondary">Gadhi, Georai 431127</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}><PhoneIcon /></Avatar>
                <Box textAlign="left">
                  <Typography fontWeight="bold">Phone</Typography>
                  <Typography color="text.secondary">+91-7218660663</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}><EmailIcon /></Avatar>
                <Box textAlign="left">
                  <Typography fontWeight="bold">Email</Typography>
                  <Typography color="text.secondary">jaybhagwanism@gmail.com</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}><ScheduleIcon /></Avatar>
                <Box textAlign="left">
                  <Typography fontWeight="bold">Hours</Typography>
                  <Typography color="text.secondary">Mon-Fri: 8AM - 6PM</Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Container>
        <Box
          sx={{
            height: { xs: 300, md: 400 },
            width: '100%',
            mt: 4,
          }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15049.93145281297!2d75.75023602698927!3d19.43481811195492!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdac5d67a6f1361%3A0x71e3576e3256584e!2sGeorai%2C%20Maharashtra%20431127%2C%20India!5e0!3m2!1sen!2sus!4v1668204838450!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </Box>
      </Box>

      {/* Final CTA Section */}
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
          Ready to Get Started?
        </Typography>
        <Typography color="text.secondary" maxWidth="md" sx={{ mx: 'auto', mb: 4 }}>
          Join hundreds of other citizens who are saving time and effort. Create your account today and experience the future of civic services.
        </Typography>
        <Button variant="contained" size="large" onClick={() => navigate('/register')}>
          Sign Up for Free
        </Button>
      </Container>
    </Box>
  );
}
