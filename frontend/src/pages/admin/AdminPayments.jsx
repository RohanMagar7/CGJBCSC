import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Box,
  Chip,
  Alert,
  Divider,
  Avatar,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Stack,
  Switch,
  FormControlLabel,
  DialogContentText,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  Settings,
  Upload,
  Search,
  MonetizationOn,
  Receipt,
  TrendingUp,
} from '@mui/icons-material';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StatCard = ({ title, value, icon, color }) => {
    const theme = useTheme();
    return (
        <Card sx={{ backgroundColor: color, color: theme.palette.getContrastText(color) }}>
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                        {icon}
                    </Avatar>
                    <Box>
                        <Typography variant="h6" component="div" fontWeight="bold">
                            {value}
                        </Typography>
                        <Typography variant="body2">
                            {title}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

const PaymentSettingsDialog = ({ open, onClose, onSave, settings, onDelete }) => {
    const [formData, setFormData] = useState({ upi_id: '', upi_number: '', is_active: true });
    const [qrCodeFile, setQrCodeFile] = useState(null);
    const [qrCodePreview, setQrCodePreview] = useState(null);

    useEffect(() => {
        if (settings) {
            setFormData({
                upi_id: settings.upi_id || '',
                upi_number: settings.upi_number || '',
                is_active: settings.is_active,
            });
            setQrCodePreview(settings.qr_code_url || null);
        } else {
            setFormData({ upi_id: '', upi_number: '', is_active: true });
            setQrCodePreview(null);
        }
        setQrCodeFile(null);
    }, [settings, open]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setQrCodeFile(file);
            setQrCodePreview(URL.createObjectURL(file));
        }
    };

    const handleSave = () => {
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (qrCodeFile) {
            data.append('qr_code', qrCodeFile);
        }
        onSave(data, settings?.id);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{settings ? 'Edit Payment Settings' : 'Add Payment Settings'}</DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ pt: 1 }}>
                    <TextField
                        label="UPI ID"
                        value={formData.upi_id}
                        onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                        fullWidth
                    />
                    <TextField
                        label="UPI Number"
                        value={formData.upi_number}
                        onChange={(e) => setFormData({ ...formData, upi_number: e.target.value })}
                        fullWidth
                    />
                    <FormControlLabel
                        control={<Switch checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />}
                        label="Active"
                    />
                    <Button component="label" variant="outlined" startIcon={<Upload />}>
                        Upload QR Code
                        <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                    </Button>
                    {qrCodePreview && <Box component="img" src={qrCodePreview} alt="QR Code Preview" sx={{ maxHeight: 150, maxWidth: 150, mt: 1, borderRadius: 1 }} />}
                </Stack>
            </DialogContent>
            <DialogActions>
                {settings && <Button color="error" onClick={() => onDelete(settings.id)}>Delete</Button>}
                <Box sx={{flex: 1}} />
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [paymentSettings, setPaymentSettings] = useState([]);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [editingSettings, setEditingSettings] = useState(null);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const theme = useTheme();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [paymentsRes, appsRes, settingsRes] = await Promise.all([
        apiService.getPayments(),
        apiService.getApplications(),
        apiService.getPaymentSettings(),
      ]);
      setPayments(paymentsRes.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) || []);
      setApplications(appsRes.data || []);
      setPaymentSettings(settingsRes.data || []);
    } catch (err) {
      setError('Failed to load payment data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (formData, id) => {
    const apiCall = id
      ? apiService.updatePaymentSettings(id, formData)
      : apiService.createPaymentSettings(formData);
    try {
      await apiCall;
      setSuccess(`Settings ${id ? 'updated' : 'created'} successfully.`);
      fetchData();
      setSettingsDialogOpen(false);
    } catch (err) {
      setError(`Failed to save settings.`);
      console.error(err);
    }
  };

  const handleDeleteSettings = async (id) => {
    if (window.confirm('Are you sure you want to delete these settings?')) {
        try {
            await apiService.deletePaymentSettings(id);
            setSuccess('Settings deleted successfully.');
            fetchData();
            setSettingsDialogOpen(false);
        } catch (err) {
            setError('Failed to delete settings.');
            console.error(err);
        }
    }
  };

  const handleMarkAsPaid = async (paymentId) => {
     if (window.confirm('Are you sure you want to mark this payment as Paid?')) {
        try {
            await apiService.updatePayment(paymentId, { status: 'Paid' });
            setSuccess('Payment marked as Paid.');
            fetchData();
        } catch (err) {
            setError('Failed to update payment status.');
            console.error(err);
        }
     }
  };

  const filteredPayments = useMemo(() => {
    return payments
      .filter(p => filterStatus === 'all' || p.status === filterStatus)
      .filter(p => {
          const app = applications.find(a => a.id === p.application);
          const term = searchQuery.toLowerCase();
          return app?.id.toString().includes(term) || p.transaction_id?.toLowerCase().includes(term);
      });
  }, [payments, filterStatus, searchQuery, applications]);

  const paginatedPayments = useMemo(() => {
    return filteredPayments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredPayments, page, rowsPerPage]);

  const stats = useMemo(() => {
    const totalRevenue = payments.filter(p => p.status === 'Paid').reduce((acc, p) => acc + parseFloat(p.amount), 0);
    const pendingPayments = payments.filter(p => p.status === 'Pending').length;
    return [
        { title: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: <MonetizationOn />, color: theme.palette.success.main },
        { title: 'Total Transactions', value: payments.length, icon: <Receipt />, color: theme.palette.primary.main },
        { title: 'Pending Payments', value: pendingPayments, icon: <TrendingUp />, color: theme.palette.warning.main },
    ];
  }, [payments, theme]);

  if (loading) return <LoadingSpinner />;

  return (
    <Container sx={{ py: 8 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={{ xs: 2, sm: 1 }}
        mb={4}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">Payments</Typography>
          <Typography color="text.secondary">Manage transactions and payment settings.</Typography>
        </Box>
        <Button 
            variant="contained" 
            startIcon={<Settings />} 
            onClick={() => { setEditingSettings(paymentSettings[0] || null); setSettingsDialogOpen(true); }}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Payment Settings
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={4} mb={4}>
        {stats.map((stat, index) => (
            <Grid item xs={12} md={4} key={index}>
                <StatCard {...stat} />
            </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
          <TextField
            fullWidth
            placeholder="Search by App ID or Transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          />
          <FormControl sx={{ minWidth: { xs: '100%', md: 200 } }}>
            <InputLabel>Status</InputLabel>
            <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Failed">Failed</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Application ID</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Transaction ID</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPayments.map((payment) => (
                <TableRow key={payment.id} hover>
                  <TableCell>#{payment.application}</TableCell>
                  <TableCell>${payment.amount}</TableCell>
                  <TableCell>{payment.payment_method}</TableCell>
                  <TableCell>
                    <Chip label={payment.status} color={payment.status === 'Paid' ? 'success' : payment.status === 'Pending' ? 'warning' : 'error'} size="small" />
                  </TableCell>
                  <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{payment.transaction_id || 'N/A'}</TableCell>
                  <TableCell align="right">
                    {payment.status === 'Pending' && (
                      <Button size="small" variant="outlined" onClick={() => handleMarkAsPaid(payment.id)}>
                        Mark as Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredPayments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Paper>

      <PaymentSettingsDialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        onSave={handleSaveSettings}
        settings={editingSettings}
        onDelete={handleDeleteSettings}
      />
    </Container>
  );
}
