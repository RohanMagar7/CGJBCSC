import { useState, useEffect } from 'react';
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
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  IconButton,
  alpha,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  CardActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AdminPanelSettings as AdminIcon,
  ManageAccounts,
  Close,
  Save,
  Add,
  Block,
  CheckCircle,
  CalendarToday,
  Refresh,
  Badge,
} from '@mui/icons-material';
import apiService from '../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  
  // Dialog state
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    role: '',
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();
      setUsers(response.data || response);
      setError('');
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === '' ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.is_active !== false) ||
      (statusFilter === 'inactive' && user.is_active === false);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = [
    {
      label: 'Total Users',
      count: users.length,
      color: '#667eea',
      icon: <PersonIcon />,
    },
    {
      label: 'Admins',
      count: users.filter((u) => u.role === 'admin').length,
      color: '#f093fb',
      icon: <AdminIcon />,
    },
    {
      label: 'Regular Users',
      count: users.filter((u) => u.role === 'user' || !u.role).length,
      color: '#4caf50',
      icon: <Badge />,
    },
    {
      label: 'Active',
      count: users.filter((u) => u.is_active !== false).length,
      color: '#2196f3',
      icon: <CheckCircle />,
    },
  ];

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      full_name: user.full_name || '',
      email: user.email || '',
      phone_number: user.phone_number || '',
      role: user.role || 'user',
      is_active: user.is_active !== false,
    });
    setFormErrors({});
    setEditDialogOpen(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: name === 'is_active' ? checked : value,
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!editFormData.full_name?.trim()) {
      errors.full_name = 'Full name is required';
    }
    if (editFormData.email && !/\S+@\S+\.\S+/.test(editFormData.email)) {
      errors.email = 'Valid email is required';
    }
    if (!editFormData.role) {
      errors.role = 'Role is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveUser = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await apiService.updateUser(selectedUser.user_id, editFormData);
      setSuccess('User updated successfully! ✓');
      setEditDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.detail || 'Failed to update user');
      console.error('User update error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    setSubmitting(true);
    setError('');

    try {
      await apiService.deleteUser(selectedUser.user_id);
      setSuccess('User deleted successfully! ✓');
      setDeleteDialogOpen(false);
      setEditDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.detail || 'Failed to delete user');
      console.error('User delete error:', err);
    } finally {
      setSubmitting(false);
    }
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                <ManageAccounts sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Manage Users
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  View and manage user accounts
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<Refresh />}
              onClick={fetchUsers}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                fontWeight: 'bold',
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
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 16px ${alpha(stat.color, 0.2)}`,
                    borderColor: stat.color,
                  },
                }}
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

        {/* Filters */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                placeholder="Search by name, username, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ bgcolor: 'background.paper' }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  label="Role"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="User">Regular User</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <Typography variant="body2" color="text.secondary" align="right">
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 8,
              textAlign: 'center',
              borderRadius: 3,
              border: '2px dashed',
              borderColor: 'divider',
            }}
          >
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
              <PersonIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              No Users Found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No users available'}
            </Typography>
          </Paper>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                User Accounts ({filteredUsers.length})
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {filteredUsers.map((user) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={user.user_id}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 16px rgba(102, 126, 234, 0.2)',
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      {/* Avatar */}
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: user.role === 'admin' ? 'error.main' : 'primary.main',
                          margin: '0 auto',
                          mb: 2,
                          fontSize: '2rem',
                        }}
                      >
                        {user.username?.charAt(0).toUpperCase()}
                      </Avatar>

                      {/* User Info */}
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        {user.full_name || user.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        @{user.username}
                      </Typography>

                      {/* Role & Status Badges */}
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2 }}>
                        <Chip
                          icon={user.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
                          label={user.role === 'admin' ? 'Admin' : 'User'}
                          size="small"
                          color={user.role === 'admin' ? 'error' : 'primary'}
                        />
                        <Chip
                          icon={user.is_active !== false ? <CheckCircle /> : <Block />}
                          label={user.is_active !== false ? 'Active' : 'Inactive'}
                          size="small"
                          color={user.is_active !== false ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      {/* Contact Info */}
                      <Box sx={{ textAlign: 'left', mb: 2 }}>
                        {user.email && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {user.email}
                            </Typography>
                          </Box>
                        )}
                        {user.phone_number && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {user.phone_number}
                            </Typography>
                          </Box>
                        )}
                        {user.date_joined && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              Joined {new Date(user.date_joined).toLocaleDateString('en-US', {
                                month: 'short',
                                year: 'numeric',
                              })}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>

                    <Divider />

                    {/* Actions */}
                    <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewUser(user)}
                        sx={{ borderRadius: 2 }}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditUser(user)}
                        sx={{ borderRadius: 2 }}
                      >
                        Edit
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {/* View User Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: selectedUser?.role === 'admin' ? 'error.main' : 'primary.main',
                    width: 40,
                    height: 40,
                  }}
                >
                  {selectedUser?.username?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  User Details
                </Typography>
              </Box>
              <IconButton onClick={() => setViewDialogOpen(false)} size="small">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            {selectedUser && (
              <List>
                <ListItem>
                  <ListItemText
                    primary="User ID"
                    secondary={`#${selectedUser.user_id}`}
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText
                    primary="Full Name"
                    secondary={selectedUser.full_name || 'Not provided'}
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText
                    primary="Username"
                    secondary={`@${selectedUser.username}`}
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText
                    primary="Email"
                    secondary={selectedUser.email || 'Not provided'}
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText
                    primary="Phone Number"
                    secondary={selectedUser.phone_number || 'Not provided'}
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText
                    primary="Role"
                    secondary={
                      <Chip
                        icon={selectedUser.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
                        label={selectedUser.role === 'admin' ? 'Admin' : 'User'}
                        size="small"
                        color={selectedUser.role === 'admin' ? 'error' : 'primary'}
                        sx={{ mt: 0.5 }}
                      />
                    }
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText
                    primary="Status"
                    secondary={
                      <Chip
                        icon={selectedUser.is_active !== false ? <CheckCircle /> : <Block />}
                        label={selectedUser.is_active !== false ? 'Active' : 'Inactive'}
                        size="small"
                        color={selectedUser.is_active !== false ? 'success' : 'default'}
                        sx={{ mt: 0.5 }}
                      />
                    }
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                  />
                </ListItem>
                {selectedUser.date_joined && (
                  <>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Date Joined"
                        secondary={new Date(selectedUser.date_joined).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                      />
                    </ListItem>
                  </>
                )}
              </List>
            )}
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setViewDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2 }}>
              Close
            </Button>
            <Button
              onClick={() => {
                setViewDialogOpen(false);
                handleEditUser(selectedUser);
              }}
              variant="contained"
              startIcon={<EditIcon />}
              sx={{ borderRadius: 2 }}
            >
              Edit User
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => !submitting && setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: alpha('#667eea', 0.1), color: 'primary.main' }}>
                  <EditIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  Edit User
                </Typography>
              </Box>
              <IconButton onClick={() => setEditDialogOpen(false)} size="small" disabled={submitting}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              fullWidth
              label="Full Name"
              name="full_name"
              value={editFormData.full_name}
              onChange={handleEditInputChange}
              margin="normal"
              required
              error={!!formErrors.full_name}
              helperText={formErrors.full_name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={editFormData.email}
              onChange={handleEditInputChange}
              margin="normal"
              error={!!formErrors.email}
              helperText={formErrors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Phone Number"
              name="phone_number"
              value={editFormData.phone_number}
              onChange={handleEditInputChange}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl fullWidth margin="normal" required error={!!formErrors.role}>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={editFormData.role}
                label="Role"
                onChange={handleEditInputChange}
                startAdornment={
                  <InputAdornment position="start">
                    {editFormData.role === 'admin' ? <AdminIcon color="action" /> : <PersonIcon color="action" />}
                  </InputAdornment>
                }
              >
                <MenuItem value="user">Regular User</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
              </Select>
              {formErrors.role && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                  {formErrors.role}
                </Typography>
              )}
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={editFormData.is_active}
                  onChange={handleEditInputChange}
                  name="is_active"
                  color="success"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">Account Active</Typography>
                  <Chip
                    label={editFormData.is_active ? 'Active' : 'Inactive'}
                    size="small"
                    color={editFormData.is_active ? 'success' : 'default'}
                  />
                </Box>
              }
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button
              onClick={() => {
                setDeleteDialogOpen(true);
              }}
              variant="outlined"
              color="error"
              startIcon={<Block />}
              sx={{ borderRadius: 2, mr: 'auto' }}
              disabled={submitting}
            >
              Delete User
            </Button>
            <Button
              onClick={() => setEditDialogOpen(false)}
              variant="outlined"
              sx={{ borderRadius: 2 }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveUser}
              variant="contained"
              startIcon={<Save />}
              sx={{ borderRadius: 2, minWidth: 120 }}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => !submitting && setDeleteDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: alpha('#f44336', 0.1), color: 'error.main' }}>
                <Block />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                Delete User
              </Typography>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              This action cannot be undone!
            </Alert>
            {selectedUser && (
              <Box>
                <Typography variant="body1" gutterBottom>
                  Are you sure you want to delete this user?
                </Typography>
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: alpha('#f44336', 0.05),
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: alpha('#f44336', 0.2),
                  }}
                >
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Username:</strong> @{selectedUser.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Full Name:</strong> {selectedUser.full_name || 'Not provided'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Email:</strong> {selectedUser.email || 'Not provided'}
                  </Typography>
                </Box>
                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                  All user data, including applications and documents, will be permanently deleted.
                </Typography>
              </Box>
            )}
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
              onClick={handleDeleteUser}
              variant="contained"
              color="error"
              startIcon={<Block />}
              sx={{ borderRadius: 2, minWidth: 120 }}
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
