import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  InputAdornment,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  Search,
  FilterList,
  Visibility,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Assignment,
  Description,
  MoreVert,
  Person,
  CalendarToday,
  ArrowForward,
  Refresh,
  Delete,
} from '@mui/icons-material';
import apiService from '../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

const AdminApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filters and search
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  
  // Action menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  
  // Quick action dialog
  const [actionDialog, setActionDialog] = useState({ open: false, action: null, app: null });
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState({ open: false, application: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsRes, servicesRes, usersRes] = await Promise.all([
        apiService.getApplications(),
        apiService.getServices(),
        apiService.getUsers(),
      ]);
      setApplications(appsRes.data || []);
      setServices(servicesRes.data || []);
      setUsers(usersRes.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getServiceName = (serviceId) => {
    const service = services.find((s) => s.service_id === serviceId);
    return service?.service_name || 'Unknown';
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.user_id === userId);
    return user?.username || 'Unknown';
  };

  const getUserDetails = (userId) => {
    return users.find((u) => u.user_id === userId);
  };

  // Filter applications by status
  const filterByStatus = (apps) => {
    const statusMap = ['Pending', 'Approved', 'Rejected', 'Completed'];
    if (activeTab === 0) return apps; // All
    return apps.filter((app) => app.status === statusMap[activeTab]);
  };

  // Filter applications by search and service
  const filteredApplications = filterByStatus(applications)
    .filter((app) => {
      const matchesSearch = 
        searchQuery === '' ||
        app.application_id.toString().includes(searchQuery) ||
        getUserName(app.user).toLowerCase().includes(searchQuery.toLowerCase()) ||
        getServiceName(app.service).toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesService = 
        selectedService === 'all' || 
        app.service.toString() === selectedService;
      
      return matchesSearch && matchesService;
    });

  const stats = [
    {
      label: 'All Applications',
      count: applications.length,
      color: '#667eea',
      icon: <Assignment />,
    },
    {
      label: 'Pending',
      count: applications.filter((a) => a.status === 'Pending').length,
      color: '#ffa726',
      icon: <HourglassEmpty />,
    },
    {
      label: 'Approved',
      count: applications.filter((a) => a.status === 'Approved').length,
      color: '#4caf50',
      icon: <CheckCircle />,
    },
    {
      label: 'Completed',
      count: applications.filter((a) => a.status === 'Completed').length,
      color: '#2196f3',
      icon: <Description />,
    },
  ];

  const handleMenuOpen = (event, app) => {
    setAnchorEl(event.currentTarget);
    setSelectedApp(app);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedApp(null);
  };

  const handleQuickAction = (action) => {
    setActionDialog({ open: true, action, app: selectedApp });
    handleMenuClose();
  };

  const handleStatusUpdate = async () => {
    if (!actionDialog.app) return;

    setSubmitting(true);
    setError('');

    try {
      await apiService.updateApplicationStatus(
        actionDialog.app.application_id,
        actionDialog.action,
        actionDialog.action === 'Rejected' ? rejectReason : ''
      );

      setSuccess(`Application ${actionDialog.action.toLowerCase()} successfully!`);
      setActionDialog({ open: false, action: null, app: null });
      setRejectReason('');
      fetchData();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update application status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (application) => {
    setDeleteDialog({ open: true, application });
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.application) return;

    setDeleting(true);
    setError('');

    try {
      await apiService.deleteApplication(deleteDialog.application.application_id);
      setSuccess(`Application #${deleteDialog.application.application_id} deleted successfully!`);
      setDeleteDialog({ open: false, application: null });
      
      // Refresh the applications list
      fetchData();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete application');
      setDeleteDialog({ open: false, application: null });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, application: null });
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
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            borderRadius: 3,
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                width: { xs: 48, sm: 56 }, 
                height: { xs: 48, sm: 56 } 
              }}>
                <Assignment sx={{ fontSize: { xs: 28, sm: 32 } }} />
              </Avatar>
              <Box>
                <Typography variant="h3" sx={{ 
                  fontWeight: 'bold', 
                  mb: 0.5,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                }}>
                  Manage Applications
                </Typography>
                <Typography variant="body1" sx={{ 
                  opacity: 0.9,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}>
                  Review and process pending applications
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<Refresh />}
              onClick={fetchData}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                fontWeight: 'bold',
                alignSelf: { xs: 'flex-end', sm: 'auto' },
                minWidth: { xs: 'auto', sm: 'auto' },
              }}
            >
              Refresh
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

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 16px ${alpha(stat.color, 0.2)}`,
                    borderColor: stat.color,
                  },
                }}
                onClick={() => setActiveTab(index)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: alpha(stat.color, 0.1),
                        color: stat.color,
                        display: 'flex',
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: stat.color }}>
                      {stat.count}
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="500" color="text.secondary" sx={{ mt: 2 }}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filters and Search */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by ID, user, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ bgcolor: 'background.paper' }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Filter by Service"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterList color="action" />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="all">All Services</MenuItem>
                {services.map((service) => (
                  <MenuItem key={service.service_id} value={service.service_id.toString()}>
                    {service.service_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary" align="right">
                {filteredApplications.length} result{filteredApplications.length !== 1 ? 's' : ''}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs */}
        <Paper elevation={0} sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="All Applications" />
            <Tab label="Pending" />
            <Tab label="Approved" />
            <Tab label="Rejected" />
            <Tab label="Completed" />
          </Tabs>
        </Paper>

        {/* Applications Table */}
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha('#667eea', 0.05) }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Application ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Applicant</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Service</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Submitted</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: alpha('#667eea', 0.1),
                          color: 'primary.main',
                          margin: '0 auto',
                          mb: 2,
                        }}
                      >
                        <Assignment sx={{ fontSize: 40 }} />
                      </Avatar>
                      <Typography variant="h6" gutterBottom>
                        No Applications Found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery || selectedService !== 'all'
                          ? 'Try adjusting your filters'
                          : 'Applications will appear here once users submit them'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => {
                    const user = getUserDetails(app.user);
                    return (
                      <TableRow
                        key={app.application_id}
                        sx={{
                          '&:hover': { bgcolor: alpha('#667eea', 0.02) },
                          cursor: 'pointer',
                        }}
                        onClick={() => navigate(`/admin/applications/${app.application_id}`)}
                      >
                        <TableCell>
                          <Chip
                            label={`#${app.application_id}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: 'primary.main',
                                fontSize: '0.875rem',
                              }}
                            >
                              {user?.username?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="500">
                                {user?.username}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {user?.email || 'No email'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{getServiceName(app.service)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {new Date(app.submitted_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={app.status} />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/applications/${app.application_id}`);
                            }}
                            sx={{ mr: 1 }}
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMenuOpen(e, app);
                            }}
                          >
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Quick Actions Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => navigate(`/admin/applications/${selectedApp?.application_id}`)}>
            <Visibility sx={{ mr: 1, fontSize: 20 }} />
            View Details
          </MenuItem>
          {selectedApp?.status === 'Pending' && (
            <>
              <MenuItem onClick={() => handleQuickAction('Approved')}>
                <CheckCircle sx={{ mr: 1, fontSize: 20, color: 'success.main' }} />
                Approve
              </MenuItem>
              <MenuItem onClick={() => handleQuickAction('Rejected')}>
                <Cancel sx={{ mr: 1, fontSize: 20, color: 'error.main' }} />
                Reject
              </MenuItem>
            </>
          )}
          <Divider />
          <MenuItem onClick={() => handleDeleteClick(selectedApp)}>
            <Delete sx={{ mr: 1, fontSize: 20, color: 'error.main' }} />
            Delete Application
          </MenuItem>
        </Menu>

        {/* Quick Action Dialog */}
        <Dialog
          open={actionDialog.open}
          onClose={() => !submitting && setActionDialog({ open: false, action: null, app: null })}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                sx={{
                  bgcolor: alpha(
                    actionDialog.action === 'Approved' ? '#4caf50' : '#f44336',
                    0.1
                  ),
                  color: actionDialog.action === 'Approved' ? 'success.main' : 'error.main',
                }}
              >
                {actionDialog.action === 'Approved' ? <CheckCircle /> : <Cancel />}
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                {actionDialog.action === 'Approved' ? 'Approve Application' : 'Reject Application'}
              </Typography>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            {actionDialog.action === 'Approved' ? (
              <Box>
                <Typography variant="body1" gutterBottom>
                  Are you sure you want to approve this application?
                </Typography>
                {actionDialog.app && (
                  <Paper
                    elevation={0}
                    sx={{ p: 2, mt: 2, bgcolor: alpha('#4caf50', 0.05), borderRadius: 2 }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Application #{actionDialog.app.application_id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Service: {getServiceName(actionDialog.app.service)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Applicant: {getUserName(actionDialog.app.user)}
                    </Typography>
                  </Paper>
                )}
                <Alert severity="info" sx={{ mt: 2 }}>
                  The applicant will be notified via email about the approval.
                </Alert>
              </Box>
            ) : (
              <Box>
                <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
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
                  placeholder="Explain why this application is being rejected..."
                  error={!rejectReason && submitting}
                  helperText={!rejectReason && submitting ? 'Rejection reason is required' : ''}
                />
                <Alert severity="warning" sx={{ mt: 2 }}>
                  The applicant will be notified with this reason.
                </Alert>
              </Box>
            )}
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button
              onClick={() => setActionDialog({ open: false, action: null, app: null })}
              variant="outlined"
              sx={{ borderRadius: 2 }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              variant="contained"
              color={actionDialog.action === 'Approved' ? 'success' : 'error'}
              sx={{ borderRadius: 2, minWidth: 120 }}
              disabled={submitting || (actionDialog.action === 'Rejected' && !rejectReason)}
              startIcon={actionDialog.action === 'Approved' ? <CheckCircle /> : <Cancel />}
            >
              {submitting ? 'Processing...' : `Confirm ${actionDialog.action}`}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={handleDeleteCancel}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                sx={{
                  bgcolor: alpha('#f44336', 0.1),
                  color: 'error.main',
                }}
              >
                <Delete />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                Delete Application
              </Typography>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to delete this application?
            </Typography>
            {deleteDialog.application && (
              <Paper
                elevation={0}
                sx={{ p: 2, mt: 2, bgcolor: alpha('#f44336', 0.05), borderRadius: 2 }}
              >
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Application #{deleteDialog.application.application_id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Service: {getServiceName(deleteDialog.application.service)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Applicant: {getUserName(deleteDialog.application.user)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {deleteDialog.application.status}
                </Typography>
              </Paper>
            )}
            <Alert severity="error" sx={{ mt: 2 }}>
              This action cannot be undone. All related documents and payment records will also be deleted.
            </Alert>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button
              onClick={handleDeleteCancel}
              variant="outlined"
              sx={{ borderRadius: 2 }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
              sx={{ borderRadius: 2, minWidth: 120 }}
              disabled={deleting}
              startIcon={<Delete />}
            >
              {deleting ? 'Deleting...' : 'Delete Application'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminApplications;
