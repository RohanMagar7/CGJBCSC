import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Grid,
  FormControlLabel,
  Checkbox,
  Collapse,
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd, AdminPanelSettings } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    phone_number: '',
    role: 'user',
    admin_secret: '', // Add admin secret field
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminSecret, setShowAdminSecret] = useState(false);
  const [registerAsAdmin, setRegisterAsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleAdminCheckbox = (e) => {
    setRegisterAsAdmin(e.target.checked);
    if (!e.target.checked) {
      setFormData({ ...formData, admin_secret: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (formData.phone_number.length < 10) {
      setError('Please enter a valid phone number');
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.username?.[0] || 
                       err.response?.data?.detail ||
                       'Registration failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          minHeight: { xs: 'calc(100vh - 120px)', sm: '80vh' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 3, sm: 4 },
        }}
      >
        <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 700 }}>
          <Box sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'center' }}>
            <PersonAdd sx={{ fontSize: { xs: 40, sm: 48 }, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Fill in your details to get started
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Registration successful! Redirecting to login...
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  autoFocus
                  helperText="Choose a unique username"
                  size="medium"
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    },
                    '& .MuiFormHelperText-root': {
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  size="medium"
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  helperText="Optional"
                  size="medium"
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    },
                    '& .MuiFormHelperText-root': {
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                  helperText="10 digits"
                  size="medium"
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    },
                    '& .MuiFormHelperText-root': {
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  helperText="Minimum 6 characters"
                  size="medium"
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    },
                    '& .MuiFormHelperText-root': {
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size={window.innerWidth < 600 ? 'small' : 'medium'}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Admin Registration Option */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={registerAsAdmin}
                      onChange={handleAdminCheckbox}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AdminPanelSettings fontSize="small" />
                      <Typography variant="body2">Register as Admin</Typography>
                    </Box>
                  }
                />
              </Grid>

              {/* Admin Secret Key Field - Only shows when checkbox is checked */}
              <Grid item xs={12}>
                <Collapse in={registerAsAdmin}>
                  <TextField
                    fullWidth
                    label="Admin Secret Key"
                    name="admin_secret"
                    type={showAdminSecret ? 'text' : 'password'}
                    value={formData.admin_secret}
                    onChange={handleChange}
                    required={registerAsAdmin}
                    helperText="Enter the admin secret key to register as admin"
                    size="medium"
                    sx={{
                      '& .MuiInputBase-root': {
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                      },
                      '& .MuiFormHelperText-root': {
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowAdminSecret(!showAdminSecret)}
                            edge="end"
                            size={window.innerWidth < 600 ? 'small' : 'medium'}
                          >
                            {showAdminSecret ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Collapse>
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || success}
              sx={{ 
                mt: { xs: 2, sm: 3 }, 
                mb: 2, 
                py: { xs: 1.2, sm: 1.5 },
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
              }}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                Already have an account?{' '}
                <Link component={RouterLink} to="/login" underline="hover">
                  Login here
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
