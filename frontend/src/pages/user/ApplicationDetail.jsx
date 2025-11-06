import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Divider,
  Card,
  CardContent,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Description,
  CloudUpload,
  Delete,
  Download,
  CheckCircle,
  Payment,
} from '@mui/icons-material';
import apiService from '../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [application, setApplication] = useState(null);
  const [service, setService] = useState(null);
  const [payment, setPayment] = useState(null);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [resubmitting, setResubmitting] = useState(false);
  const [resubmitDialogOpen, setResubmitDialogOpen] = useState(false);
  const [requiredDocsToUpload, setRequiredDocsToUpload] = useState([]);
  const [selectedResubmitFiles, setSelectedResubmitFiles] = useState({});
  const [resubmitUploading, setResubmitUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const appRes = await apiService.getApplication(id);
      setApplication(appRes.data);
      
      const serviceRes = await apiService.getService(appRes.data.service);
      setService(serviceRes.data);

      // Fetch payment information if application is approved
      if (appRes.data.status === 'Approved') {
        try {
          const paymentsRes = await apiService.getPayments();
          const userPayment = paymentsRes.data.find(p => p.application === appRes.data.application_id);
          if (userPayment) {
            setPayment(userPayment);
            
            // Fetch active payment settings to get UPI ID and QR code
            const settingsRes = await apiService.getActivePaymentSettings();
            console.log('Payment Settings Response:', settingsRes.data);
            setPaymentSettings(settingsRes.data);
          }
        } catch (err) {
          console.error('Failed to fetch payment info:', err);
        }
      }
    } catch (err) {
      setError('Failed to load application details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openResubmitDialog = async () => {
    if (!service) {
      setError('Service information not loaded');
      return;
    }

    try {
      // Fetch required documents for this service and determine which mandatory ones are missing
      const reqRes = await apiService.getRequiredDocumentsByService(service.service_id || service.serviceId || service.id);
      const required = reqRes.data || [];

      // Identify mandatory required docs
      const mandatory = required.filter((r) => r.is_mandatory);

      // Determine which mandatory docs are already uploaded for this application
      const uploadedRequiredIds = (application.documents || []).map((d) => (d.required_document ? d.required_document : d.required_document_id || null)).filter(Boolean);

      const missing = mandatory.filter((md) => !uploadedRequiredIds.includes(md.required_doc_id || md.id || md.required_document_id));

      // If nothing is missing, still open dialog to confirm resubmit
      setRequiredDocsToUpload(missing);
      setSelectedResubmitFiles({});
      setResubmitDialogOpen(true);
    } catch (err) {
      console.error('Failed to fetch required documents for resubmit:', err);
      throw err;
    }
  };

  const handleResubmitFileSelect = (requiredId, file) => {
    setSelectedResubmitFiles((prev) => ({ ...prev, [requiredId]: file }));
  };

  const handleSubmitResubmit = async () => {
    setResubmitUploading(true);
    setError('');
    try {
      // Upload each selected file for corresponding required document
      for (const rd of requiredDocsToUpload) {
        const rid = rd.required_doc_id || rd.id || rd.required_document_id;
        const file = selectedResubmitFiles[rid];
        if (!file) {
          throw new Error(`Please upload file for: ${rd.document_name}`);
        }
        await apiService.uploadDocument(application.application_id, file, rd.document_name || 'Document', rid);
      }

      // After uploads, call resubmit API
      await apiService.resubmitApplication(application.application_id, true);

      setResubmitDialogOpen(false);
      // refresh data
      await fetchData();
      alert('Application resubmitted successfully.');
    } catch (err) {
      console.error('Resubmit submit error:', err);
      const resp = err.response;
      if (resp && resp.data && resp.data.missing_documents) {
        setError(`Missing documents: ${resp.data.missing_documents.join(', ')}`);
      } else if (err.message) {
        setError(err.message);
      } else if (resp && resp.data && resp.data.detail) {
        setError(resp.data.detail);
      } else {
        setError('Failed to upload documents and resubmit');
      }
    } finally {
      setResubmitUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file
      const maxSize = 250 * 1024; // 250KB
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      
      if (file.size > maxSize) {
        setError(`File size must be less than 250KB. Your file is ${(file.size / 1024).toFixed(2)}KB.`);
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        setError('Only PDF, JPEG, and PNG files are allowed');
        return;
      }
      
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    try {
      // remember previous status to decide whether to auto-resubmit
      const previousStatus = application?.status;

      await apiService.uploadDocument(id, selectedFile);
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setError('');

      // If the application was previously rejected, attempt auto-resubmit
        if (previousStatus === 'Rejected') {
        setResubmitting(true);
        try {
          if (typeof apiService.resubmitApplication !== 'function') {
            throw new Error('resubmit API not available');
          }
          await apiService.resubmitApplication(application.application_id, true);
          // refresh data after resubmit
          await fetchData();
          // show brief success message
          setError('');
          // optional: small notification - using alert for now
          alert('Document uploaded and application resubmitted successfully.');
        } catch (err) {
          console.error('Auto-resubmit error:', err);
          const resp = err.response;
          if (resp && resp.data && resp.data.missing_documents) {
            setError(`Missing documents: ${resp.data.missing_documents.join(', ')}`);
          } else if (resp && resp.data && resp.data.detail) {
            setError(resp.data.detail);
          } else {
            setError('Document uploaded but failed to resubmit application');
          }
        } finally {
          setResubmitting(false);
        }
        return;
      }

      // Otherwise simply refresh data
      fetchData();
    } catch (err) {
      setError('Failed to upload document');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await apiService.deleteDocument(docId);
        fetchData();
      } catch (err) {
        setError('Failed to delete document');
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!application) return <Alert severity="error">Application not found</Alert>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/applications')}
        sx={{ mb: 3 }}
      >
        Back to Applications
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Application Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {service?.service_name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Application #{application.application_id}
            </Typography>
          </Box>
          <StatusBadge status={application.status} />
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Application Details */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Application Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Service"
                    secondary={service?.service_name}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Status"
                    secondary={<StatusBadge status={application.status} />}
                    secondaryTypographyProps={{ component: 'span' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Submitted On"
                    secondary={new Date(application.submitted_at).toLocaleString()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Last Updated"
                    secondary={new Date(application.updated_at).toLocaleString()}
                  />
                </ListItem>
                {application.reject_reason && (
                  <ListItem>
                    <ListItemText
                      primary="Rejection Reason"
                      secondary={application.reject_reason}
                      secondaryTypographyProps={{ color: 'error' }}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>

          {/* Payment Details - Show when Approved */}
          {application.status === 'Approved' && payment && (
            <Card elevation={2} sx={{ mt: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Payment color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Payment Information
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Alert severity="success" sx={{ mb: 2 }}>
                  Your application has been approved! Please proceed with payment.
                </Alert>

                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Amount to Pay"
                      secondary={
                        <Typography variant="h5" color="primary" fontWeight="bold">
                          NPR {service?.price || '0'}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Payment Method"
                      secondary={
                        <Chip 
                          label={payment.payment_method} 
                          color="primary" 
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Payment Status"
                      secondary={
                        <Chip 
                          label={payment.payment_status}
                          color={payment.payment_status === 'Completed' ? 'success' : 'warning'}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      }
                    />
                  </ListItem>
                </List>

                <Divider sx={{ my: 2 }} />

                {/* Debug: Show if payment settings are loaded */}
                {!paymentSettings && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Payment settings are being loaded...
                  </Alert>
                )}

                {paymentSettings && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      Available Payment Methods:
                    </Typography>
                    {paymentSettings.upi_id && (
                      <Typography variant="body2">✓ UPI Payment Available</Typography>
                    )}
                    {paymentSettings.qr_code_url && (
                      <Typography variant="body2">✓ QR Code Payment Available</Typography>
                    )}
                  </Alert>
                )}

                {/* Show UPI ID if available */}
                {paymentSettings?.upi_id && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      UPI ID
                    </Typography>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'grey.100',
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: 'primary.main'
                      }}
                    >
                      {paymentSettings.upi_id}
                    </Paper>
                  </Box>
                )}

                {/* Show UPI Number if available */}
                {paymentSettings?.upi_number && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      UPI Number
                    </Typography>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'grey.100',
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: 'primary.main'
                      }}
                    >
                      {paymentSettings.upi_number}
                    </Paper>
                  </Box>
                )}

                {/* Show QR Code if available */}
                {paymentSettings?.qr_code_url && (
                  <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Scan QR Code to Pay
                    </Typography>
                    <Box
                      component="img"
                      src={paymentSettings.qr_code_url}
                      alt="Payment QR Code"
                      sx={{
                        maxWidth: '300px',
                        width: '100%',
                        height: 'auto',
                        mt: 2,
                        border: '3px solid',
                        borderColor: 'primary.main',
                        borderRadius: 2,
                        p: 2,
                        bgcolor: 'white',
                        boxShadow: 2
                      }}
                    />
                  </Box>
                )}

                <Alert severity="info">
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Payment Instructions:
                  </Typography>
                  <Typography variant="body2">
                    {payment.payment_method === 'Cash' && 
                      'Please visit our office during business hours (10 AM - 5 PM) to complete your payment at the counter.'
                    }
                    {payment.payment_method === 'UPI' && 
                      'Complete your payment using any UPI app. After payment, the admin will verify your transaction.'
                    }
                    {payment.payment_method === 'QR' && 
                      'Scan the QR code using any UPI app to complete your payment. The admin will verify your transaction.'
                    }
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Documents */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Uploaded Documents
                </Typography>
                  <Box>
                    {application.status !== 'Completed' && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<CloudUpload />}
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    Upload
                  </Button>
                    )}

                    {/* Show Resubmit when application was rejected */}
                    {application.status === 'Rejected' && (
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        sx={{ ml: 1 }}
                        onClick={async () => {
                          // Open a dialog to let user upload missing required documents before resubmitting
                          try {
                            await openResubmitDialog();
                          } catch (err) {
                            console.error('Failed to open resubmit dialog:', err);
                            setError('Failed to prepare resubmit. Please try again.');
                          }
                        }}
                        disabled={resubmitting}
                      >
                        {resubmitting ? 'Resubmitting...' : 'Resubmit'}
                      </Button>
                    )}
                  </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {application.documents?.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                  No documents uploaded yet
                </Typography>
              ) : (
                <List dense>
                  {application.documents?.map((doc) => (
                    <ListItem
                      key={doc.document_id}
                      secondaryAction={
                        <>
                          <IconButton
                            edge="end"
                            href={doc.file_url}
                            target="_blank"
                            sx={{ mr: 1 }}
                          >
                            <Download />
                          </IconButton>
                          {application.status === 'Pending' && (
                            <IconButton
                              edge="end"
                              onClick={() => handleDeleteDocument(doc.document_id)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          )}
                        </>
                      }
                    >
                      <ListItemIcon>
                        <Description />
                      </ListItemIcon>
                      <ListItemText
                        primary={doc.document_name || `Document #${doc.document_id}`}
                        secondary={new Date(doc.uploaded_at).toLocaleDateString()}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Final Documents */}
          {application.final_document?.length > 0 && (
            <Card elevation={2} sx={{ mt: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircle color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Final Documents
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <List dense>
                  {application.final_document.map((doc) => (
                    <ListItem
                      key={doc.final_doc_id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          href={doc.file_url}
                          target="_blank"
                        >
                          <Download />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <Description color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Final Document #${doc.final_doc_id}`}
                        secondary={new Date(doc.uploaded_at).toLocaleDateString()}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <input
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              id="file-upload"
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="file-upload">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                startIcon={<CloudUpload />}
              >
                Choose File
              </Button>
            </label>
            
            {selectedFile && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </Alert>
            )}
            
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
              Accepted: PDF, JPEG, PNG (Max 250KB)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resubmit Dialog: Upload missing required documents then resubmit */}
      <Dialog open={resubmitDialogOpen} onClose={() => setResubmitDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Resubmit Application - Upload Required Documents</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {requiredDocsToUpload.length === 0 ? (
              <Alert severity="info">No mandatory documents appear to be missing. Click Submit to proceed with resubmission.</Alert>
            ) : (
              requiredDocsToUpload.map((rd) => {
                const rid = rd.required_doc_id || rd.id || rd.required_document_id;
                return (
                  <Box key={rid} sx={{ border: '1px solid', borderColor: 'divider', p: 2, borderRadius: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">{rd.document_name}</Typography>
                    <Typography variant="caption" color="text.secondary">{rd.is_mandatory ? 'Required' : 'Optional'}</Typography>
                    <Box sx={{ mt: 1 }}>
                      <input
                        accept=".pdf,.jpg,.jpeg,.png"
                        style={{ display: 'none' }}
                        id={`resubmit-file-${rid}`}
                        type="file"
                        onChange={(e) => handleResubmitFileSelect(rid, e.target.files[0])}
                      />
                      <label htmlFor={`resubmit-file-${rid}`}>
                        <Button variant="outlined" component="span" startIcon={<CloudUpload />}>
                          Choose File
                        </Button>
                      </label>
                      {selectedResubmitFiles[rid] && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Selected: {selectedResubmitFiles[rid].name} ({(selectedResubmitFiles[rid].size / 1024).toFixed(2)} KB)
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResubmitDialogOpen(false)} disabled={resubmitUploading}>Cancel</Button>
          <Button onClick={handleSubmitResubmit} disabled={resubmitUploading} variant="contained">
            {resubmitUploading ? 'Uploading...' : 'Submit and Resubmit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ApplicationDetail;
