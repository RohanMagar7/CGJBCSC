import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Stack,
  TablePagination,
  useTheme,
} from '@mui/material';
import { Search, Visibility, Delete, Add } from '@mui/icons-material';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filtering and Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, application: null });
  const [deleting, setDeleting] = useState(false);
  
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsRes, servicesRes] = await Promise.all([
        apiService.getApplications(),
        apiService.getServices(),
      ]);
      setApplications(appsRes.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      setServices(servicesRes.data);
    } catch (err) {
      setError('Failed to load applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getServiceName = (serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    return service?.name || 'Unknown Service';
  };

  const handleDeleteClick = (application) => {
    setDeleteDialog({ open: true, application });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.application) return;
    setDeleting(true);
    try {
      await apiService.deleteApplication(deleteDialog.application.id);
      setSuccess('Application deleted successfully.');
      setApplications(prev => prev.filter(app => app.id !== deleteDialog.application.id));
      handleDeleteClose();
    } catch (err) {
      setError('Failed to delete application.');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteClose = () => {
    setDeleteDialog({ open: false, application: null });
  };

  const filteredApplications = useMemo(() => {
    return applications
      .filter(app => statusFilter === 'all' || app.status === statusFilter)
      .filter(app => {
        const serviceName = getServiceName(app.service).toLowerCase();
        return serviceName.includes(searchTerm.toLowerCase());
      });
  }, [applications, statusFilter, searchTerm, services]);

  const paginatedApplications = useMemo(() => {
    return filteredApplications.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredApplications, page, rowsPerPage]);

  if (loading) return <LoadingSpinner />;

  return (
    <Container sx={{ py: 8 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            My Applications
          </Typography>
          <Typography color="text.secondary">
            Track and manage all your service applications here.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/services')}
        >
          New Application
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
          <TextField
            fullWidth
            placeholder="Search by service name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: { xs: '100%', md: 200 } }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Service Name</TableCell>
                <TableCell>Submitted On</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedApplications.length > 0 ? (
                paginatedApplications.map((app) => (
                  <TableRow key={app.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {getServiceName(app.service)}
                      </Typography>
                    </TableCell>
                    <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} />
                    </TableCell>
                    <TableCell>{new Date(app.updated_at).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/applications/${app.id}`)}
                        title="View Details"
                      >
                        <Visibility />
                      </IconButton>
                      {['Pending', 'Rejected'].includes(app.status) && (
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(app)}
                          title="Delete Application"
                          sx={{ color: theme.palette.error.main }}
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary" p={4}>
                      No applications found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredApplications.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the application for "{getServiceName(deleteDialog.application?.service)}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Applications;
