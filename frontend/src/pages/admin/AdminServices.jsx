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
  IconButton,
  Box,
  Chip,
  Alert,
  Divider,
  Avatar,
  alpha,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  AttachMoney,
  Schedule,
  Settings,
  Close,
  Save,
  Category,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    service_name: '',
    description: '',
    price: '',
    processing_days: '',
  });

  // Required documents state
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [newDocument, setNewDocument] = useState({
    document_name: '',
    description: '',
    is_mandatory: true,
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiService.getServices();
      setServices(response.data || response);
      setError('');
    } catch (err) {
      setError('Failed to fetch services');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        service_name: service.service_name || '',
        description: service.description || '',
        price: service.price || '',
        processing_days: service.processing_days || '',
      });
      // Load existing required documents
      setRequiredDocuments(service.required_documents || []);
    } else {
      setEditingService(null);
      setFormData({
        service_name: '',
        description: '',
        price: '',
        processing_days: '',
      });
      setRequiredDocuments([]);
    }
    setNewDocument({ document_name: '', description: '', is_mandatory: true });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingService(null);
    setFormData({
      service_name: '',
      description: '',
      price: '',
      processing_days: '',
    });
    setRequiredDocuments([]);
    setNewDocument({ document_name: '', description: '', is_mandatory: true });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Required Documents handlers
  const handleAddDocument = () => {
    if (!newDocument.document_name.trim()) {
      return;
    }
    setRequiredDocuments((prev) => [
      ...prev,
      {
        ...newDocument,
        // Temporary ID for new documents (will be replaced by backend)
        temp_id: Date.now(),
      },
    ]);
    setNewDocument({ document_name: '', description: '', is_mandatory: true });
  };

  const handleRemoveDocument = async (doc) => {
    if (doc.required_doc_id) {
      // Document exists in backend, delete it
      try {
        await apiService.deleteRequiredDocument(doc.required_doc_id);
        setRequiredDocuments((prev) =>
          prev.filter((d) => d.required_doc_id !== doc.required_doc_id)
        );
      } catch (err) {
        setError('Failed to delete document');
        console.error(err);
      }
    } else {
      // New document not yet saved, just remove from list
      setRequiredDocuments((prev) =>
        prev.filter((d) => d.temp_id !== doc.temp_id)
      );
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.service_name.trim()) {
      errors.service_name = 'Service name is required';
    }
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) < 0) {
      errors.price = 'Valid price amount is required';
    }
    if (!formData.processing_days || isNaN(formData.processing_days) || parseInt(formData.processing_days) < 1) {
      errors.processing_days = 'Valid processing time is required (minimum 1 day)';
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
      const serviceData = {
        service_name: formData.service_name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        processing_days: parseInt(formData.processing_days, 10),
      };

      let serviceId;
      if (editingService) {
        await apiService.updateService(editingService.service_id, serviceData);
        serviceId = editingService.service_id;
        setSuccess('Service updated successfully! ✓');
      } else {
        const response = await apiService.createService(serviceData);
        serviceId = response.data.service_id;
        setSuccess('Service created successfully! ✓');
      }

      // Save required documents (only new ones without required_doc_id)
      const newDocs = requiredDocuments.filter((doc) => !doc.required_doc_id);
      for (const doc of newDocs) {
        await apiService.createRequiredDocument({
          service: serviceId,
          document_name: doc.document_name,
          description: doc.description,
          is_mandatory: doc.is_mandatory,
        });
      }

      handleCloseDialog();
      fetchServices();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.detail || 'Failed to save service');
      console.error('Service save error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;

    setSubmitting(true);
    try {
      await apiService.deleteService(serviceToDelete.service_id);
      setSuccess('Service deleted successfully! ✓');
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
      fetchServices();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.detail || 'Failed to delete service');
      console.error('Service delete error:', err);
      setDeleteDialogOpen(false);
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
            background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
            color: 'white',
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                <Settings sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Manage Services
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Create, edit, and manage all available services
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
                color: 'success.main',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                fontWeight: 'bold',
                px: 3,
              }}
            >
              Add New Service
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

        {/* Services Grid */}
        {services.length === 0 ? (
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
                bgcolor: alpha('#4caf50', 0.1),
                color: 'success.main',
                margin: '0 auto',
                mb: 2,
              }}
            >
              <Category sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              No Services Available
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Get started by creating your first service
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ borderRadius: 2 }}
            >
              Add Your First Service
            </Button>
          </Paper>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Available Services ({services.length})
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {services.map((service) => (
                <Grid item xs={12} md={6} lg={4} key={service.service_id}>
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
                        boxShadow: '0 8px 16px rgba(76, 175, 80, 0.2)',
                        borderColor: 'success.main',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      {/* Service Icon & Title */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha('#4caf50', 0.1),
                            color: 'success.main',
                            width: 50,
                            height: 50,
                          }}
                        >
                          <DescriptionIcon sx={{ fontSize: 28 }} />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom fontWeight="bold">
                            {service.service_name}
                          </Typography>
                          <Chip
                            label={`Service #${service.service_id}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </Box>
                      </Box>

                      {/* Description */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          minHeight: 60,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {service.description}
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      {/* Service Details */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <AttachMoney sx={{ fontSize: 18, color: 'success.main' }} />
                            <Typography variant="caption" color="text.secondary">
                              Fee
                            </Typography>
                          </Box>
                          <Typography variant="h6" fontWeight="bold" color="success.main">
                            ₹{service.price}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, justifyContent: 'flex-end' }}>
                            <Schedule sx={{ fontSize: 18, color: 'primary.main' }} />
                            <Typography variant="caption" color="text.secondary">
                              Processing Time
                            </Typography>
                          </Box>
                          <Typography variant="h6" fontWeight="bold" color="primary.main">
                            {service.processing_days} days
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>

                    <Divider />

                    {/* Actions */}
                    <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(service)}
                        sx={{ borderRadius: 2, flex: 1, mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteClick(service)}
                        sx={{ borderRadius: 2, flex: 1 }}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {/* Add/Edit Service Dialog */}
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
                <Avatar sx={{ bgcolor: alpha('#4caf50', 0.1), color: 'success.main' }}>
                  {editingService ? <EditIcon /> : <AddIcon />}
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  {editingService ? 'Edit Service' : 'Add New Service'}
                </Typography>
              </Box>
              <IconButton onClick={handleCloseDialog} size="small">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              fullWidth
              label="Service Name"
              name="service_name"
              value={formData.service_name}
              onChange={handleInputChange}
              margin="normal"
              required
              error={!!formErrors.service_name}
              helperText={formErrors.service_name}
              placeholder="e.g., Birth Certificate"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DescriptionIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={4}
              required
              error={!!formErrors.description}
              helperText={formErrors.description}
              placeholder="Provide a detailed description of the service..."
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price Amount"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  error={!!formErrors.price}
                  helperText={formErrors.price}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney color="action" />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="0.00"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Processing Time"
                  name="processing_days"
                  type="number"
                  value={formData.processing_days}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  error={!!formErrors.processing_days}
                  helperText={formErrors.processing_days || 'In days'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Schedule color="action" />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="7"
                />
              </Grid>
            </Grid>

            {/* Required Documents Section */}
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Required Documents
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Define what documents users must upload when applying for this service.
            </Typography>

            {/* Existing Required Documents List */}
            {requiredDocuments.length > 0 && (
              <Box sx={{ mb: 2 }}>
                {requiredDocuments.map((doc, index) => (
                  <Paper
                    key={doc.required_doc_id || doc.temp_id}
                    elevation={0}
                    sx={{
                      p: 2,
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body1" fontWeight="600">
                          {doc.document_name}
                        </Typography>
                        {doc.is_mandatory ? (
                          <Chip
                            icon={<CheckCircle />}
                            label="Required"
                            size="small"
                            color="error"
                            sx={{ height: 20 }}
                          />
                        ) : (
                          <Chip
                            icon={<Cancel />}
                            label="Optional"
                            size="small"
                            sx={{
                              height: 20,
                              bgcolor: alpha('#ff9800', 0.1),
                              color: '#ff9800',
                            }}
                          />
                        )}
                      </Box>
                      {doc.description && (
                        <Typography variant="body2" color="text.secondary">
                          {doc.description}
                        </Typography>
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveDocument(doc)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Paper>
                ))}
              </Box>
            )}

            {/* Add New Document Form */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: alpha('#667eea', 0.02),
              }}
            >
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                Add Document Requirement
              </Typography>
              <TextField
                fullWidth
                size="small"
                label="Document Name"
                value={newDocument.document_name}
                onChange={(e) =>
                  setNewDocument((prev) => ({ ...prev, document_name: e.target.value }))
                }
                placeholder="e.g., Citizenship Certificate"
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                size="small"
                label="Description / Instructions (Optional)"
                value={newDocument.description}
                onChange={(e) =>
                  setNewDocument((prev) => ({ ...prev, description: e.target.value }))
                }
                multiline
                rows={2}
                placeholder="Additional instructions for this document..."
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">Mandatory:</Typography>
                  <Button
                    size="small"
                    variant={newDocument.is_mandatory ? 'contained' : 'outlined'}
                    color={newDocument.is_mandatory ? 'error' : 'inherit'}
                    onClick={() =>
                      setNewDocument((prev) => ({ ...prev, is_mandatory: true }))
                    }
                  >
                    Required
                  </Button>
                  <Button
                    size="small"
                    variant={!newDocument.is_mandatory ? 'contained' : 'outlined'}
                    color={!newDocument.is_mandatory ? 'warning' : 'inherit'}
                    onClick={() =>
                      setNewDocument((prev) => ({ ...prev, is_mandatory: false }))
                    }
                  >
                    Optional
                  </Button>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddDocument}
                  disabled={!newDocument.document_name.trim()}
                >
                  Add Document
                </Button>
              </Box>
            </Paper>
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
              {submitting ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
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
                Delete Service
              </Typography>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to delete this service?
            </Typography>
            {serviceToDelete && (
              <Paper
                elevation={0}
                sx={{ p: 2, mt: 2, bgcolor: alpha('#f44336', 0.05), borderRadius: 2 }}
              >
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  {serviceToDelete.service_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Price: ₹{serviceToDelete.price} • {serviceToDelete.processing_days} days
                </Typography>
              </Paper>
            )}
            <Alert severity="warning" sx={{ mt: 2 }}>
              This action cannot be undone. All associated data will be permanently removed.
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
              {submitting ? 'Deleting...' : 'Delete Service'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
