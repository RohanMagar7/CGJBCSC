import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Stack,
  Link,
  DialogContentText,
  ListItemIcon,
  styled,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  CloudUpload,
  Download,
  Description,
  Person,
  Email,
  Event,
  Update,
  Notes,
} from '@mui/icons-material';
import apiService from '../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

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

const AdminApplicationReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [service, setService] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [actionDialog, setActionDialog] = useState({ open: false, action: null });
  const [rejectReason, setRejectReason] = useState('');
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const appRes = await apiService.getApplication(id);
      const [serviceRes, userRes] = await Promise.all([
        apiService.getService(appRes.data.service),
        apiService.getUser(appRes.data.user),
      ]);
      setApplication(appRes.data);
      setService(serviceRes.data);
      setUser(userRes.data);
    } catch (err) {
      setError('Failed to load application details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await apiService.updateApplicationStatus(
        id,
        actionDialog.action,
        actionDialog.action === 'Rejected' ? rejectReason : undefined
      );
      setSuccess(`Application status updated to "${actionDialog.action}".`);
      setActionDialog({ open: false, action: null });
      setRejectReason('');
      fetchData();
    } catch (err) {
      setError('Failed to update application status.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
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

  const handleUploadCompletedFile = async () => {
    if (!selectedFile) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    const formData = new FormData();
    formData.append('completed_file', selectedFile);
    try {
      await apiService.updateApplication(id, formData);
      setSuccess('Completed document uploaded successfully.');
      setUploadDialog(false);
      setSelectedFile(null);
      fetchData();
    } catch (err) {
      setError('Failed to upload completed document.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error && !application) return <Container sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;

  return (
    <Container sx={{ py: 8 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin/applications')}>
          Back to Applications
        </Button>
        {application && <StatusBadge status={application.status} sx={{ fontSize: '1rem', py: 1, px: 2 }} />}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={4}>
        {/* Left Column - Application & User Details */}
        <Grid item xs={12} md={7} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 4, mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Review: {service?.name}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <List>
                <ListItem><DetailItem icon={<Event color="primary"/>} primary="Submitted On" secondary={new Date(application.created_at).toLocaleString()} /></ListItem>
                <ListItem><DetailItem icon={<Update color="primary"/>} primary="Last Updated" secondary={new Date(application.updated_at).toLocaleString()} /></ListItem>
                {application.notes && <ListItem><DetailItem icon={<Notes color="primary"/>} primary="Applicant's Notes" secondary={application.notes} /></ListItem>}
            </List>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Applicant Information
            </Typography>
            <Divider sx={{ my: 2 }} />
            <List>
                <ListItem><DetailItem icon={<Person color="primary"/>} primary="Username" secondary={user?.username} /></ListItem>
                <ListItem><DetailItem icon={<Email color="primary"/>} primary="Email" secondary={user?.email} /></ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Right Column - Actions */}
        <Grid item xs={12} md={5} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 4, position: 'sticky', top: '20px' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Actions</Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2}>
              {application.status === 'Pending' && (
                <>
                  <Button variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => setActionDialog({ open: true, action: 'In Progress' })}>
                    Accept & Start Process
                  </Button>
                  <Button variant="outlined" color="error" startIcon={<Cancel />} onClick={() => setActionDialog({ open: true, action: 'Rejected' })}>
                    Reject Application
                  </Button>
                </>
              )}
              {application.status === 'In Progress' && (
                <>
                  <Button variant="contained" color="primary" startIcon={<CloudUpload />} onClick={() => setUploadDialog(true)}>
                    Upload Completed Document
                  </Button>
                   <Button variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => setActionDialog({ open: true, action: 'Completed' })}>
                    Mark as Completed
                  </Button>
                </>
              )}
              {application.status === 'Completed' && (
                <Alert severity="success">This application has been completed.</Alert>
              )}
               {application.status === 'Rejected' && (
                <Alert severity="error">This application has been rejected. Reason: {application.reject_reason || 'N/A'}</Alert>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Documents Section */}
        <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Submitted Documents
                </Typography>
                <List>
                    {application.documents.length > 0 ? application.documents.map(doc => (
                        <ListItem key={doc.id} divider secondaryAction={
                            <IconButton href={doc.file_url} target="_blank" rel="noopener noreferrer" edge="end" aria-label="download" color="primary">
                                <Download />
                            </IconButton>
                        }>
                            <ListItemIcon><Description /></ListItemIcon>
                            <ListItemText 
                                primary={doc.document_name} 
                                secondary={`Uploaded: ${new Date(doc.uploaded_at).toLocaleDateString()}`} 
                            />
                        </ListItem>
                    )) : (
                        <Typography color="text.secondary" sx={{p: 2}}>No documents were submitted for this application.</Typography>
                    )}
                </List>
                {application.completed_file && (
                    <>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{mt: 4}}>
                            Completed Document
                        </Typography>
                        <List>
                            <ListItem divider secondaryAction={
                                <IconButton href={application.completed_file} target="_blank" rel="noopener noreferrer" edge="end" aria-label="download" color="primary">
                                    <Download />
                                </IconButton>
                            }>
                                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                                <ListItemText primary="Final Document" />
                            </ListItem>
                        </List>
                    </>
                )}
            </Paper>
        </Grid>
      </Grid>

      {/* Action Dialog (Approve/Reject) */}
      <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, action: null })}>
        <DialogTitle>Confirm Action: {actionDialog.action}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {actionDialog.action?.toLowerCase()} this application?
          </DialogContentText>
          {actionDialog.action === 'Rejected' && (
            <TextField
              autoFocus
              margin="dense"
              label="Reason for Rejection"
              type="text"
              fullWidth
              variant="standard"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, action: null })}>Cancel</Button>
          <Button onClick={handleStatusUpdate} disabled={submitting || (actionDialog.action === 'Rejected' && !rejectReason)}>
            {submitting ? 'Submitting...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Completed File Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)}>
        <DialogTitle>Upload Completed Document</DialogTitle>
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
          <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
          <Button onClick={handleUploadCompletedFile} disabled={!selectedFile || submitting}>
            {submitting ? 'Uploading...' : 'Upload & Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminApplicationReview;
