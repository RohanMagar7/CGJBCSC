import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  IconButton,
  Stack,
  Switch,
  FormControlLabel,
  DialogContentText,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  AccountBalance as AccountBalanceIcon,
  School as SchoolIcon,
  LocalHospital as LocalHospitalIcon,
  Agriculture as AgricultureIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  WorkOutline as WorkOutlineIcon,
  EmojiEvents as EmojiEventsIcon,
} from '@mui/icons-material';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SchemeCard = ({ scheme, onEdit, onDelete }) => {
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
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {scheme.description.substring(0, 100)}...
        </Typography>
        <Chip 
          label={scheme.is_active ? 'Active' : 'Inactive'} 
          color={scheme.is_active ? 'success' : 'default'} 
          size="small" 
          sx={{ mt: 1 }}
        />
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
        <Button size="small" startIcon={<EditIcon />} onClick={() => onEdit(scheme)}>
          Edit
        </Button>
        <Button size="small" startIcon={<DeleteIcon />} color="error" onClick={() => onDelete(scheme)}>
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

const SchemeDialog = ({ open, onClose, scheme, onSave, formErrors }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Social Welfare',
    description: '',
    eligibility: '',
    benefits: '',
    documents: '',
    how_to_apply: '',
    official_website: '',
    is_active: true,
  });

  useEffect(() => {
    if (scheme) {
      setFormData({
        name: scheme.name || '',
        category: scheme.category || 'Social Welfare',
        description: scheme.description || '',
        eligibility: scheme.eligibility || '',
        benefits: scheme.benefits || '',
        documents: Array.isArray(scheme.documents) ? scheme.documents.join('\n') : (scheme.documents || ''),
        how_to_apply: Array.isArray(scheme.howToApply) ? scheme.howToApply.join('\n') : (scheme.how_to_apply || ''),
        official_website: scheme.officialWebsite || scheme.official_website || '',
        is_active: scheme.is_active !== undefined ? scheme.is_active : true,
      });
    } else {
      setFormData({
        name: '',
        category: 'Social Welfare',
        description: '',
        eligibility: '',
        benefits: '',
        documents: '',
        how_to_apply: '',
        official_website: '',
        is_active: true,
      });
    }
  }, [scheme, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          {scheme ? 'Edit Government Scheme' : 'Create New Government Scheme'}
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 2 }}>
          <TextField
            name="name"
            label="Scheme Name"
            fullWidth
            required
            value={formData.name}
            onChange={handleChange}
            error={!!formErrors.name}
            helperText={formErrors.name || 'Enter the full name of the government scheme'}
          />
          
          <FormControl fullWidth required error={!!formErrors.category}>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              label="Category"
              value={formData.category}
              onChange={handleChange}
            >
              <MenuItem value="Education">Education</MenuItem>
              <MenuItem value="Health">Health</MenuItem>
              <MenuItem value="Agriculture">Agriculture</MenuItem>
              <MenuItem value="Employment">Employment</MenuItem>
              <MenuItem value="Housing">Housing</MenuItem>
              <MenuItem value="Business">Business</MenuItem>
              <MenuItem value="Social Welfare">Social Welfare</MenuItem>
            </Select>
          </FormControl>

          <TextField
            name="description"
            label="Description"
            fullWidth
            required
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange}
            error={!!formErrors.description}
            helperText={formErrors.description || 'Brief description of the scheme'}
          />

          <TextField
            name="eligibility"
            label="Eligibility Criteria"
            fullWidth
            required
            multiline
            rows={2}
            value={formData.eligibility}
            onChange={handleChange}
            error={!!formErrors.eligibility}
            helperText={formErrors.eligibility || 'Who can apply for this scheme'}
          />

          <TextField
            name="benefits"
            label="Benefits"
            fullWidth
            required
            multiline
            rows={2}
            value={formData.benefits}
            onChange={handleChange}
            error={!!formErrors.benefits}
            helperText={formErrors.benefits || 'What benefits does this scheme provide'}
          />

          <TextField
            name="documents"
            label="Required Documents"
            fullWidth
            multiline
            rows={3}
            value={formData.documents}
            onChange={handleChange}
            error={!!formErrors.documents}
            helperText="Enter each document on a new line"
          />

          <TextField
            name="how_to_apply"
            label="How to Apply"
            fullWidth
            multiline
            rows={3}
            value={formData.how_to_apply}
            onChange={handleChange}
            error={!!formErrors.how_to_apply}
            helperText="Enter each step on a new line"
          />

          <TextField
            name="official_website"
            label="Official Website"
            fullWidth
            value={formData.official_website}
            onChange={handleChange}
            error={!!formErrors.official_website}
            helperText="Enter the complete URL (e.g., https://example.gov.in)"
          />

          <FormControlLabel
            control={
              <Switch 
                name="is_active" 
                checked={formData.is_active} 
                onChange={handleChange} 
              />
            }
            label="Active (Show on website)"
          />
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {scheme ? 'Update' : 'Create'} Scheme
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function AdminGovSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getGovSchemes();
      setSchemes(response.data || []);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to fetch government schemes';
      setError(`Failed to fetch government schemes: ${errorMsg}`);
      console.error('Gov Schemes fetch error:', err);
      console.error('Error response:', err.response);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (scheme = null) => {
    setSelectedScheme(scheme);
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedScheme(null);
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.name.trim()) errors.name = 'Scheme name is required';
    if (!data.description.trim()) errors.description = 'Description is required';
    if (!data.eligibility.trim()) errors.eligibility = 'Eligibility criteria is required';
    if (!data.benefits.trim()) errors.benefits = 'Benefits are required';
    if (data.official_website && !data.official_website.match(/^https?:\/\/.+/)) {
      errors.official_website = 'Please enter a valid URL';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (formData) => {
    if (!validateForm(formData)) return;

    // Convert documents and how_to_apply from strings to arrays
    const processedData = {
      ...formData,
      documents: formData.documents ? formData.documents.split('\n').filter(d => d.trim()) : [],
      how_to_apply: formData.how_to_apply ? formData.how_to_apply.split('\n').filter(s => s.trim()) : [],
    };

    const apiCall = selectedScheme
      ? apiService.updateGovScheme(selectedScheme.id, processedData)
      : apiService.createGovScheme(processedData);

    try {
      await apiCall;
      setSuccess(`Government scheme ${selectedScheme ? 'updated' : 'created'} successfully`);
      fetchSchemes();
      handleCloseDialog();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data || err.message || 'Unknown error';
      setError(`Failed to ${selectedScheme ? 'update' : 'create'} scheme: ${JSON.stringify(errorMsg)}`);
      console.error('Save error:', err);
      console.error('Error response:', err.response);
    }
  };

  const handleOpenDeleteDialog = (scheme) => {
    setSelectedScheme(scheme);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedScheme(null);
  };

  const handleDelete = async () => {
    if (!selectedScheme) return;
    try {
      await apiService.deleteGovScheme(selectedScheme.id);
      setSuccess('Government scheme deleted successfully');
      fetchSchemes();
      handleCloseDeleteDialog();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data || err.message || 'Unknown error';
      setError(`Failed to delete scheme: ${JSON.stringify(errorMsg)}`);
      console.error('Delete error:', err);
      console.error('Error response:', err.response);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container sx={{ py: 8 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={{ xs: 2, sm: 1 }}
        mb={4}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Government Schemes
          </Typography>
          <Typography color="text.secondary">
            Manage government schemes information displayed to users
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          New Scheme
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3}>
        {schemes.length > 0 ? (
          schemes.map((scheme) => (
            <Grid item key={scheme.id} xs={12} sm={6} md={4}>
              <SchemeCard 
                scheme={scheme} 
                onEdit={handleOpenDialog}
                onDelete={handleOpenDeleteDialog}
              />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ textAlign: 'center', p: 4 }}>
              <AccountBalanceIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
              <Typography variant="h6" mt={2}>No Government Schemes Found</Typography>
              <Typography color="text.secondary">
                Click "New Scheme" to create one
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      <SchemeDialog 
        open={dialogOpen}
        onClose={handleCloseDialog}
        scheme={selectedScheme}
        onSave={handleSave}
        formErrors={formErrors}
      />

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the scheme: "{selectedScheme?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
