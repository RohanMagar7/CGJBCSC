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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }} elevation={0}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            {/** Avatar / passport preview */}
            {((app.passport_photo_url || app.passport_photo) ? (
              <Avatar src={app.passport_photo_url || app.passport_photo} sx={{ width: 84, height: 84 }} />
            ) : (
              <Avatar sx={{ width: 84, height: 84, bgcolor: 'primary.main' }}>{(app.full_name || 'A').charAt(0)}</Avatar>
            ))}
          </Grid>
          <Grid item xs>
            <Typography variant="h5" fontWeight={800}>Application #{app.app_id} — {app.full_name}</Typography>
            <Typography variant="body2" color="text.secondary">Submitted: {new Date(app.submitted_at).toLocaleString()}</Typography>
          </Grid>
          <Grid item>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={app.status} color={app.status === 'Accepted' ? 'success' : app.status === 'Rejected' ? 'error' : 'default'} />
              <Button variant="outlined" onClick={() => navigate('/admin/gopinath-applications')}>Back</Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        {/* Left: Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>विद्यार्थी माहिती</Typography>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">पूर्ण नाव</Typography><Typography><strong>{app.full_name || '—'}</strong></Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">मोबाईल</Typography><Typography>{app.mobile || '—'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">ई-मेल</Typography><Typography>{app.email || '—'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">जन्मतारीख</Typography><Typography>{app.dob ? new Date(app.dob).toLocaleDateString() : '—'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">लिंग</Typography><Typography>{app.gender || '—'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">आधार क्रमांक</Typography><Typography>{app.aadhaar || '—'}</Typography></Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>रहिवासी माहिती</Typography>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}><Typography variant="body2" color="text.secondary">सध्याचा पत्ता</Typography><Typography>{app.current_address || '—'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">नैसर्गिक ठिकाण / जन्मस्थळ</Typography><Typography>{app.native_place || '—'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">रहिवासी प्रकार</Typography><Typography>{app.residence_type || '—'}</Typography></Grid>
              <Grid item xs={12}><Typography variant="body2" color="text.secondary">रहिवासी नाव व पत्ता</Typography><Typography>{app.residence_name_address || '—'}</Typography></Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>शैक्षणिक माहिती</Typography>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}><Typography variant="body2" color="text.secondary">महाविद्यालय / संस्था</Typography><Typography>{app.college_name || '—'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">अभ्यासक्रम / शाखा</Typography><Typography>{app.course || '—'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">वर्ग / वर्ष</Typography><Typography>{app.study_year || '—'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">प्रवेश दिनांक</Typography><Typography>{app.admission_date ? new Date(app.admission_date).toLocaleDateString() : '—'}</Typography></Grid>
              <Grid item xs={12}><Typography variant="body2" color="text.secondary">महाविद्यालय पत्ता व संपर्क</Typography><Typography>{app.college_address || '—'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">महाविद्यालय ओळख क्रमांक</Typography><Typography>{app.college_id_number || '—'}</Typography></Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>योजनेसंबंधी माहिती</Typography>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">राशन कार्ड प्रकार</Typography><Typography>{app.ration_card_type || '—'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">राशन कार्ड क्रमांक</Typography><Typography>{app.ration_card_number || '—'}</Typography></Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>बँक व खात्याची माहिती</Typography>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">बँक नाव</Typography><Typography>{app.bank_name || '—'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">शाखा</Typography><Typography>{app.branch_name || '—'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">खाते क्रमांक</Typography><Typography>{app.account_number || '—'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">IFSC</Typography><Typography>{app.ifsc || '—'}</Typography></Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Right: Documents + Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>जोडलेली कागदपत्रे</Typography>
            <Divider sx={{ my: 1 }} />
            <Stack spacing={2}>
              {[
                { key: 'aadhaar_file', label: 'आधार कार्ड' },
                { key: 'passport_photo', label: 'पासपोर्ट साईज फोटो' },
                { key: 'college_id_card', label: 'महाविद्यालय ओळखपत्र' },
                { key: 'ration_card_file', label: 'राशन कार्ड' },
                { key: 'bank_passbook', label: 'बँक पासबुक' },
                { key: 'fee_residence_proof', label: 'रहिवासी पुरावा / फी रिसीट' },
                { key: 'last_marksheet', label: 'शेवटचा मार्कशीट' },
                { key: 'signature', label: 'स्वाक्षरी' },
              ].map((d) => {
                const url = app[`${d.key}_url`] || app[d.key] || null;
                if (url) {
                  const isImage = String(url).toLowerCase().match(/\.(jpg|jpeg|png)$/);
                  return (
                    <Box key={d.key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isImage ? <Avatar variant="rounded" src={url} sx={{ width: 56, height: 56 }} /> : <Avatar sx={{ width: 56, height: 56 }}>{d.label.charAt(0)}</Avatar>}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2">{d.label}</Typography>
                        <Button size="small" variant="outlined" href={url} target="_blank" rel="noreferrer">Open</Button>
                      </Box>
                    </Box>
                  );
                }
                return <Typography key={d.key} color="text.secondary">{d.label}: <strong>नाही</strong></Typography>;
              })}
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="body2" color="text.secondary">घोषणा</Typography>
            <Typography sx={{ mb: 2 }}>{app.declaration ? 'अर्जदाराने घोषणा मान्य केली आहे' : 'घोषणा स्वीकारलेली नाही'}</Typography>
            <Divider sx={{ my: 2 }} />
            <Stack direction="column" spacing={2}>
              <Button fullWidth variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => openDialog('Accepted')}>Accept</Button>
              <Button fullWidth variant="contained" color="warning" startIcon={<ArrowForward />} onClick={() => openDialog('Under Review')}>Mark Under Review</Button>
              <Button fullWidth variant="outlined" color="error" startIcon={<Cancel />} onClick={() => openDialog('Rejected')}>Reject</Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

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
