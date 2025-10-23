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
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(formData.username, formData.password);
      if (user.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
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
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LoginIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign In
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            Welcome back! Please enter your details.
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
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
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
            </Stack>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
            <Divider sx={{ my: 2 }}>
              <Typography variant="caption">OR</Typography>
            </Divider>
            <Typography variant="body2" color="text.secondary" align="center">
              Don't have an account?{' '}
              <Link component={RouterLink} to="/register" variant="body2" color="primary">
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
