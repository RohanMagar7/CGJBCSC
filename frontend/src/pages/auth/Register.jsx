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
  Stack,
  Divider,
  Avatar,
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone_number: formData.phone_number,
      });
      navigate('/login');
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData) {
        const errorMessages = Object.values(errorData).flat().join(' ');
        setError(errorMessages || 'Registration failed.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          sx={{ 
            p: 4, 
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <PersonAdd />
          </Avatar>
          <Typography component="h1" variant="h5">
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            Join us! Please fill in the details to get started.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                {error}
              </Alert>
            )}
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                autoFocus
                autoComplete="username"
              />
              <TextField
                fullWidth
                label="Full Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
              <TextField
                fullWidth
                label="Phone Number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                autoComplete="tel"
              />
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
              <TextField
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </Stack>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
            <Divider sx={{ my: 2 }}>
              <Typography variant="caption">OR</Typography>
            </Divider>
            <Typography variant="body2" color="text.secondary" align="center">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" variant="body2" color="primary">
                Sign In
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
