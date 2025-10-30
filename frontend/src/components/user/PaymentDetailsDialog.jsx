import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Paper,
  Alert,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, CheckCircle } from '@mui/icons-material';
import apiService from '../../pages/services/apiService';

export default function PaymentDetailsDialog({ open, onClose, application, payment }) {
  const [razorpayLoading, setRazorpayLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPay = async () => {
    if (!application || !payment) return;
    setRazorpayLoading(true);
    try {
      const resp = await apiService.createRazorpayOrder(application.application_id, payment.amount);
      const data = resp.data || resp;
      const key_id = data.key_id;
      const order = data.order || (data && data.id ? data : null);

      if (!key_id || !order) throw new Error('Invalid order response from server');

      await loadRazorpayScript();

      const options = {
        key: key_id,
        amount: order.amount, // amount in paise
        currency: order.currency || 'INR',
        name: 'Sewa Portal',
        description: `Payment for ${application.service_name}`,
        order_id: order.id,
        handler: async function (response) {
          // Verify on server
          try {
            const verifyResp = await apiService.verifyRazorpayPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              application: application.application_id,
            });
            // If verification succeeded, close dialog and refresh
            setRazorpayLoading(false);
            onClose();
          } catch (err) {
            console.error('Razorpay verification failed', err);
            setRazorpayLoading(false);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: application.user_name || '',
        },
        theme: { color: '#667eea' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Razorpay payment error:', err);
      alert('Failed to initiate Razorpay payment: ' + (err?.message || 'unknown'));
      setRazorpayLoading(false);
    }
  };

  if (!payment || !application) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      fullScreen={window.innerWidth < 600}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          backgroundImage: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
          m: { xs: 0, sm: 2 },
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: { xs: 2, sm: 3 },
        flexWrap: 'wrap',
        gap: 1,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
          <CheckCircle sx={{ fontSize: { xs: 20, sm: 24 } }} />
          <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Application Approved - Payment Required
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
        {/* Success Alert */}
        <Alert severity="success" icon={<CheckCircle />} sx={{ mb: { xs: 2, sm: 3 }, borderRadius: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          <Typography variant="body1" fontWeight="bold" sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
            🎉 Congratulations! Your application has been approved.
          </Typography>
          <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            Please complete the payment to proceed with processing your request.
          </Typography>
        </Alert>

        {/* Application Details */}
        <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            Application Details
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Service:</Typography>
            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{application.service_name}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Application ID:</Typography>
            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>#{application.application_id}</Typography>
          </Box>
          <Divider sx={{ my: { xs: 1, sm: 1.5 } }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Amount to Pay:</Typography>
            <Typography variant="h5" color="success.main" fontWeight="bold" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              NPR {payment.amount}
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ mb: 2 }}>
          <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2, bgcolor: '#f7fbff' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Pay securely using Razorpay
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click "Pay with Razorpay" to open the secure checkout and complete your payment. After successful payment you will be redirected and the payment will be verified automatically.
            </Typography>
          </Paper>
        </Box>

        {/* Important Notes */}
        <Alert severity="warning" sx={{ mt: 3, borderRadius: 2 }}>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            Important Notes:
          </Typography>
          <Typography variant="body2" component="div">
            • After making the payment, keep your transaction ID/receipt
            <br />
            • Your service will be processed after payment verification
            <br />
            • For any issues, please contact support with Application ID: #{application.application_id}
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" size="large">
          Close
        </Button>
        {/* Razorpay quick-pay button */}
        <Button
          variant="contained"
          size="large"
          color="secondary"
          onClick={handleRazorpayPay}
          disabled={razorpayLoading}
          sx={{
            background: 'linear-gradient(135deg, #ff7a18 0%, #ff4e50 100%)',
          }}
        >
          {razorpayLoading ? 'Processing...' : 'Pay with Razorpay'}
        </Button>

        {/* Close button retained for convenience */}
      </DialogActions>
    </Dialog>
  );
}
