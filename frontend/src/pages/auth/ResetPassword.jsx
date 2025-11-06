import { useState, useEffect } from 'react';
import { useSearchParams, Link as RouterLink, useNavigate } from 'react-router-dom';
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

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get('uid') || '';
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setMessage(null);
    setError(null);
  }, [uid, token]);

  const validatePassword = (pw) => {
    const errors = [];
    if (!pw || pw.length < 8) errors.push('Password must be at least 8 characters.');
    if (!/[A-Z]/.test(pw)) errors.push('Include at least one uppercase letter.');
    if (!/[a-z]/.test(pw)) errors.push('Include at least one lowercase letter.');
    if (!/[0-9]/.test(pw)) errors.push('Include at least one number.');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw)) errors.push('Include at least one special character.');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!newPassword) return setError('Please enter a new password.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');

    const validationErrors = validatePassword(newPassword);
    if (validationErrors.length) return setError(validationErrors.join(' '));

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/password-reset-confirm/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, token, new_password: newPassword }),
      });
      const contentType = res.headers.get('content-type') || '';
      let data = {};
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (e) {
          const text = await res.text();
          data = { detail: text };
        }
      } else {
        const text = await res.text();
        try {
          data = text ? JSON.parse(text) : {};
        } catch (e) {
          data = { detail: text };
        }
      }

      if (!res.ok) throw new Error(data?.detail || `Reset failed (status ${res.status})`);

      setMessage(data.detail || 'Password has been reset successfully.');
      // Redirect to login after short delay
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box sx={{ minHeight: { xs: 'calc(100vh - 120px)', sm: '80vh' }, display: 'flex', alignItems: 'center', justifyContent: 'center', py: { xs: 3, sm: 4 } }}>
        <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 500 }}>
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <Typography variant="h5" component="h1" gutterBottom>Reset Password</Typography>
            <Typography variant="body2" color="text.secondary">Choose a new password for your account.</Typography>
          </Box>

          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="New Password" name="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} margin="normal" required />
            <TextField fullWidth label="Confirm Password" name="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} margin="normal" required />

            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ mt: 2, mb: 1 }}>
              {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
