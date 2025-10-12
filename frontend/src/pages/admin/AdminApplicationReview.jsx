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
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  CloudUpload,
  Download,
  Description,
} from '@mui/icons-material';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

const AdminApplicationReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [service, setService] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionDialog, setActionDialog] = useState({ open: false, action: null });
  const [rejectReason, setRejectReason] = useState('');
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const appRes = await apiService.getApplication(id);
      setApplication(appRes.data);
      
      const [serviceRes, userRes] = await Promise.all([
        apiService.getService(appRes.data.service),
        apiService.getUser(appRes.data.user),
      ]);
      
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
    
    try {
      await apiService.updateApplicationStatus(
        id,
        actionDialog.action,
        actionDialog.action === 'Rejected' ? rejectReason : ''
      );
      
      setActionDialog({ open: false, action: null });
      setRejectReason('');
      fetchData();
    } catch (err) {
      setError('Failed to update application status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUploadFinal = async () => {
    if (!selectedFile) return;
    
    setSubmitting(true);
    try {
      await apiService.uploadFinalDocument(id, selectedFile);
      setUploadDialog(false);
      setSelectedFile(null);
      fetchData();
    } catch (err) {
      setError('Failed to upload final document');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!application) return <Alert severity="error">Application not found</Alert>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/admin/applications')}
        sx={{ mb: 3 }}
      >
        Back to Applications
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Application Review
            </Typography>
            <Typography variant="body2" color="text.secondary">
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
                Application Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Applicant"
                    secondary={`${user?.full_name} (${user?.username})`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Email"
                    secondary={user?.email || 'Not provided'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Phone"
                    secondary={user?.phone_number}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Service"
                    secondary={service?.service_name}
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
              </List>

              {/* Action Buttons */}
              {application.status === 'Pending' && (
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => setActionDialog({ open: true, action: 'Approved' })}
                  >
                    Approve
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => setActionDialog({ open: true, action: 'Rejected' })}
                  >
                    Reject
                  </Button>
                </Box>
              )}

              {application.status === 'Approved' && application.final_document?.length === 0 && (
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<CloudUpload />}
                  onClick={() => setUploadDialog(true)}
                  sx={{ mt: 3 }}
                >
                  Upload Final Document
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Documents */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Uploaded Documents
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {application.documents?.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                  No documents uploaded
                </Typography>
              ) : (
                <List dense>
                  {application.documents?.map((doc) => (
                    <ListItem
                      key={doc.document_id}
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
                      <ListItemText
                        primary={`Document #${doc.document_id}`}
                        secondary={new Date(doc.uploaded_at).toLocaleDateString()}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {application.final_document?.length > 0 && (
            <Card elevation={2} sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="success.main">
                  Final Documents
                </Typography>
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

      {/* Action Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, action: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionDialog.action === 'Approved' ? 'Approve Application' : 'Reject Application'}
        </DialogTitle>
        <DialogContent>
          {actionDialog.action === 'Approved' ? (
            <Typography>
              Are you sure you want to approve this application? The user will be notified via email.
            </Typography>
          ) : (
            <>
              <Typography sx={{ mb: 2 }}>
                Please provide a reason for rejection:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Rejection Reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, action: null })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={actionDialog.action === 'Approved' ? 'success' : 'error'}
            onClick={handleStatusUpdate}
            disabled={submitting || (actionDialog.action === 'Rejected' && !rejectReason)}
          >
            {submitting ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Final Document</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <input
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              id="final-file-upload"
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="final-file-upload">
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
                Selected: {selectedFile.name}
              </Alert>
            )}
            
            <Alert severity="warning" sx={{ mt: 2 }}>
              Uploading a final document will automatically mark the application as "Completed" 
              and notify the user via email.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUploadFinal}
            disabled={!selectedFile || submitting}
          >
            {submitting ? 'Uploading...' : 'Upload & Complete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminApplicationReview;
