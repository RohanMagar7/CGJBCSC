import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  Alert,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { Send, ArrowBack } from '@mui/icons-material';
import apiService from '../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const NewApplication = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchServices();
    // Pre-select service if passed from previous page
    if (location.state?.service) {
      setSelectedService(location.state.service.service_id);
    }
  }, [location.state]);

  const fetchServices = async () => {
    try {
      const response = await apiService.getServices();
      setServices(response.data);
    } catch (err) {
      setError('Failed to load services');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedService) {
      setError('Please select a service');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await apiService.createApplication({
        user: user.user_id,
        service: selectedService,
        status: 'Pending',
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/applications/${response.data.application_id}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const selectedServiceData = services.find(s => s.service_id === selectedService);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/')}
        sx={{ mb: 3 }}
      >
        Back to Dashboard
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          New Application
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Select a service and submit your application
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Application submitted successfully! Redirecting...
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Select Service"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                required
                disabled={submitting || success}
                helperText="Choose the service you want to apply for"
              >
                {services.map((service) => (
                  <MenuItem key={service.service_id} value={service.service_id}>
                    {service.service_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {selectedServiceData && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Service Details
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 1 }}>
                      {selectedServiceData.service_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedServiceData.description || 'No description available'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                  Important Information:
                </Typography>
                <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 0 }}>
                  <li>After submission, you can upload required documents</li>
                  <li>Your application will be reviewed by our admin team</li>
                  <li>You will receive email notifications on status changes</li>
                  <li>Supported document formats: PDF, JPEG, PNG (Max 5MB)</li>
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/')}
                  disabled={submitting || success}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<Send />}
                  disabled={submitting || success || !selectedService}
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default NewApplication;
