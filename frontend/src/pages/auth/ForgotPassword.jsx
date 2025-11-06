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
} from '@mui/material';
import { API_BASE_URL } from '../../config/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/password-reset/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      // Read response safely: only parse JSON when content-type is JSON
      const contentType = res.headers.get('content-type') || '';
      let data = {};
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (e) {
          // Invalid JSON despite content-type header; fallback to text
          const text = await res.text();
          data = { detail: text };
        }
      } else {
        // fallback to text for better error messages in production where HTML may be returned
        const text = await res.text();
        try {
          data = text ? JSON.parse(text) : {};
        } catch (e) {
          data = { detail: text };
        }
      }

      if (!res.ok) throw new Error(data?.detail || `Request failed (status ${res.status})`);

      setMessage(data.detail || 'If an account with that email exists, a reset link has been sent.');
    } catch (err) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box sx={{ minHeight: { xs: 'calc(100vh - 120px)', sm: '80vh' }, display: 'flex', alignItems: 'center', justifyContent: 'center', py: { xs: 3, sm: 4 } }}>
        <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 500 }}>
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <Typography variant="h5" component="h1" gutterBottom>Forgot Password</Typography>
            <Typography variant="body2" color="text.secondary">Enter your email and we'll send a link to reset your password.</Typography>
          </Box>

          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" required />

            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ mt: 2, mb: 1 }}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Remembered your password? <Link component={RouterLink} to="/login">Sign in</Link></Typography>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
