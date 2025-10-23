import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  Stack,
  DialogContentText,
  InputAdornment,
  Chip,
  Autocomplete,
  Avatar, // Added Avatar import
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney,
  Schedule,
  Category,
} from '@mui/icons-material';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ServiceCard = ({ service, onEdit, onDelete }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mb: 2 }}>
                <Category />
            </Avatar>
            <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                {service.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {service.description}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Chip icon={<AttachMoney />} label={`$${service.price}`} />
                <Chip icon={<Schedule />} label={`${service.turnaround_time}`} />
            </Stack>
            <Typography variant="subtitle2" fontWeight="bold">Required Documents:</Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {service.required_documents_details?.length > 0 ? service.required_documents_details.map(doc => (
                    <Chip key={doc.id} label={doc.name} size="small" />
                )) : <Chip label="None" size="small" />}
            </Stack>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
            <Button size="small" startIcon={<EditIcon />} onClick={() => onEdit(service)}>Edit</Button>
            <Button size="small" startIcon={<DeleteIcon />} color="error" onClick={() => onDelete(service)}>Delete</Button>
        </CardActions>
    </Card>
);

const ServiceDialog = ({ open, onClose, onSave, service, allDocuments, formErrors }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        turnaround_time: '',
        required_documents: [],
    });

    useEffect(() => {
        if (service) {
            setFormData({
                name: service.name,
                description: service.description,
                price: service.price,
                turnaround_time: service.turnaround_time,
                required_documents: service.required_documents || [],
            });
        } else {
            setFormData({ name: '', description: '', price: '', turnaround_time: '', required_documents: [] });
        }
    }, [service, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDocsChange = (event, value) => {
        setFormData(prev => ({ ...prev, required_documents: value.map(doc => doc.id) }));
    };

    const handleSave = () => {
        onSave(formData);
    };

    const selectedDocs = allDocuments.filter(doc => formData.required_documents.includes(doc.id));

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{service ? 'Edit Service' : 'Create New Service'}</DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ pt: 1 }}>
                    <TextField
                        name="name"
                        label="Service Name"
                        fullWidth
                        value={formData.name}
                        onChange={handleChange}
                        error={!!formErrors.name}
                        helperText={formErrors.name}
                    />
                    <TextField
                        name="description"
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
                        error={!!formErrors.description}
                        helperText={formErrors.description}
                    />
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="price"
                                label="Price"
                                fullWidth
                                type="number"
                                value={formData.price}
                                onChange={handleChange}
                                error={!!formErrors.price}
                                helperText={formErrors.price}
                                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="turnaround_time"
                                label="Turnaround Time (e.g., 5-7 business days)"
                                fullWidth
                                value={formData.turnaround_time}
                                onChange={handleChange}
                                error={!!formErrors.turnaround_time}
                                helperText={formErrors.turnaround_time}
                            />
                        </Grid>
                    </Grid>
                    <Autocomplete
                        multiple
                        options={allDocuments}
                        getOptionLabel={(option) => option.name}
                        value={selectedDocs}
                        onChange={handleDocsChange}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="outlined"
                                label="Required Documents"
                                placeholder="Select documents"
                            />
                        )}
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

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [servicesRes, docsRes] = await Promise.all([
        apiService.getServices(),
        apiService.getRequiredDocuments(),
      ]);
      setServices(servicesRes.data.sort((a, b) => a.name.localeCompare(b.name)) || []);
      setAllDocuments(docsRes.data || []);
    } catch (err) {
      setError('Failed to load data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (service = null) => {
    setSelectedService(service);
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedService(null);
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.name.trim()) errors.name = 'Service name is required.';
    if (!data.description.trim()) errors.description = 'Description is required.';
    if (!data.price || data.price <= 0) errors.price = 'Price must be a positive number.';
    if (!data.turnaround_time.trim()) errors.turnaround_time = 'Turnaround time is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (formData) => {
    if (!validateForm(formData)) return;

    const apiCall = selectedService
      ? apiService.updateService(selectedService.id, formData)
      : apiService.createService(formData);

    try {
      await apiCall;
      setSuccess(`Service ${selectedService ? 'updated' : 'created'} successfully.`);
      fetchData();
      handleCloseDialog();
    } catch (err) {
      setError(`Failed to ${selectedService ? 'update' : 'create'} service.`);
      console.error(err);
    }
  };

  const handleOpenDeleteDialog = (service) => {
    setSelectedService(service);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedService(null);
  };

  const handleDelete = async () => {
    if (!selectedService) return;
    try {
      await apiService.deleteService(selectedService.id);
      setSuccess('Service deleted successfully.');
      fetchData();
      handleCloseDeleteDialog();
    } catch (err) {
      setError('Failed to delete service. It might be associated with existing applications.');
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
            Manage Services
          </Typography>
          <Typography color="text.secondary">
            Create, edit, and manage all available services.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          New Service
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {services.length > 0 ? (
        <Grid container spacing={3}>
          {services.map((service) => (
            <Grid item key={service.id} xs={12} sm={6} md={4}>
              <ServiceCard
                service={service}
                onEdit={handleOpenDialog}
                onDelete={handleOpenDeleteDialog}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        !loading && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6">No services found.</Typography>
            <Typography color="text.secondary">
              Click "New Service" to add the first one.
            </Typography>
          </Paper>
        )
      )}

      <ServiceDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSave}
        service={selectedService}
        allDocuments={allDocuments}
        formErrors={formErrors}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the service "{selectedService?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
