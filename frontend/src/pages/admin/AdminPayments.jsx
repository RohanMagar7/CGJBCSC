import { useState, useEffect } from 'react';
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
  alpha,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  CheckCircle,
  Pending,
  Close,
  Save,
  AttachMoney,
  Search,
  FilterList,
  TrendingUp,
  AccountBalance,
} from '@mui/icons-material';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statistics, setStatistics] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    application: '',
    amount: '',
    payment_method: 'Cash',
    payment_status: 'Pending',
    transaction_id: '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchPayments();
    fetchApplications();
    fetchStatistics();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPayments();
      setPayments(response.data || response);
      setError('');
    } catch (err) {
      setError('Failed to fetch payments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await apiService.getApplications();
      setApplications(response.data || response);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await apiService.getPaymentStatistics();
      setStatistics(response.data || response);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  };

  const handleOpenDialog = (payment = null) => {
    if (payment) {
      setEditingPayment(payment);
      setFormData({
        application: payment.application || '',
        amount: payment.amount || '',
        payment_method: payment.payment_method || 'Cash',
        payment_status: payment.payment_status || 'Pending',
        transaction_id: payment.transaction_id || '',
        notes: payment.notes || '',
      });
    } else {
      setEditingPayment(null);
      setFormData({
        application: '',
        amount: '',
        payment_method: 'Cash',
        payment_status: 'Pending',
        transaction_id: '',
        notes: '',
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPayment(null);
    setFormData({
      application: '',
      amount: '',
      payment_method: 'Cash',
      payment_status: 'Pending',
      transaction_id: '',
      notes: '',
    });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.application) {
      errors.application = 'Application is required';
    }
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Valid amount is required';
    }
    if (!formData.payment_method) {
      errors.payment_method = 'Payment method is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const paymentData = {
        application: parseInt(formData.application),
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        payment_status: formData.payment_status,
        transaction_id: formData.transaction_id || null,
        notes: formData.notes || null,
      };

      if (editingPayment) {
        await apiService.updatePayment(editingPayment.payment_id, paymentData);
        setSuccess('Payment updated successfully! ✓');
      } else {
        await apiService.createPayment(paymentData);
        setSuccess('Payment created successfully! ✓');
      }

      handleCloseDialog();
      fetchPayments();
      fetchStatistics();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.detail || 'Failed to save payment');
      console.error('Payment save error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkCompleted = async (paymentId) => {
    try {
      setSubmitting(true);
      await apiService.markPaymentCompleted(paymentId);
      setSuccess('Payment marked as completed! ✓');
      fetchPayments();
      fetchStatistics();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark payment as completed');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (payment) => {
    setPaymentToDelete(payment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!paymentToDelete) return;

    setSubmitting(true);
    try {
      await apiService.deletePayment(paymentToDelete.payment_id);
      setSuccess('Payment deleted successfully! ✓');
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
      fetchPayments();
      fetchStatistics();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete payment');
      console.error(err);
      setDeleteDialogOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Pending': return 'warning';
      case 'Failed': return 'error';
      case 'Refunded': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle fontSize="small" />;
      case 'Pending': return <Pending fontSize="small" />;
      default: return null;
    }
  };

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    const matchesStatus = filterStatus === 'all' || payment.payment_status === filterStatus;
    const matchesMethod = filterMethod === 'all' || payment.payment_method === filterMethod;
    const matchesSearch = !searchQuery || 
      payment.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.service_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesMethod && matchesSearch;
  });

  // Paginate
  const paginatedPayments = filteredPayments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Hero Header */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)',
            color: 'white',
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                <PaymentIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Payment Management
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Track and manage service payments
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                fontWeight: 'bold',
                px: 3,
              }}
            >
              Add Payment
            </Button>
          </Box>
        </Paper>

        {/* Alerts */}
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 3, borderRadius: 2 }}>
            {success}
          </Alert>
        )}

        {/* Statistics Cards */}
        {statistics && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha('#2196f3', 0.1), color: 'primary.main' }}>
                      <PaymentIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Payments
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {statistics.total_payments}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha('#4caf50', 0.1), color: 'success.main' }}>
                      <CheckCircle />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Completed
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="success.main">
                        {statistics.completed_payments}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha('#ff9800', 0.1), color: 'warning.main' }}>
                      <Pending />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Pending
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="warning.main">
                        {statistics.pending_payments}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha('#9c27b0', 0.1), color: 'secondary.main' }}>
                      <TrendingUp />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Revenue
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="secondary.main">
                        ₹{statistics.total_revenue.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by user, service, transaction ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterList />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Failed">Failed</MenuItem>
                  <MenuItem value="Refunded">Refunded</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={filterMethod}
                  label="Payment Method"
                  onChange={(e) => setFilterMethod(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <AccountBalance />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">All Methods</MenuItem>
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="E-Sewa">E-Sewa</MenuItem>
                  <MenuItem value="Khalti">Khalti</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  <MenuItem value="Credit/Debit Card">Credit/Debit Card</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Payments Table */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha('#2196f3', 0.05) }}>
                  <TableCell><strong>Payment ID</strong></TableCell>
                  <TableCell><strong>User</strong></TableCell>
                  <TableCell><strong>Service</strong></TableCell>
                  <TableCell><strong>Amount</strong></TableCell>
                  <TableCell><strong>Method</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Transaction ID</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: alpha('#2196f3', 0.1),
                          color: 'primary.main',
                          margin: '0 auto',
                          mb: 2,
                        }}
                      >
                        <PaymentIcon sx={{ fontSize: 40 }} />
                      </Avatar>
                      <Typography variant="h6" gutterBottom>
                        No Payments Found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery || filterStatus !== 'all' || filterMethod !== 'all'
                          ? 'Try adjusting your filters'
                          : 'Get started by adding a payment'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPayments.map((payment) => (
                    <TableRow key={payment.payment_id} hover>
                      <TableCell>#{payment.payment_id}</TableCell>
                      <TableCell>{payment.user_name || 'N/A'}</TableCell>
                      <TableCell>{payment.service_name || 'N/A'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                          ₹{parseFloat(payment.amount).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={payment.payment_method} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(payment.payment_status)}
                          label={payment.payment_status}
                          color={getStatusColor(payment.payment_status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {payment.transaction_id || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          {payment.payment_status === 'Pending' && (
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<CheckCircle />}
                              onClick={() => handleMarkCompleted(payment.payment_id)}
                              disabled={submitting}
                            >
                              Complete
                            </Button>
                          )}
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(payment)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(payment)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredPayments.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>

        {/* Add/Edit Payment Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: alpha('#2196f3', 0.1), color: 'primary.main' }}>
                  {editingPayment ? <EditIcon /> : <AddIcon />}
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  {editingPayment ? 'Edit Payment' : 'Add New Payment'}
                </Typography>
              </Box>
              <IconButton onClick={handleCloseDialog} size="small">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <FormControl fullWidth margin="normal" required error={!!formErrors.application}>
              <InputLabel>Application</InputLabel>
              <Select
                name="application"
                value={formData.application}
                onChange={handleInputChange}
                label="Application"
              >
                {applications.map((app) => (
                  <MenuItem key={app.application_id} value={app.application_id}>
                    App #{app.application_id} - {app.service?.service_name || 'Service'} - {app.user?.full_name || 'User'}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.application && (
                <Typography variant="caption" color="error">
                  {formErrors.application}
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange}
              margin="normal"
              required
              error={!!formErrors.amount}
              helperText={formErrors.amount}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney />
                  </InputAdornment>
                ),
              }}
              placeholder="500.00"
            />

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Payment Method</InputLabel>
              <Select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleInputChange}
                label="Payment Method"
              >
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="E-Sewa">E-Sewa</MenuItem>
                <MenuItem value="Khalti">Khalti</MenuItem>
                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                <MenuItem value="Credit/Debit Card">Credit/Debit Card</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Payment Status</InputLabel>
              <Select
                name="payment_status"
                value={formData.payment_status}
                onChange={handleInputChange}
                label="Payment Status"
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Failed">Failed</MenuItem>
                <MenuItem value="Refunded">Refunded</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Transaction ID"
              name="transaction_id"
              value={formData.transaction_id}
              onChange={handleInputChange}
              margin="normal"
              placeholder="TXN123456789"
              helperText="Optional: External transaction reference"
            />

            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={3}
              placeholder="Additional payment notes..."
            />
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
            <Button
              onClick={handleSubmit}
              variant="contained"
              startIcon={<Save />}
              sx={{ borderRadius: 2, minWidth: 120 }}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : editingPayment ? 'Update Payment' : 'Create Payment'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => !submitting && setDeleteDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 },
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: alpha('#f44336', 0.1), color: 'error.main' }}>
                <DeleteIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                Delete Payment
              </Typography>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to delete this payment record?
            </Typography>
            {paymentToDelete && (
              <Paper
                elevation={0}
                sx={{ p: 2, mt: 2, bgcolor: alpha('#f44336', 0.05), borderRadius: 2 }}
              >
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Payment #{paymentToDelete.payment_id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  User: {paymentToDelete.user_name} • Amount: ₹{paymentToDelete.amount}
                </Typography>
              </Paper>
            )}
            <Alert severity="warning" sx={{ mt: 2 }}>
              This action cannot be undone.
            </Alert>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              variant="outlined"
              sx={{ borderRadius: 2 }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              sx={{ borderRadius: 2, minWidth: 120 }}
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete Payment'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
