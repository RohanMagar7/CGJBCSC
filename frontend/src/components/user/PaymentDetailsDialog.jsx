import { useState, useEffect } from 'react';
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
  Chip,
  Grid,
  TextField,
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy,
  CheckCircle,
  QrCode2,
  AccountBalance,
  Phone,
  Info,
} from '@mui/icons-material';
import apiService from '../../pages/services/apiService';

export default function PaymentDetailsDialog({ open, onClose, application, payment }) {
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState({});

  useEffect(() => {
    if (open) {
      fetchPaymentSettings();
    }
  }, [open]);

  const fetchPaymentSettings = async () => {
    try {
      const response = await apiService.getActivePaymentSettings();
      setPaymentSettings(response.data);
    } catch (err) {
      console.error('Failed to fetch payment settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [field]: true });
    setTimeout(() => {
      setCopied({ ...copied, [field]: false });
    }, 2000);
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

        {/* Payment Methods */}
        {loading ? (
          <Typography>Loading payment details...</Typography>
        ) : paymentSettings ? (
          <Box>
            {/* UPI Payment */}
            {(paymentSettings.upi_id || paymentSettings.upi_number) && (
              <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2, md: 2.5 }, mb: 2, borderRadius: 2, bgcolor: '#f0f7ff' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, mb: { xs: 1.5, sm: 2 } }}>
                  <QrCode2 color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' } }}>
                    UPI Payment
                  </Typography>
                </Box>

                {paymentSettings.upi_id && (
                  <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      UPI ID:
                    </Typography>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: { xs: 1, sm: 1.5 }, 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        bgcolor: 'white',
                        border: '2px solid',
                        borderColor: 'primary.main',
                        flexWrap: 'wrap',
                        gap: 1,
                      }}
                    >
                      <Typography variant="body1" fontWeight="600" sx={{ fontSize: { xs: '0.85rem', sm: '1rem' }, wordBreak: 'break-all' }}>
                        {paymentSettings.upi_id}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopy(paymentSettings.upi_id, 'upi_id')}
                        color="primary"
                      >
                        {copied.upi_id ? <CheckCircle fontSize="small" /> : <ContentCopy fontSize="small" />}
                      </IconButton>
                    </Paper>
                  </Box>
                )}

                {paymentSettings.upi_number && (
                  <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      UPI Mobile Number:
                    </Typography>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: { xs: 1, sm: 1.5 }, 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        bgcolor: 'white',
                        border: '2px solid',
                        borderColor: 'primary.main',
                        flexWrap: 'wrap',
                        gap: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                        <Phone fontSize="small" sx={{ fontSize: { xs: 16, sm: 18 } }} />
                        <Typography variant="body1" fontWeight="600" sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                          {paymentSettings.upi_number}
                        </Typography>
                      </Box>
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopy(paymentSettings.upi_number, 'upi_number')}
                        color="primary"
                      >
                        {copied.upi_number ? <CheckCircle fontSize="small" /> : <ContentCopy fontSize="small" />}
                      </IconButton>
                    </Paper>
                  </Box>
                )}

                {/* QR Code Image */}
                {paymentSettings.qr_code_url && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Scan QR Code to Pay:
                    </Typography>
                    <Paper 
                      elevation={3} 
                      sx={{ 
                        p: 2, 
                        display: 'inline-block',
                        bgcolor: 'white',
                      }}
                    >
                      <img 
                        src={paymentSettings.qr_code_url} 
                        alt="Payment QR Code" 
                        style={{ 
                          maxWidth: '250px', 
                          height: 'auto',
                          display: 'block',
                        }} 
                      />
                    </Paper>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Use any UPI app to scan and pay
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}

            {/* Contact Info */}
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                For cash payment or other payment methods, please visit our office or contact support.
              </Typography>
            </Alert>
          </Box>
        ) : (
          <Alert severity="info">
            Please contact the admin for payment details.
          </Alert>
        )}

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
        <Button 
          variant="contained" 
          size="large"
          onClick={onClose}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          I've Made the Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
}
