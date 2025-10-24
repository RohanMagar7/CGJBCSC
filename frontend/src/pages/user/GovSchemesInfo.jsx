import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Stack,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  AccountBalance as AccountBalanceIcon,
  School as SchoolIcon,
  LocalHospital as LocalHospitalIcon,
  Agriculture as AgricultureIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  WorkOutline as WorkOutlineIcon,
  EmojiEvents as EmojiEventsIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Description as DescriptionIcon,
  Link as LinkIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SchemeCard = ({ scheme, onLearnMore }) => {
  const getCategoryColor = (category) => {
    const colors = {
      'Education': 'primary',
      'Health': 'error',
      'Agriculture': 'success',
      'Employment': 'warning',
      'Housing': 'info',
      'Business': 'secondary',
      'Social Welfare': 'default',
    };
    return colors[category] || 'default';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Education': <SchoolIcon />,
      'Health': <LocalHospitalIcon />,
      'Agriculture': <AgricultureIcon />,
      'Employment': <WorkOutlineIcon />,
      'Housing': <HomeIcon />,
      'Business': <BusinessIcon />,
      'Social Welfare': <EmojiEventsIcon />,
    };
    return icons[category] || <AccountBalanceIcon />;
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Avatar sx={{ bgcolor: `${getCategoryColor(scheme.category)}.main` }}>
            {getCategoryIcon(scheme.category)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
              {scheme.name}
            </Typography>
            <Chip label={scheme.category} color={getCategoryColor(scheme.category)} size="small" />
          </Box>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {scheme.description}
        </Typography>
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary">
            <strong>Eligibility:</strong> {scheme.eligibility}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            <strong>Benefits:</strong> {scheme.benefits}
          </Typography>
        </Stack>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => onLearnMore(scheme)}>
          Learn More
        </Button>
      </CardActions>
    </Card>
  );
};

const SchemeDetailDialog = ({ open, onClose, scheme }) => {
  if (!scheme) return null;

  const getCategoryColor = (category) => {
    const colors = {
      'Education': 'primary',
      'Health': 'error',
      'Agriculture': 'success',
      'Employment': 'warning',
      'Housing': 'info',
      'Business': 'secondary',
      'Social Welfare': 'default',
    };
    return colors[category] || 'default';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {scheme.name}
            </Typography>
            <Chip label={scheme.category} color={getCategoryColor(scheme.category)} size="small" sx={{ mt: 1 }} />
          </Box>
          <Button onClick={onClose} color="inherit">
            <CloseIcon />
          </Button>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stack spacing={3} sx={{ py: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              About the Scheme
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {scheme.description}
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Eligibility Criteria
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {scheme.eligibility}
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Key Benefits
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {scheme.benefits}
            </Typography>
          </Box>

          {scheme.documents && (
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Required Documents
              </Typography>
              <List dense>
                {scheme.documents.map((doc, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <DescriptionIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={doc} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {scheme.howToApply && (
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                How to Apply
              </Typography>
              <List dense>
                {scheme.howToApply.map((step, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={`Step ${index + 1}: ${step}`} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {scheme.officialWebsite && (
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Official Website
              </Typography>
              <Button
                variant="outlined"
                startIcon={<LinkIcon />}
                href={scheme.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit Official Website
              </Button>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button variant="contained">
          Apply for This Scheme
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function GovSchemesInfo() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getGovSchemes();
      // Filter only active schemes for users
      const activeSchemes = (response.data || []).filter(scheme => scheme.is_active);
      setSchemes(activeSchemes);
    } catch (err) {
      console.error('Failed to fetch government schemes:', err);
      // Fallback to demo data if API fails
      setSchemes(demoSchemes);
    } finally {
      setLoading(false);
    }
  };

  const handleLearnMore = (scheme) => {
    setSelectedScheme(scheme);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedScheme(null);
  };

  // Demo data for fallback - government schemes
  const demoSchemes = [
    {
      id: 1,
      name: 'Pradhan Mantri Jan Dhan Yojana',
      category: 'Social Welfare',
      description: 'Financial inclusion program to ensure access to financial services such as banking, savings, deposit accounts, remittance, credit, insurance, and pension.',
      eligibility: 'All Indian citizens',
      benefits: 'Zero balance account, RuPay debit card, accidental insurance cover of ₹1 lakh',
      documents: ['Aadhar Card', 'Passport size photograph', 'Address proof'],
      howToApply: ['Visit nearest bank branch or CSC', 'Fill the account opening form', 'Submit required documents', 'Account will be opened instantly'],
      officialWebsite: 'https://pmjdy.gov.in/',
    },
    {
      id: 2,
      name: 'Ayushman Bharat - PM-JAY',
      category: 'Health',
      description: 'World\'s largest health insurance scheme providing health cover of ₹5 lakhs per family per year for secondary and tertiary care hospitalization.',
      eligibility: 'Poor and vulnerable families based on SECC database',
      benefits: 'Cashless treatment, coverage up to ₹5 lakh per family annually',
      documents: ['Aadhar Card', 'Ration Card', 'Mobile Number', 'Address Proof'],
      howToApply: ['Check eligibility on official portal', 'Visit nearest empanelled hospital', 'Present Aadhar card for verification', 'Receive Ayushman card'],
      officialWebsite: 'https://pmjay.gov.in/',
    },
    {
      id: 3,
      name: 'PM Kisan Samman Nidhi',
      category: 'Agriculture',
      description: 'Income support scheme for all landholding farmers families to supplement financial needs for agriculture-related inputs.',
      eligibility: 'All landholding farmers',
      benefits: '₹6,000 per year in three equal installments',
      documents: ['Land ownership papers', 'Aadhar Card', 'Bank account details', 'Mobile number'],
      howToApply: ['Register on PM-Kisan portal', 'Enter Aadhar number and bank details', 'Upload land records', 'Verify details at nearest CSC'],
      officialWebsite: 'https://pmkisan.gov.in/',
    },
    {
      id: 4,
      name: 'Pradhan Mantri Awas Yojana',
      category: 'Housing',
      description: 'Government initiative to provide affordable housing to urban and rural poor with a target of building 2 crore affordable houses.',
      eligibility: 'EWS/LIG households without pucca house',
      benefits: 'Subsidy on home loans, financial assistance for house construction',
    },
    {
      id: 5,
      name: 'Skill India Mission',
      category: 'Employment',
      description: 'Campaign to train over 40 crore people in different skills by 2022 through various skill development programs.',
      eligibility: 'Youth aged 15-45 years',
      benefits: 'Free skill training, certification, placement assistance',
    },
    {
      id: 6,
      name: 'Mudra Loan Scheme',
      category: 'Business',
      description: 'Provides loans up to ₹10 lakh to small businesses and entrepreneurs for setting up or expanding their ventures.',
      eligibility: 'Micro and small business units',
      benefits: 'Collateral-free loans up to ₹10 lakh',
    },
    {
      id: 7,
      name: 'National Education Policy',
      category: 'Education',
      description: 'Comprehensive framework for elementary education to higher education, vocational training in both rural and urban India.',
      eligibility: 'All students in India',
      benefits: 'Universal access to quality education, multidisciplinary approach',
    },
    {
      id: 8,
      name: 'PM Fasal Bima Yojana',
      category: 'Agriculture',
      description: 'Crop insurance scheme providing insurance coverage and financial support to farmers in the event of crop loss.',
      eligibility: 'All farmers growing notified crops',
      benefits: 'Comprehensive risk coverage, low premium rates',
    },
    {
      id: 9,
      name: 'Stand Up India',
      category: 'Business',
      description: 'Facilitates bank loans between ₹10 lakh and ₹1 crore to SC/ST and women entrepreneurs for setting up greenfield enterprises.',
      eligibility: 'SC/ST and women entrepreneurs',
      benefits: 'Loans from ₹10 lakh to ₹1 crore for greenfield enterprises',
    },
  ];

  const categories = ['All', 'Education', 'Health', 'Agriculture', 'Employment', 'Housing', 'Business', 'Social Welfare'];

  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch = scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         scheme.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || scheme.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const faqs = [
    {
      q: 'How do I apply for government schemes?',
      a: 'Most schemes can be applied through their official portals or through Common Service Centers (CSC). You can also visit our services page to check if we facilitate applications for specific schemes.',
    },
    {
      q: 'What documents are generally required?',
      a: 'Common documents include Aadhar card, income certificate, caste certificate (if applicable), bank account details, and address proof. Specific requirements vary by scheme.',
    },
    {
      q: 'How can I check if I\'m eligible for a scheme?',
      a: 'Each scheme has specific eligibility criteria mentioned in its details. You can also visit the official scheme website or contact our support team for assistance.',
    },
    {
      q: 'How long does it take to get scheme benefits?',
      a: 'Processing time varies by scheme. Some provide instant benefits upon approval, while others may take 30-90 days for verification and disbursement.',
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`, color: 'white', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Stack spacing={2} alignItems="center" textAlign="center">
            <AccountBalanceIcon sx={{ fontSize: 64 }} />
            <Typography variant="h3" component="h1" fontWeight="bold">
              Government Schemes Information
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: 'md', opacity: 0.9 }}>
              Explore various government schemes and programs designed to support citizens across Maharashtra
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Search and Filter Section */}
      <Container sx={{ py: 6 }}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            placeholder="Search for schemes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 'md', mx: 'auto' }}
          />

          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" useFlexGap>
            {categories.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                onClick={() => setSelectedCategory(cat)}
                color={selectedCategory === cat ? 'primary' : 'default'}
                variant={selectedCategory === cat ? 'filled' : 'outlined'}
              />
            ))}
          </Stack>
        </Stack>
      </Container>

      {/* Schemes Grid */}
      <Container sx={{ pb: 8 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 4 }}>
          Available Schemes ({filteredSchemes.length})
        </Typography>
        <Grid container spacing={3}>
          {filteredSchemes.map((scheme) => (
            <Grid item xs={12} md={6} lg={4} key={scheme.id}>
              <SchemeCard scheme={scheme} onLearnMore={handleLearnMore} />
            </Grid>
          ))}
        </Grid>
        {filteredSchemes.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No schemes found matching your criteria
            </Typography>
          </Box>
        )}
      </Container>

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

      {/* Scheme Detail Dialog */}
      <SchemeDetailDialog open={dialogOpen} onClose={handleCloseDialog} scheme={selectedScheme} />
    </Box>
  );
}
