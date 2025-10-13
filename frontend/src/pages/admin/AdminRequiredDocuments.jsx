import { useState, useEffect } from 'react';
import {
  Box,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Checkbox,
  FormControlLabel,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import apiService from '../../services/apiService';

export default function AdminRequiredDocuments() {
  const [requiredDocs, setRequiredDocs] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [formData, setFormData] = useState({
    service: '',
    document_name: '',
    description: '',
    is_mandatory: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [docsResponse, servicesResponse] = await Promise.all([
        apiService.getRequiredDocuments(),
        apiService.getServices(),
      ]);
      setRequiredDocs(docsResponse.data);
      setServices(servicesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (doc = null) => {
    if (doc) {
      setSelectedDoc(doc);
      setFormData({
        service: doc.service,
        document_name: doc.document_name,
        description: doc.description || '',
        is_mandatory: doc.is_mandatory,
      });
    } else {
      setSelectedDoc(null);
      setFormData({
        service: '',
        document_name: '',
        description: '',
        is_mandatory: true,
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDoc(null);
    setError('');
  };

  const handleOpenDeleteDialog = (doc) => {
    setSelectedDoc(doc);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedDoc(null);
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'is_mandatory' ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setError('');
      
      // Validation
      if (!formData.service || !formData.document_name) {
        setError('Please fill in all required fields');
        return;
      }

      if (selectedDoc) {
        await apiService.updateRequiredDocument(selectedDoc.required_doc_id, formData);
        setSuccess('Required document updated successfully');
      } else {
        await apiService.createRequiredDocument(formData);
        setSuccess('Required document created successfully');
      }

      handleCloseDialog();
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving required document:', error);
      setError(error.response?.data?.message || 'Failed to save required document');
    }
  };

  const handleDelete = async () => {
    try {
      await apiService.deleteRequiredDocument(selectedDoc.required_doc_id);
      setSuccess('Required document deleted successfully');
      handleCloseDeleteDialog();
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting required document:', error);
      setError('Failed to delete required document');
    }
  };

  const getServiceName = (serviceId) => {
    const service = services.find((s) => s.service_id === serviceId);
    return service ? service.service_name : 'Unknown Service';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" fontWeight="bold">
            Required Documents
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
            }}
          >
            Add Required Document
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Manage required documents for each service. Users must upload these documents when applying.
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {error && !openDialog && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'grey.200',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha('#667eea', 0.05) }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Service</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Document Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Mandatory</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : requiredDocs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <DescriptionIcon sx={{ fontSize: 60, color: 'grey.300', mb: 2 }} />
                  <Typography color="text.secondary">
                    No required documents defined yet
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{ mt: 2 }}
                  >
                    Add First Document
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              requiredDocs.map((doc) => (
                <TableRow
                  key={doc.required_doc_id}
                  sx={{ '&:hover': { bgcolor: alpha('#667eea', 0.02) } }}
                >
                  <TableCell>
                    <Chip
                      label={getServiceName(doc.service)}
                      size="small"
                      sx={{
                        bgcolor: alpha('#667eea', 0.1),
                        color: '#667eea',
                        fontWeight: 'bold',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">
                      {doc.document_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {doc.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {doc.is_mandatory ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Required"
                        size="small"
                        color="success"
                      />
                    ) : (
                      <Chip
                        icon={<CancelIcon />}
                        label="Optional"
                        size="small"
                        sx={{
                          bgcolor: alpha('#ff9800', 0.1),
                          color: '#ff9800',
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(doc)}
                      sx={{
                        color: 'primary.main',
                        '&:hover': { bgcolor: alpha('#667eea', 0.1) },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDeleteDialog(doc)}
                      sx={{
                        color: 'error.main',
                        ml: 1,
                        '&:hover': { bgcolor: alpha('#f44336', 0.1) },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedDoc ? 'Edit Required Document' : 'Add Required Document'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Service</InputLabel>
              <Select
                name="service"
                value={formData.service}
                onChange={handleInputChange}
                label="Service"
              >
                {services.map((service) => (
                  <MenuItem key={service.service_id} value={service.service_id}>
                    {service.service_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              required
              label="Document Name"
              name="document_name"
              value={formData.document_name}
              onChange={handleInputChange}
              placeholder="e.g., Citizenship Certificate"
            />

            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={3}
              placeholder="Additional instructions for users about this document"
            />

            <FormControlLabel
              control={
                <Checkbox
                  name="is_mandatory"
                  checked={formData.is_mandatory}
                  onChange={handleInputChange}
                />
              }
              label="This document is mandatory"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedDoc ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Required Document</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the required document "
            {selectedDoc?.document_name}" for {getServiceName(selectedDoc?.service)}?
          </Typography>
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
