import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
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
  Divider,
  IconButton,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
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
  AccessTime,
  MonetizationOn,
  CardTravel,
} from '@mui/icons-material';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

export default function Services() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Application Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  
  // Form Data - Changed to object to track documents by required document ID
  const [documentFiles, setDocumentFiles] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');

  const steps = ['Select Service', 'Upload Documents', 'Confirm & Submit'];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiService.getServices();
      setServices(response.data || response);
      setError('');
    } catch (err) {
      setError('Failed to fetch services');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (service) => {
    setSelectedService(service);
    setActiveStep(0);
    setDocumentFiles({});
    setPaymentMethod('Cash');
    setNotes('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedService(null);
    setActiveStep(0);
    setDocumentFiles({});
    setPaymentMethod('Cash');
    setNotes('');
  };

  const handleFileChange = (requiredDocId, file) => {
    setDocumentFiles((prev) => ({
      ...prev,
      [requiredDocId]: file,
    }));
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Step 0: Service selected, move to documents
      setActiveStep(1);
    } else if (activeStep === 1) {
      // Step 1: Check if all mandatory documents are uploaded
      const requiredDocs = selectedService?.required_documents || [];
      const mandatoryDocs = requiredDocs.filter((doc) => doc.is_mandatory);
      
      const missingDocs = mandatoryDocs.filter(
        (doc) => !documentFiles[doc.required_doc_id]
      );
      
      if (missingDocs.length > 0) {
        setError(
          `Please upload all required documents: ${missingDocs
            .map((d) => d.document_name)
            .join(', ')}`
        );
        return;
      }
      
      if (Object.keys(documentFiles).length === 0) {
        setError('Please upload at least one document');
        return;
      }
      
      setError('');
      setActiveStep(2);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmitApplication = async () => {
    if (!selectedService) return;

    setSubmitting(true);
    setError('');

    try {
      // Step 1: Create the application
      const applicationData = {
        user: user.user_id,
        service: selectedService.service_id,
        status: 'Pending',
      };

      const appResponse = await apiService.createApplication(applicationData);
      const applicationId = appResponse.data.application_id;

      // Step 2: Upload documents with their names and required document links
      for (const [requiredDocId, file] of Object.entries(documentFiles)) {
        const requiredDoc = selectedService.required_documents.find(
          (d) => d.required_doc_id === parseInt(requiredDocId)
        );
        const documentName = requiredDoc?.document_name || 'Document';
        
        await apiService.uploadDocument(
          applicationId,
          file,
          documentName,
          parseInt(requiredDocId)
        );
      }

      // Step 3: Create payment record (pending status)
      const paymentData = {
        application: applicationId,
        amount: parseFloat(selectedService.price),
        payment_method: paymentMethod,
        payment_status: 'Pending',
        notes: notes || `Payment for ${selectedService.service_name}`,
      };

      await apiService.createPayment(paymentData);

      setSuccess(
        `Application submitted successfully! Your application will be reviewed by admin. ` +
        `Payment of ₹${selectedService.price} is required after approval. ` +
        `Payment Method: ${paymentMethod}`
      );

      setTimeout(() => {
        handleCloseDialog();
        navigate('/applications');
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Failed to submit application. Please try again.'
      );
      console.error('Application submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2 } }}>
      <Container maxWidth="lg">
        {/* Hero Header */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            mb: { xs: 2, sm: 3, md: 4 },
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: { xs: 2, sm: 3 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, flexDirection: { xs: 'column', sm: 'row' }, textAlign: { xs: 'center', sm: 'left' } }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: { xs: 48, sm: 56 }, height: { xs: 48, sm: 56 } }}>
              <CardTravel sx={{ fontSize: { xs: 28, sm: 32 } }} />
            </Avatar>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}>
                Available Services
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                Browse and apply for government services
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Alerts */}
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: { xs: 2, sm: 3 }, borderRadius: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            {error}
          </Alert>
        )}

        {/* Services Grid */}
        {services.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, sm: 6, md: 8 },
              textAlign: 'center',
              borderRadius: { xs: 2, sm: 3 },
              border: '2px dashed',
              borderColor: 'divider',
            }}
          >
            <Avatar
              sx={{
                width: { xs: 60, sm: 80 },
                height: { xs: 60, sm: 80 },
                bgcolor: alpha('#667eea', 0.1),
                color: 'primary.main',
                margin: '0 auto',
                mb: 2,
              }}
            >
              <CardTravel sx={{ fontSize: { xs: 32, sm: 40 } }} />
            </Avatar>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              No Services Available
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Please check back later for available services
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            {services.map((service) => (
              <Grid item xs={12} sm={6} lg={4} key={service.service_id}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: { xs: 2, sm: 3 },
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: { xs: 'translateY(-4px)', sm: 'translateY(-8px)' },
                      boxShadow: '0 12px 24px rgba(102, 126, 234, 0.2)',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 }, flexGrow: 1 }}>
                    {/* Service Icon & Title */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1.5, sm: 2 }, mb: { xs: 1.5, sm: 2 }, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha('#667eea', 0.1),
                          color: 'primary.main',
                          width: { xs: 48, sm: 56 },
                          height: { xs: 48, sm: 56 },
                        }}
                      >
                        <DescriptionIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
                      </Avatar>
                      <Box sx={{ flex: 1, width: '100%' }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' } }}>
                          {service.service_name}
                        </Typography>
                        <Chip
                          label={`Service #${service.service_id}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
                        />
                      </Box>
                    </Box>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: { xs: 1.5, sm: 2 },
                        minHeight: { xs: 48, sm: 60 },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      }}
                    >
                      {service.description}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    {/* Service Details */}
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <MonetizationOn sx={{ fontSize: 20, color: 'success.main' }} />
                          <Typography variant="caption" color="text.secondary">
                            Fee
                          </Typography>
                        </Box>
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          ₹{parseFloat(service.price).toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <AccessTime sx={{ fontSize: 20, color: 'primary.main' }} />
                          <Typography variant="caption" color="text.secondary">
                            Processing
                          </Typography>
                        </Box>
                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                          {service.processing_days} days
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>

                  <Divider />

                  {/* Actions */}
                  <CardActions sx={{ p: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      startIcon={<Send />}
                      onClick={() => handleApplyClick(service)}
                      sx={{
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5568d3 0%, #66398f 100%)',
                        },
                      }}
                    >
                      Apply Now
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Application Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          fullScreen={window.innerWidth < 600}
          PaperProps={{
            sx: { borderRadius: { xs: 0, sm: 3 }, m: { xs: 0, sm: 2 } },
          }}
        >
          <DialogTitle sx={{ pb: 1, px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
                <Avatar sx={{ bgcolor: alpha('#667eea', 0.1), color: 'primary.main', width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}>
                  <Send sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    Apply for Service
                  </Typography>
                  {selectedService && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      {selectedService.service_name}
                    </Typography>
                  )}
                </Box>
              </Box>
              <IconButton onClick={handleCloseDialog} size="small">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <Divider />

          <DialogContent sx={{ pt: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
            {success && (
              <Alert severity="success" icon={<CheckCircle />} sx={{ mb: { xs: 2, sm: 3 }, borderRadius: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                {success}
              </Alert>
            )}

            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step Content */}
            {activeStep === 0 && selectedService && (
              <Box>
                <Paper
                  elevation={0}
                  sx={{ p: 3, bgcolor: alpha('#667eea', 0.05), borderRadius: 2, mb: 3 }}
                >
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    {selectedService.service_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {selectedService.description}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoney color="success" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Service Fee
                          </Typography>
                          <Typography variant="h6" color="success.main" fontWeight="bold">
                            ₹{parseFloat(selectedService.price).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Schedule color="primary" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Processing Time
                          </Typography>
                          <Typography variant="h6" color="primary.main" fontWeight="bold">
                            {selectedService.processing_days} days
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>

                <Alert severity="info" icon={<Info />} sx={{ borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Application Process:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="1. Upload required documents" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="2. Submit application for review" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="3. Admin reviews your application" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Payment color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={`4. Pay ₹${selectedService.price} after approval`} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <DescriptionIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="5. Receive your final document" />
                    </ListItem>
                  </List>
                </Alert>
              </Box>
            )}

            {activeStep === 1 && selectedService && (
              <Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Upload Required Documents
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Please upload all required documents (PDF, JPG, PNG). Maximum file size: 5MB per file.
                </Typography>

                {/* Show Required Documents List */}
                {selectedService.required_documents && selectedService.required_documents.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {selectedService.required_documents.map((reqDoc) => (
                      <Paper
                        key={reqDoc.required_doc_id}
                        elevation={0}
                        sx={{
                          p: 3,
                          border: '1px solid',
                          borderColor: documentFiles[reqDoc.required_doc_id]
                            ? 'success.main'
                            : reqDoc.is_mandatory
                            ? 'error.light'
                            : 'divider',
                          borderRadius: 2,
                          bgcolor: documentFiles[reqDoc.required_doc_id]
                            ? alpha('#43e97b', 0.05)
                            : 'transparent',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {reqDoc.document_name}
                              </Typography>
                              {reqDoc.is_mandatory ? (
                                <Chip
                                  label="Required"
                                  size="small"
                                  color="error"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              ) : (
                                <Chip
                                  label="Optional"
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    bgcolor: alpha('#ff9800', 0.1),
                                    color: '#ff9800',
                                  }}
                                />
                              )}
                            </Box>
                            {reqDoc.description && (
                              <Typography variant="body2" color="text.secondary">
                                {reqDoc.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Button
                            variant={documentFiles[reqDoc.required_doc_id] ? 'outlined' : 'contained'}
                            component="label"
                            startIcon={
                              documentFiles[reqDoc.required_doc_id] ? (
                                <CheckCircle />
                              ) : (
                                <CloudUpload />
                              )
                            }
                            color={documentFiles[reqDoc.required_doc_id] ? 'success' : 'primary'}
                            sx={{ borderRadius: 2 }}
                          >
                            {documentFiles[reqDoc.required_doc_id]
                              ? 'Change File'
                              : 'Choose File'}
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  handleFileChange(reqDoc.required_doc_id, file);
                                }
                              }}
                              style={{ display: 'none' }}
                            />
                          </Button>

                          {documentFiles[reqDoc.required_doc_id] && (
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" fontWeight="500">
                                {documentFiles[reqDoc.required_doc_id].name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {(
                                  documentFiles[reqDoc.required_doc_id].size / 1024
                                ).toFixed(2)}{' '}
                                KB
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                ) : (
                  <Alert severity="warning" sx={{ borderRadius: 2 }}>
                    <Typography variant="body2">
                      No specific documents are required for this service. You can upload any relevant documents.
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        mt: 2,
                        border: '2px dashed',
                        borderColor: 'divider',
                        borderRadius: 2,
                        textAlign: 'center',
                        bgcolor: alpha('#667eea', 0.02),
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: alpha('#667eea', 0.05),
                        },
                      }}
                      component="label"
                    >
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleFileChange('general', file);
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                      <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                      <Typography variant="body2" fontWeight="500">
                        Click to Upload Document
                      </Typography>
                    </Paper>
                    {documentFiles['general'] && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: alpha('#43e97b', 0.05), borderRadius: 2 }}>
                        <Typography variant="body2" fontWeight="500">
                          {documentFiles['general'].name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(documentFiles['general'].size / 1024).toFixed(2)} KB
                        </Typography>
                      </Box>
                    )}
                  </Alert>
                )}
              </Box>
            )}

            {activeStep === 2 && selectedService && (
              <Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Confirm & Submit Application
                </Typography>

                <Paper
                  elevation={0}
                  sx={{ p: 3, bgcolor: alpha('#4caf50', 0.05), borderRadius: 2, mb: 3 }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Service
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {selectedService.service_name}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Fee Amount
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" color="success.main">
                        ₹{parseFloat(selectedService.price).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Documents Uploaded
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {Object.keys(documentFiles).length} file(s)
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Show uploaded documents list */}
                {Object.keys(documentFiles).length > 0 && (
                  <Paper
                    elevation={0}
                    sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      Uploaded Documents:
                    </Typography>
                    <List dense>
                      {Object.entries(documentFiles).map(([reqDocId, file]) => {
                        const reqDoc = selectedService.required_documents?.find(
                          (d) => d.required_doc_id === parseInt(reqDocId)
                        );
                        return (
                          <ListItem key={reqDocId}>
                            <ListItemIcon>
                              <CheckCircle color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={reqDoc?.document_name || 'Document'}
                              secondary={`${file.name} (${(file.size / 1024).toFixed(2)} KB)`}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </Paper>
                )}

                <FormControl fullWidth margin="normal">
                  <InputLabel>Preferred Payment Method</InputLabel>
                  <Select
                    value={paymentMethod}
                    label="Preferred Payment Method"
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <Payment />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="Cash">Cash (Pay at Office)</MenuItem>
                    <MenuItem value="UPI">UPI</MenuItem>
                    <MenuItem value="QR">QR Code</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Additional Notes (Optional)"
                  multiline
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  margin="normal"
                  placeholder="Any additional information for the admin..."
                />

                <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Important:
                  </Typography>
                  <Typography variant="body2">
                    • Payment of ₹{selectedService.price} will be required <strong>after admin approval</strong>
                    <br />
                    • You will be notified via email when your application is approved
                    <br />• Processing time: {selectedService.processing_days} days after payment
                  </Typography>
                </Alert>
              </Box>
            )}
          </DialogContent>

          <Divider />

          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{ borderRadius: 2 }}
              disabled={submitting}
            >
              Cancel
            </Button>
            {activeStep > 0 && (
              <Button
                onClick={handleBack}
                variant="outlined"
                sx={{ borderRadius: 2 }}
                disabled={submitting}
              >
                Back
              </Button>
            )}
            {activeStep < 2 ? (
              <Button
                onClick={handleNext}
                variant="contained"
                sx={{ borderRadius: 2, minWidth: 120 }}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmitApplication}
                variant="contained"
                startIcon={<Send />}
                sx={{ borderRadius: 2, minWidth: 120 }}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
