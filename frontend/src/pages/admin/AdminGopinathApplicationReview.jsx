import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Avatar,
  Chip,
  Stack,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { ArrowForward, CheckCircle, Cancel } from '@mui/icons-material';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminGopinathApplicationReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [dialog, setDialog] = useState({ open: false, action: null });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchApp();
  }, [id]);

  const fetchApp = async () => {
    try {
      setLoading(true);
      const res = await apiService.getGopinathApplication(id);
      setApp(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (action) => setDialog({ open: true, action });
  const closeDialog = () => setDialog({ open: false, action: null });

  const performAction = async () => {
    try {
      await apiService.updateGopinathApplicationStatus(id, dialog.action, rejectReason);
      setSuccess(`Application ${dialog.action}`);
      closeDialog();
      fetchApp();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Action failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!app) return <Container sx={{ py: 6 }}><Typography>No application found</Typography></Container>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }} elevation={0}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h5" fontWeight={800}>Application #{app.app_id}</Typography>
            <Typography variant="body2" color="text.secondary">Submitted: {new Date(app.submitted_at).toLocaleString()}</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip label={app.status} color={app.status === 'Accepted' ? 'success' : app.status === 'Rejected' ? 'error' : 'default'} />
            <Button variant="outlined" onClick={() => navigate('/admin/gopinath-applications')}>Back</Button>
          </Stack>
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>Personal Details</Typography>
        <Divider sx={{ my: 1 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}><Typography><strong>{app.full_name}</strong></Typography></Grid>
          <Grid item xs={12} sm={4}><Typography>{app.mobile}</Typography></Grid>
          <Grid item xs={12}><Typography>{app.current_address}</Typography></Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>Submitted Documents</Typography>
        <Divider sx={{ my: 1 }} />
        <Stack spacing={1}>
          {['passport_photo','college_id_card','ration_card_file','aadhaar_file','bank_passbook','fee_residence_proof','last_marksheet','signature'].map((k) => (
            app[k] ? (
              <Button key={k} href={app[k]} target="_blank" rel="noreferrer" variant="outlined">View {k.replace(/_/g,' ')}</Button>
            ) : null
          ))}
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
          <Button variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => openDialog('Accepted')}>Accept</Button>
          <Button variant="contained" color="warning" startIcon={<ArrowForward />} onClick={() => openDialog('Under Review')}>Mark Under Review</Button>
          <Button variant="outlined" color="error" startIcon={<Cancel />} onClick={() => openDialog('Rejected')}>Reject</Button>
        </Stack>
      </Paper>

      <Dialog open={dialog.open} onClose={closeDialog}>
        <DialogTitle>{dialog.action} Application</DialogTitle>
        <DialogContent>
          {dialog.action === 'Rejected' && (
            <TextField label="Reject Reason" fullWidth multiline rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={performAction}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
