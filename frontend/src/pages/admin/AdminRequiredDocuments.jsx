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
  Alert,
  Stack,
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import apiService from '../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DocumentDialog = ({ open, onClose, onSave, document, services, formErrors }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    useEffect(() => {
        if (document) {
            setFormData({
                name: document.name,
                description: document.description || '',
            });
        } else {
            setFormData({ name: '', description: '' });
        }
    }, [document, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{document ? 'Edit Document Type' : 'Create New Document Type'}</DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ pt: 1 }}>
                    <TextField
                        name="name"
                        label="Document Name"
                        fullWidth
                        value={formData.name}
                        onChange={handleChange}
                        error={!!formErrors.name}
                        helperText={formErrors.name}
                    />
                    <TextField
                        name="description"
                        label="Description (Optional)"
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
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

export default function AdminRequiredDocuments() {
  const [requiredDocs, setRequiredDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiService.getRequiredDocuments();
      setRequiredDocs(response.data.sort((a, b) => a.name.localeCompare(b.name)) || []);
    } catch (err) {
      setError('Failed to load required documents.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (doc = null) => {
    setSelectedDoc(doc);
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedDoc(null);
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.name.trim()) errors.name = 'Document name is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (formData) => {
    if (!validateForm(formData)) return;

    const apiCall = selectedDoc
      ? apiService.updateRequiredDocument(selectedDoc.id, formData)
      : apiService.createRequiredDocument(formData);

    try {
      await apiCall;
      setSuccess(`Document ${selectedDoc ? 'updated' : 'created'} successfully.`);
      fetchData();
      handleCloseDialog();
    } catch (err) {
      setError(`Failed to ${selectedDoc ? 'update' : 'create'} document.`);
      console.error(err);
    }
  };

  const handleOpenDeleteDialog = (doc) => {
    setSelectedDoc(doc);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedDoc(null);
  };

  const handleDelete = async () => {
    if (!selectedDoc) return;
    try {
      await apiService.deleteRequiredDocument(selectedDoc.id);
      setSuccess('Document deleted successfully.');
      fetchData();
      handleCloseDeleteDialog();
    } catch (err) {
      setError('Failed to delete document. It might be associated with a service.');
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container sx={{ py: 8 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Required Document Types
          </Typography>
          <Typography color="text.secondary">
            Manage the list of document types that can be requested for services.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          New Document Type
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Document Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requiredDocs.length > 0 ? (
                requiredDocs.map((doc) => (
                  <TableRow key={doc.id} hover>
                    <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">{doc.name}</Typography>
                    </TableCell>
                    <TableCell>{doc.description || 'N/A'}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenDialog(doc)}><EditIcon /></IconButton>
                      <IconButton onClick={() => handleOpenDeleteDialog(doc)} color="error"><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography color="text.secondary" p={4}>
                      No document types found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <DocumentDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSave}
        document={selectedDoc}
        formErrors={formErrors}
      />

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the document type: "{selectedDoc?.name}"? This action cannot be undone and may affect services that require it.
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
