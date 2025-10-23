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
  Stack,
  styled,
  Link,
} from '@mui/material';
import {
  ArrowBack,
  Description,
  CloudUpload,
  Delete,
  Download,
  CheckCircle,
  Payment,
  Info,
  Event,
  Update,
  AttachMoney,
  Notes,
} from '@mui/icons-material';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
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

const DetailItem = ({ icon, primary, secondary }) => (
    <Stack direction="row" spacing={2} alignItems="center">
        <ListItemIcon sx={{ minWidth: 'auto' }}>{icon}</ListItemIcon>
        <ListItemText primary={primary} secondary={secondary} />
    </Stack>
);

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
  const [success, setSuccess] = useState('');
  
  // Document Management
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDocRequirement, setSelectedDocRequirement] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const appRes = await apiService.getApplication(id);
      const serviceRes = await apiService.getService(appRes.data.service);
      setApplication(appRes.data);
      setService(serviceRes.data);

      if (appRes.data.status === 'Approved') {
        try {
          const paymentsRes = await apiService.getPayments();
          const userPayment = paymentsRes.data.find(p => p.application === appRes.data.id);
          if (userPayment) {
            setPayment(userPayment);
            const settingsRes = await apiService.getActivePaymentSettings();
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

  const handleOpenUploadDialog = (doc) => {
    setSelectedDocRequirement(doc);
    setUploadDialogOpen(true);
    setError('');
    setSelectedFile(null);
  };

  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
    setSelectedDocRequirement(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError(`File size must be less than 5MB. Your file is ${(file.size / (1024*1024)).toFixed(2)}MB.`);
        setSelectedFile(null);
      } else {
        setError('');
        setSelectedFile(file);
      }
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile || !selectedDocRequirement) return;
    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('document_name', selectedDocRequirement.name);
    formData.append('application', application.id);
    formData.append('required_document', selectedDocRequirement.id);

    try {
      await apiService.uploadDocument(formData);
      setSuccess('Document uploaded successfully!');
      handleCloseUploadDialog();
      fetchData(); // Refresh data
    } catch (err) {
      setError('Failed to upload document.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await apiService.deleteUserDocument(docId);
        setSuccess('Document deleted successfully.');
        fetchData(); // Refresh data
      } catch (err) {
        setError('Failed to delete document.');
        console.error(err);
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error && !application) return <Container sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;

  const requiredDocsMap = service ? new Map(service.required_documents.map(doc => [doc.id, doc.name])) : new Map();
  const userDocsMap = application ? new Map(application.documents.map(doc => [doc.required_document, doc])) : new Map();

  return (
    <Container sx={{ py: 8 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(isAdmin ? '/admin/applications' : '/applications')}>
          Back to Applications
        </Button>
        {application && <StatusBadge status={application.status} sx={{ fontSize: '1rem', py: 1, px: 2 }} />}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={4}>
        {/* Left Column - Application Details */}
        <Grid item xs={12} md={7} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {service?.name || 'Application Details'}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <List>
                <ListItem><DetailItem icon={<Info color="primary"/>} primary="Service Name" secondary={service?.name} /></ListItem>
                <ListItem><DetailItem icon={<Event color="primary"/>} primary="Submitted On" secondary={new Date(application.created_at).toLocaleString()} /></ListItem>
                <ListItem><DetailItem icon={<Update color="primary"/>} primary="Last Updated" secondary={new Date(application.updated_at).toLocaleString()} /></ListItem>
                <ListItem><DetailItem icon={<AttachMoney color="primary"/>} primary="Service Fee" secondary={`$${service?.price}`} /></ListItem>
                {application.notes && <ListItem><DetailItem icon={<Notes color="primary"/>} primary="Your Notes" secondary={application.notes} /></ListItem>}
            </List>
          </Paper>
        </Grid>

        {/* Right Column - Payment & Status */}
        <Grid item xs={12} md={5} lg={4}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Status & Payment</Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={2}>
                    <Chip icon={<Payment />} label={`Payment Method: ${application.payment_method}`} />
                    {payment && <Chip icon={<CheckCircle />} label={`Payment Status: ${payment.status}`} color={payment.status === 'Paid' ? 'success' : 'warning'} />}
                    
                    {application.status === 'Approved' && !payment && (
                        <Alert severity="info">
                            Your application is approved. Payment details will be available here shortly.
                        </Alert>
                    )}

                    {payment && paymentSettings && payment.status !== 'Paid' && (
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="subtitle1" fontWeight="bold">Complete Your Payment</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                                    To finalize your application, please complete the payment of ${payment.amount}.
                                </Typography>
                                {paymentSettings.upi_id && <Typography><b>UPI ID:</b> {paymentSettings.upi_id}</Typography>}
                                {paymentSettings.qr_code_url && (
                                    <Box mt={2} textAlign="center">
                                        <img src={paymentSettings.qr_code_url} alt="UPI QR Code" style={{ maxWidth: '150px', borderRadius: '8px' }} />
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </Stack>
            </Paper>
        </Grid>

        {/* Documents Section */}
        <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Required Documents
                </Typography>
                <List>
                    {Array.from(requiredDocsMap.entries()).map(([reqId, reqName]) => {
                        const userDoc = userDocsMap.get(reqId);
                        return (
                            <ListItem key={reqId} divider secondaryAction={
                                <Stack direction="row" spacing={1}>
                                    {userDoc ? (
                                        <>
                                            <IconButton href={userDoc.file_url} target="_blank" rel="noopener noreferrer" edge="end" aria-label="download" color="primary">
                                                <Download />
                                            </IconButton>
                                            {application.status === 'Pending' && (
                                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteDocument(userDoc.id)} color="error">
                                                    <Delete />
                                                </IconButton>
                                            )}
                                        </>
                                    ) : (
                                        application.status === 'Pending' && (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<CloudUpload />}
                                                onClick={() => handleOpenUploadDialog({ id: reqId, name: reqName })}
                                            >
                                                Upload
                                            </Button>
                                        )
                                    )}
                                </Stack>
                            }>
                                <ListItemIcon>
                                    {userDoc ? <CheckCircle color="success" /> : <Info color="warning" />}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={reqName} 
                                    secondary={userDoc ? `Uploaded: ${new Date(userDoc.uploaded_at).toLocaleDateString()}` : 'Pending upload'} 
                                />
                            </ListItem>
                        );
                    })}
                </List>
            </Paper>
        </Grid>
      </Grid>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={handleCloseUploadDialog}>
        <DialogTitle>Upload: {selectedDocRequirement?.name}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUpload />}
            fullWidth
          >
            {selectedFile ? `Selected: ${selectedFile.name}` : 'Choose File'}
            <VisuallyHiddenInput type="file" onChange={handleFileSelect} />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog}>Cancel</Button>
          <Button onClick={handleUploadFile} disabled={!selectedFile || uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ApplicationDetail;
