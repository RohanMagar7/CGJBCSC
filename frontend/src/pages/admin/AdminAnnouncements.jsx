import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  IconButton,
  Stack,
  Switch,
  FormControlLabel,
  DialogContentText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Campaign as CampaignIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AnnouncementCard = ({ announcement, onEdit, onDelete }) => {
    const getChipColor = (type) => {
        switch(type) {
            case 'info': return 'info';
            case 'warning': return 'warning';
            case 'alert': return 'error';
            default: return 'default';
        }
    };

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                    <Box>
                        <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                            {announcement.title}
                        </Typography>
                    </Box>
                    <Chip label={announcement.is_active ? 'Active' : 'Inactive'} color={announcement.is_active ? 'success' : 'default'} size="small" />
                </Stack>
                <Chip label={announcement.type} color={getChipColor(announcement.type)} size="small" sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {announcement.content}
                </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                <Button size="small" startIcon={<EditIcon />} onClick={() => onEdit(announcement)}>Edit</Button>
                <Button size="small" startIcon={<DeleteIcon />} color="error" onClick={() => onDelete(announcement)}>Delete</Button>
            </CardActions>
        </Card>
    );
};

const AnnouncementDialog = ({ open, onClose, announcement, onSave, formErrors }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'info',
        is_active: true,
    });

    useEffect(() => {
        if (announcement) {
            setFormData({
                title: announcement.title,
                content: announcement.content,
                type: announcement.type,
                is_active: announcement.is_active,
            });
        } else {
            setFormData({ title: '', content: '', type: 'info', is_active: true });
        }
    }, [announcement, open]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{announcement ? 'Edit Announcement' : 'Create New Announcement'}</DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ pt: 1 }}>
                    <TextField
                        name="title"
                        label="Title"
                        fullWidth
                        value={formData.title}
                        onChange={handleChange}
                        error={!!formErrors.title}
                        helperText={formErrors.title}
                    />
                    <TextField
                        name="content"
                        label="Content"
                        fullWidth
                        multiline
                        rows={4}
                        value={formData.content}
                        onChange={handleChange}
                        error={!!formErrors.content}
                        helperText={formErrors.content}
                    />
                    <FormControl fullWidth error={!!formErrors.type}>
                        <InputLabel>Type</InputLabel>
                        <Select
                            name="type"
                            label="Type"
                            value={formData.type}
                            onChange={handleChange}
                        >
                            <MenuItem value="info">Info</MenuItem>
                            <MenuItem value="warning">Warning</MenuItem>
                            <MenuItem value="alert">Alert</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControlLabel
                        control={<Switch name="is_active" checked={formData.is_active} onChange={handleChange} />}
                        label="Active"
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAnnouncements();
      setAnnouncements(response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) || []);
    } catch (err) {
      setError('Failed to fetch announcements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (announcement = null) => {
    setSelectedAnnouncement(announcement);
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAnnouncement(null);
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.title.trim()) errors.title = 'Title is required.';
    if (!data.content.trim()) errors.content = 'Content is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (formData) => {
    if (!validateForm(formData)) return;

    const apiCall = selectedAnnouncement
      ? apiService.updateAnnouncement(selectedAnnouncement.id, formData)
      : apiService.createAnnouncement(formData);

    try {
      await apiCall;
      setSuccess(`Announcement ${selectedAnnouncement ? 'updated' : 'created'} successfully.`);
      fetchAnnouncements();
      handleCloseDialog();
    } catch (err) {
      setError(`Failed to ${selectedAnnouncement ? 'update' : 'create'} announcement.`);
      console.error(err);
    }
  };

  const handleOpenDeleteDialog = (announcement) => {
    setSelectedAnnouncement(announcement);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedAnnouncement(null);
  };

  const handleDelete = async () => {
    if (!selectedAnnouncement) return;
    try {
      await apiService.deleteAnnouncement(selectedAnnouncement.id);
      setSuccess('Announcement deleted successfully.');
      fetchAnnouncements();
      handleCloseDeleteDialog();
    } catch (err) {
      setError('Failed to delete announcement.');
      console.error(err);
    }
  };

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
          <Typography variant="h4" component="h1" fontWeight="bold">
            Manage Announcements
          </Typography>
          <Typography color="text.secondary">
            Create, edit, and manage portal-wide announcements.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          New Announcement
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={4}>
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <Grid item key={announcement.id} xs={12} sm={6} md={4}>
              <AnnouncementCard 
                announcement={announcement} 
                onEdit={handleOpenDialog}
                onDelete={handleOpenDeleteDialog}
              />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ textAlign: 'center', p: 4 }}>
              <CampaignIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
              <Typography variant="h6" mt={2}>No Announcements Found</Typography>
              <Typography color="text.secondary">
                Click "New Announcement" to create one.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      <AnnouncementDialog 
        open={dialogOpen}
        onClose={handleCloseDialog}
        announcement={selectedAnnouncement}
        onSave={handleSave}
        formErrors={formErrors}
      />

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the announcement: "{selectedAnnouncement?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
