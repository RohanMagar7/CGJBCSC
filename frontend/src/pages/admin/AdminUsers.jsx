import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Alert,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Search as SearchIcon,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
} from '@mui/icons-material';
import apiService from '../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const UserEditDialog = ({ open, onClose, onSave, user, formErrors }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        is_staff: false,
        is_active: true,
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                email: user.email,
                is_staff: user.is_staff,
                is_active: user.is_active,
            });
        }
    }, [user, open]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSave = () => {
        onSave(user.id, formData);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Edit User: {user?.username}</DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ pt: 1 }}>
                    <TextField
                        name="username"
                        label="Username"
                        fullWidth
                        value={formData.username}
                        onChange={handleChange}
                        error={!!formErrors.username}
                        helperText={formErrors.username}
                    />
                    <TextField
                        name="email"
                        label="Email"
                        type="email"
                        fullWidth
                        value={formData.email}
                        onChange={handleChange}
                        error={!!formErrors.email}
                        helperText={formErrors.email}
                    />
                    <FormControlLabel
                        control={<Switch name="is_staff" checked={formData.is_staff} onChange={handleChange} />}
                        label="Admin Access"
                    />
                    <FormControlLabel
                        control={<Switch name="is_active" checked={formData.is_active} onChange={handleChange} />}
                        label="Active Status"
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">Save Changes</Button>
            </DialogActions>
        </Dialog>
    );
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiService.getUsers();
      setUsers(response.data.sort((a, b) => a.username.localeCompare(b.username)) || []);
    } catch (err) {
      setError('Failed to fetch users.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditDialog = (user) => {
    setSelectedUser(user);
    setFormErrors({});
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedUser(null);
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.username.trim()) errors.username = 'Username is required.';
    if (!data.email.trim()) errors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(data.email)) errors.email = 'Email is invalid.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveUser = async (userId, formData) => {
    if (!validateForm(formData)) return;

    try {
      await apiService.updateUser(userId, formData);
      setSuccess('User updated successfully.');
      fetchUsers();
      handleCloseEditDialog();
    } catch (err) {
      setError('Failed to update user.');
      console.error(err);
    }
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter(user => {
        const term = searchQuery.toLowerCase();
        return user.username.toLowerCase().includes(term) || user.email.toLowerCase().includes(term);
      })
      .filter(user => roleFilter === 'all' || (roleFilter === 'admin' ? user.is_staff : !user.is_staff))
      .filter(user => statusFilter === 'all' || (statusFilter === 'active' ? user.is_active : !user.is_active));
  }, [users, searchQuery, roleFilter, statusFilter]);

  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  if (loading) return <LoadingSpinner />;

  return (
    <Container sx={{ py: 8 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            User Management
          </Typography>
          <Typography color="text.secondary">
            View, edit, and manage user accounts and roles.
          </Typography>
        </Box>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
          <TextField
            fullWidth
            placeholder="Search by username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          />
          <FormControl sx={{ minWidth: { xs: '100%', md: 150 } }}>
            <InputLabel>Role</InputLabel>
            <Select value={roleFilter} label="Role" onChange={(e) => setRoleFilter(e.target.value)}>
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: { xs: '100%', md: 150 } }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date Joined</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">{user.username}</Typography>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      icon={user.is_staff ? <AdminIcon /> : <UserIcon />}
                      label={user.is_staff ? 'Admin' : 'User'}
                      color={user.is_staff ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.is_active ? 'Active' : 'Inactive'}
                      color={user.is_active ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(user.date_joined).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenEditDialog(user)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Paper>

      {selectedUser && (
        <UserEditDialog
          open={editDialogOpen}
          onClose={handleCloseEditDialog}
          onSave={handleSaveUser}
          user={selectedUser}
          formErrors={formErrors}
        />
      )}
    </Container>
  );
}
