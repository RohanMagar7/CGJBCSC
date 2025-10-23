import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Avatar,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  styled,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  AttachMoney,
  Schedule,
  Send,
  Close,
  CheckCircle,
  Payment,
  CloudUpload,
  Info,
  ArrowForward,
  MonetizationOn,
  AccessTime,
} from '@mui/icons-material';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const ServiceCard = ({ service, onApply }) => {
    const theme = useTheme();
    return (
        <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[8],
            }
        }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mb: 2 }}>
                    <DescriptionIcon />
                </Avatar>
                <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                    {service.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {service.description}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                    <MonetizationOn fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                        Price: ${service.price}
                    </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                    <AccessTime fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                        Turnaround: {service.turnaround_time}
                    </Typography>
                </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                <Button 
                    variant="contained" 
                    endIcon={<ArrowForward />}
                    onClick={() => onApply(service)}
                >
                    Apply Now
                </Button>
            </CardActions>
        </Card>
    );
};

const ApplicationDialog = ({ open, onClose, service, user }) => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [documentFiles, setDocumentFiles] = useState({});
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const steps = ['Upload Documents', 'Payment & Confirmation'];

    const handleFileChange = (e, docId) => {
        const file = e.target.files[0];
        if (file) {
            setDocumentFiles(prev => ({ ...prev, [docId]: file }));
        }
    };

    const handleNext = () => {
        if (activeStep === 0) {
            // Validate if all required documents are uploaded
            const allDocsUploaded = service.required_documents.every(doc => documentFiles[doc.id]);
            if (!allDocsUploaded) {
                setError('Please upload all required documents.');
                return;
            }
        }
        setError('');
        setActiveStep(prev => prev + 1);
    };

    const handleBack = () => setActiveStep(prev => prev - 1);

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');
        setSuccess('');

        const applicationData = new FormData();
        applicationData.append('service', service.id);
        applicationData.append('user', user.id);
        applicationData.append('payment_method', paymentMethod);
        applicationData.append('notes', notes);
        applicationData.append('status', 'Pending');

        Object.entries(documentFiles).forEach(([docId, file]) => {
            applicationData.append(`document_${docId}`, file, file.name);
        });

        try {
            await apiService.createApplication(applicationData);
            setSuccess('Application submitted successfully! You will be redirected shortly.');
            setTimeout(() => {
                onClose();
                navigate('/applications');
            }, 3000);
        } catch (err) {
            setError('Failed to submit application. Please try again.');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };
    
    useEffect(() => {
        if (open) {
            setActiveStep(0);
            setDocumentFiles({});
            setPaymentMethod('Cash');
            setNotes('');
            setError('');
            setSuccess('');
            setSubmitting(false);
        }
    }, [open]);

    if (!service) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    Apply for: {service.name}
                    <IconButton onClick={onClose}><Close /></IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map(label => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                {activeStep === 0 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>Required Documents</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>Please upload the following documents to proceed.</Typography>
                        <List>
                            {service.required_documents.map(doc => (
                                <ListItem key={doc.id} divider>
                                    <ListItemIcon><DescriptionIcon /></ListItemIcon>
                                    <ListItemText 
                                        primary={doc.name} 
                                        secondary={documentFiles[doc.id] ? `File: ${documentFiles[doc.id].name}` : 'No file selected'}
                                    />
                                    <Button
                                        component="label"
                                        role={undefined}
                                        variant="contained"
                                        tabIndex={-1}
                                        startIcon={<CloudUpload />}
                                        color={documentFiles[doc.id] ? 'success' : 'primary'}
                                    >
                                        {documentFiles[doc.id] ? 'Change File' : 'Upload'}
                                        <VisuallyHiddenInput type="file" onChange={(e) => handleFileChange(e, doc.id)} />
                                    </Button>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}

                {activeStep === 1 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>Payment and Final Notes</Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="payment-method-label">Payment Method</InputLabel>
                                    <Select
                                        labelId="payment-method-label"
                                        value={paymentMethod}
                                        label="Payment Method"
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    >
                                        <MenuItem value="Cash">Cash</MenuItem>
                                        <MenuItem value="Card">Card</MenuItem>
                                        <MenuItem value="Online">Online</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                             <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Additional Notes (Optional)"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button disabled={activeStep === 0} onClick={handleBack}>Back</Button>
                <Box sx={{ flex: '1 1 auto' }} />
                {activeStep === steps.length - 1 ? (
                    <Button variant="contained" color="primary" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Confirm & Submit'}
                    </Button>
                ) : (
                    <Button variant="contained" onClick={handleNext}>Next</Button>
                )}
            </DialogActions>
        </Dialog>
    );
};


export default function Services() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await apiService.getServices();
        setServices(response.data || response);
      } catch (err) {
        setError('Failed to fetch services. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleApplyClick = (service) => {
    setSelectedService(service);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedService(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                Our Services
            </Typography>
            <Typography variant="h6" color="text.secondary">
                Find the right service to meet your needs. Fast, simple, and secure.
            </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

        <Grid container spacing={4}>
            {services.map((service) => (
            <Grid item key={service.id} xs={12} sm={6} md={4}>
                <ServiceCard service={service} onApply={handleApplyClick} />
            </Grid>
            ))}
        </Grid>

        <ApplicationDialog 
            open={openDialog}
            onClose={handleCloseDialog}
            service={selectedService}
            user={user}
        />
    </Container>
  );
}
