import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Stack,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from '@mui/material';
import {
  Search,
  Visibility,
  Delete,
} from '@mui/icons-material';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

const AdminApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters and Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const theme = useTheme();

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
      setApplications(appsRes.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) || []);
      setServices(servicesRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId) => users.find(u => u.id === userId)?.username || 'N/A';
  const getServiceName = (serviceId) => services.find(s => s.id === serviceId)?.name || 'N/A';

  const filteredApplications = useMemo(() => {
    return applications
      .filter(app => statusFilter === 'all' || app.status === statusFilter)
      .filter(app => {
        const serviceName = getServiceName(app.service).toLowerCase();
        const userName = getUserName(app.user).toLowerCase();
        const term = searchTerm.toLowerCase();
        return serviceName.includes(term) || userName.includes(term);
      });
  }, [applications, statusFilter, searchTerm, services, users]);

  const paginatedApplications = useMemo(() => {
    return filteredApplications.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredApplications, page, rowsPerPage]);

  if (loading) return <LoadingSpinner />;

  return (
    <Container sx={{ py: 8 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            All Applications
          </Typography>
          <Typography color="text.secondary">
            Review, manage, and track all user applications.
          </Typography>
        </Box>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
          <TextField
            fullWidth
            placeholder="Search by service or applicant..."
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
                <TableCell>Applicant</TableCell>
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
                        {getUserName(app.user)}
                      </Typography>
                    </TableCell>
                    <TableCell>{getServiceName(app.service)}</TableCell>
                    <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} />
                    </TableCell>
                    <TableCell>{new Date(app.updated_at).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/admin/applications/${app.id}`)}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary" p={4}>
                      No applications match the current filters.
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
    </Container>
  );
};

export default AdminApplications;
