import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
} from '@mui/material';
import { Visibility, CheckCircle, Cancel, MoreVert, Refresh } from '@mui/icons-material';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminGopinathApplications() {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);

  // status dialog
  const [statusDialog, setStatusDialog] = useState({ open: false, action: null });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      setLoading(true);
  const res = await apiService.getGopinathApplications();
  // Support both plain array responses and DRF-style paginated responses { results: [...] }
  const data = res?.data;
  setApps(Array.isArray(data) ? data : (data?.results || []));
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load Gopinath applications');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, app) => {
    setAnchorEl(event.currentTarget);
    setSelectedApp(app);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedApp(null);
  };

  const openStatusDialog = (action) => {
    setStatusDialog({ open: true, action });
    handleMenuClose();
  };

  const performStatusUpdate = async () => {
    if (!selectedApp) return;
    try {
      setError('');
      await apiService.updateGopinathApplicationStatus(selectedApp.app_id, statusDialog.action, rejectReason);
      setSuccess(`Application ${statusDialog.action} successfully`);
      setStatusDialog({ open: false, action: null });
      setRejectReason('');
      fetchApps();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to update status');
    }
  };

  const handleView = (id) => {
    navigate(`/admin/gopinath-applications/${id}`);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={800}>Gopinath Applications</Typography>
              <Typography variant="body2" color="text.secondary">Manage scheme registrations submitted by users</Typography>
            </Box>
            <Button variant="contained" startIcon={<Refresh />} onClick={fetchApps}>Refresh</Button>
          </Box>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>App ID</TableCell>
                  <TableCell>Applicant</TableCell>
                  <TableCell>Mobile</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography>No applications yet.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  apps.map((app) => (
                    <TableRow key={app.app_id} hover>
                      <TableCell><Chip label={`#${app.app_id}`} size="small" /></TableCell>
                      <TableCell>{app.full_name}</TableCell>
                      <TableCell>{app.mobile}</TableCell>
                      <TableCell>{app.email || '—'}</TableCell>
                      <TableCell>{new Date(app.submitted_at).toLocaleString()}</TableCell>
                      <TableCell><Typography variant="body2"><strong>{app.status}</strong></Typography></TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => handleView(app.app_id)} title="View">
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, app)}>
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => openStatusDialog('Accepted')}>
            <CheckCircle sx={{ mr: 1 }} /> Accept
          </MenuItem>
          <MenuItem onClick={() => openStatusDialog('Rejected')}>
            <Cancel sx={{ mr: 1 }} /> Reject
          </MenuItem>
          <MenuItem onClick={() => openStatusDialog('Under Review')}>
            <MoreVert sx={{ mr: 1 }} /> Mark Under Review
          </MenuItem>
        </Menu>

        <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ open: false, action: null })}>
          <DialogTitle>{statusDialog.action} Application</DialogTitle>
          <DialogContent>
            {statusDialog.action === 'Rejected' && (
              <TextField
                label="Reject Reason"
                fullWidth
                multiline
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                sx={{ mt: 1 }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialog({ open: false, action: null })}>Cancel</Button>
            <Button variant="contained" onClick={performStatusUpdate}>Confirm</Button>
          </DialogActions>
        </Dialog>

      </Container>
    </Box>
  );
}
