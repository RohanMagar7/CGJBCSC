import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Stack,
  Chip,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/system';
import {
  Restaurant,
  LocalDining,
  School,
  SupportAgent,
  FileDownload,
  LocationOn,
} from '@mui/icons-material';
import { DeleteOutline } from '@mui/icons-material';
import apiService from '../services/apiService';

const Hero = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: 12,
  overflow: 'hidden',
  color: theme.palette.common.white,
  minHeight: 260,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundImage:
    "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.25)), url('https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=6c0a9b6f3a2b4b4f2a8a2f4d6b6c3f7e')",
  padding: '48px 24px',
}));

const Feature = ({ icon, title, children }) => (
  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, height: '100%', bgcolor: 'background.paper' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar sx={{ bgcolor: 'primary.main' }}>{icon}</Avatar>
      <Box>
        <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
        <Typography variant="body2" color="text.secondary">{children}</Typography>
      </Box>
    </Box>
  </Paper>
);

const StatBox = ({ label, value }) => (
  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: 'grey.50' }}>
    <Typography variant="h6" fontWeight={800}>{value}</Typography>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
  </Paper>
);

const GopinathScheme = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const handleFileRemove = (key) => () => {
    setFiles((p) => {
      const copy = { ...p };
      delete copy[key];
      return copy;
    });
  };

  // Form state
  const [form, setForm] = useState({
    full_name: '', dob: '', gender: '', mobile: '', email: '', aadhaar: '',
    college_name: '', college_address: '', course: '', study_year: '', college_id_number: '',
    current_address: '', native_place: '', residence_type: '', residence_name_address: '',
    ration_card_number: '', ration_card_type: '', veg_nonveg: '',
    bank_name: '', branch_name: '', account_number: '', ifsc: '',
    declaration: false,
  });

  const [files, setFiles] = useState({});

  const openForm = () => setFormOpen(true);
  const closeForm = () => setFormOpen(false);

  const handleFieldChange = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [key]: val }));
  };

  const handleFileChange = (key) => (e) => {
    setFiles((p) => ({ ...p, [key]: e.target.files[0] }));
  };

  const FileInput = ({ label, accept = '.pdf,.jpg,.jpeg,.png', name }) => (
    <Stack direction="column" spacing={0.5}>
      <Button variant="outlined" component="label" sx={{ alignSelf: 'flex-start' }}>
        {label}
        <input hidden type="file" accept={accept} onChange={handleFileChange(name)} />
      </Button>
      {files[name] && (
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={files[name].name} size="small" />
          <IconButton size="small" onClick={handleFileRemove(name)} aria-label={`remove-${name}`}>
            <DeleteOutline fontSize="small" />
          </IconButton>
        </Stack>
      )}
    </Stack>
  );

  const handleSubmitForm = async () => {
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, v);
      });
      // append files
      Object.entries(files).forEach(([k, f]) => {
        if (f) fd.append(k, f);
      });

      const res = await apiService.createGopinathApplication(fd);
      if (res && res.data) {
        alert('आपली नोंदणी यशस्वी झाली. धन्यवाद!');
        setFormOpen(false);
        // reset
        setForm({ full_name: '', dob: '', gender: '', mobile: '', email: '', aadhaar: '', college_name: '', college_address: '', course: '', study_year: '', college_id_number: '', current_address: '', native_place: '', residence_type: '', residence_name_address: '', ration_card_number: '', ration_card_type: '', veg_nonveg: '', bank_name: '', branch_name: '', account_number: '', ifsc: '', declaration: false });
        setFiles({});
      }
    } catch (err) {
      console.error('Failed to submit scheme application', err);
      setError(err.response?.data?.detail || 'Failed to submit. Please check the fields.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Hero>
        <Box sx={{ textAlign: 'center', maxWidth: 920 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, lineHeight: 1.05 }}>🌾 गोपीनाथराव मुंढे साहेब अन्नछत्र योजना</Typography>
          <Typography variant="h6" sx={{ mb: 2, opacity: 0.95 }}>(महाराष्ट्र शासनाची विद्यार्थी हिताची योजना)</Typography>
          <Typography variant="body1" sx={{ maxWidth: 820, mx: 'auto', color: 'rgba(255,255,255,0.95)' }}>
            "भूक नव्हे, शिक्षण हवे — गोपीनाथराव मुंढेंच स्वप्न सवे!" — गावातून शहरात येणार्‍या गरीब व मध्यमवर्गीय विद्यार्थ्यांना
            पौष्टिक अन्न अर्ध्या (50%) सवलतीत उपलब्ध करून देण्याचा हा प्रयत्न आहे.
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" color="secondary" sx={{ px: 3, py: 1.25 }} onClick={openForm}>नोंदणी करा</Button>
            <Button variant="outlined" color="inherit" startIcon={<FileDownload />}>ब्रोशर डाउनलोड</Button>
          </Box>
        </Box>
      </Hero>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h5" fontWeight={800} gutterBottom>योजनेचा उद्देश</Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  गोपीनाथराव मुंढे साहेब अन्नछत्र योजना ही विद्यार्थ्यांच्या पौष्टिक आहाराद्वारे शिक्षणाच्या सातत्याला प्रोत्साहन देण्याचे उद्दिष्ट
                  साधते. शहरातील आर्थिकदृष्ट्या दुर्बळ घटकातील विद्यार्थ्यांना स्वच्छ आणि पौष्टिक जेवण ५०% सवलतीत उपलब्ध करून देणे हे मुख्य उद्देश आहे.
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Feature icon={<Restaurant />} title="५०% सवलत">शाकाहारी आणि पौष्टिक जेवण अर्ध्या किमतीत.</Feature>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Feature icon={<LocalDining />} title="नियमित सेवा">दररोज, वेळापत्रकानुसार जेवणाची सोय.</Feature>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                        <Button variant="contained" fullWidth sx={{ mb: 1 }} onClick={openForm}>नोंदणी करा</Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Feature icon={<SupportAgent />} title="सुरक्षित आणि स्वच्छ">स्वच्छता आणि सुरक्षा मानके पालन केली जातात.</Feature>
                  </Grid>
                </Grid>
                  {/* Registration Form Dialog */}
                  <Dialog open={formOpen} onClose={closeForm} maxWidth="md" fullWidth>
                    <DialogTitle>नोंदणी - गोपीनाथराव मुंढे अन्नछत्र योजना</DialogTitle>
                    <DialogContent dividers>
                      <Stack spacing={2}>
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
                          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>🧍‍♂️ वैयक्तिक माहिती / Personal Details</Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}><TextField fullWidth label="पूर्ण नाव" value={form.full_name} onChange={handleFieldChange('full_name')} /></Grid>
                            <Grid item xs={12} sm={3}><TextField fullWidth type="date" label="जन्मतारीख" InputLabelProps={{ shrink: true }} value={form.dob} onChange={handleFieldChange('dob')} /></Grid>
                            <Grid item xs={12} sm={3}>
                              <FormControl fullWidth>
                                <InputLabel>लिंग</InputLabel>
                                <Select value={form.gender} label="लिंग" onChange={handleFieldChange('gender')}>
                                  <MenuItem value="Male">पुरुष</MenuItem>
                                  <MenuItem value="Female">स्त्री</MenuItem>
                                  <MenuItem value="Other">इतर</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}><TextField fullWidth label="मोबाईल क्रमांक" value={form.mobile} onChange={handleFieldChange('mobile')} /></Grid>
                            <Grid item xs={12} sm={6}><TextField fullWidth label="ईमेल आयडी" value={form.email} onChange={handleFieldChange('email')} /></Grid>
                            <Grid item xs={12} sm={6}><TextField fullWidth label="आधार क्रमांक" value={form.aadhaar} onChange={handleFieldChange('aadhaar')} /></Grid>
                            <Grid item xs={12} sm={6}><FileInput label="पासपोर्ट साइज फोटो" name="passport_photo" accept=".jpg,.jpeg,.png" /></Grid>
                          </Grid>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
                          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>🎓 शैक्षणिक माहिती / Educational Details</Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12}><TextField fullWidth label="कॉलेजचे नाव" value={form.college_name} onChange={handleFieldChange('college_name')} /></Grid>
                            <Grid item xs={12}><TextField fullWidth label="कॉलेज पत्ता" value={form.college_address} onChange={handleFieldChange('college_address')} /></Grid>
                            <Grid item xs={12} sm={6}><TextField fullWidth label="कोर्स / शाखा" value={form.course} onChange={handleFieldChange('course')} /></Grid>
                            <Grid item xs={12} sm={6}><TextField fullWidth label="शिक्षण वर्ष" value={form.study_year} onChange={handleFieldChange('study_year')} /></Grid>
                            <Grid item xs={12} sm={6}><TextField fullWidth label="कॉलेज आयडी क्रमांक" value={form.college_id_number} onChange={handleFieldChange('college_id_number')} /></Grid>
                            <Grid item xs={12} sm={6}><FileInput label="कॉलेज आयडी" name="college_id_card" /></Grid>
                          </Grid>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
                          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>🏠 निवास माहिती / Residence Details</Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12}><TextField fullWidth label="सध्याचा पत्ता" value={form.current_address} onChange={handleFieldChange('current_address')} /></Grid>
                            <Grid item xs={12} sm={6}><TextField fullWidth label="मूळ गाव / तालुका / जिल्हा" value={form.native_place} onChange={handleFieldChange('native_place')} /></Grid>
                            <Grid item xs={12} sm={6}>
                              <FormControl fullWidth>
                                <InputLabel>राहण्याचा प्रकार</InputLabel>
                                <Select value={form.residence_type} label="राहण्याचा प्रकार" onChange={handleFieldChange('residence_type')}>
                                  <MenuItem value="Hostel">हॉस्टेल</MenuItem>
                                  <MenuItem value="Room">रूम</MenuItem>
                                  <MenuItem value="Rented">भाड्याने</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12}><TextField fullWidth label="हॉस्टेल / रूमचे नाव व पत्ता" value={form.residence_name_address} onChange={handleFieldChange('residence_name_address')} /></Grid>
                          </Grid>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
                          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>🍛 योजना संबंधित माहिती / Scheme Details</Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}><TextField fullWidth label="राशन कार्ड क्रमांक" value={form.ration_card_number} onChange={handleFieldChange('ration_card_number')} /></Grid>
                            <Grid item xs={12} sm={6}>
                              <FormControl fullWidth>
                                <InputLabel>राशन कार्ड प्रकार</InputLabel>
                                <Select value={form.ration_card_type} label="राशन कार्ड प्रकार" onChange={handleFieldChange('ration_card_type')}>
                                  <MenuItem value="Yellow">पिवळा</MenuItem>
                                  <MenuItem value="Orange">केशरी</MenuItem>
                                  <MenuItem value="White">पांढरा</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <FormControl fullWidth>
                                <InputLabel>शाकाहारी / मांसाहारी</InputLabel>
                                <Select value={form.veg_nonveg} label="शाकाहारी / मांसाहारी" onChange={handleFieldChange('veg_nonveg')}>
                                  <MenuItem value="Veg">शाकाहारी</MenuItem>
                                  <MenuItem value="Non-Veg">मांसाहारी</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}><FileInput label="राशन कार्ड प्रत" name="ration_card_file" /></Grid>
                          </Grid>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
                          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>🏦 बँक माहिती / Bank Details</Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}><TextField fullWidth label="बँकेचे नाव" value={form.bank_name} onChange={handleFieldChange('bank_name')} /></Grid>
                            <Grid item xs={12} sm={6}><TextField fullWidth label="शाखेचे नाव" value={form.branch_name} onChange={handleFieldChange('branch_name')} /></Grid>
                            <Grid item xs={12} sm={6}><TextField fullWidth label="खाते क्रमांक" value={form.account_number} onChange={handleFieldChange('account_number')} /></Grid>
                            <Grid item xs={12} sm={6}><TextField fullWidth label="IFSC कोड" value={form.ifsc} onChange={handleFieldChange('ifsc')} /></Grid>
                            <Grid item xs={12}><FileInput label="बँक पासबुकची प्रत" name="bank_passbook" /></Grid>
                          </Grid>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
                          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>📎 संलग्न कागदपत्रे / Required Documents</Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}><FileInput label="आधार कार्ड प्रत" name="aadhaar_file" /></Grid>
                            <Grid item xs={12} sm={6}><FileInput label="फी / निवास पावती" name="fee_residence_proof" /></Grid>
                            <Grid item xs={12} sm={6}><FileInput label="मागील शैक्षणिक वर्षाची मार्कशीट" name="last_marksheet" /></Grid>
                            <Grid item xs={12} sm={6}><FileInput label="सही (scan)" name="signature" accept=".jpg,.jpeg,.png,.pdf" /></Grid>
                          </Grid>
                        </Paper>

                        <Stack direction="row" spacing={2} alignItems="center">
                          <FormControlLabel control={<Checkbox checked={form.declaration} onChange={handleFieldChange('declaration')} />} label="मी दिलेली सर्व माहिती खरी आहे." />
                          {error && <Typography color="error" variant="body2">{error}</Typography>}
                        </Stack>
                      </Stack>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={closeForm} disabled={submitting}>रद्द करा</Button>
                      <Button variant="contained" onClick={handleSubmitForm} disabled={submitting || !form.declaration}>{submitting ? 'सबमिट करत आहे...' : 'सबमिट करा'}</Button>
                    </DialogActions>
                  </Dialog>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight={800} gutterBottom>योजनेचे फायदे</Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1" fontWeight={700}>आर्थिक दिलासा</Typography>
                    <Typography variant="body2" color="text.secondary">घरखर्चावर ताण कमी करून शिक्षणाला जागा मिळते.</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1" fontWeight={700}>आरोग्यदायी अन्न</Typography>
                    <Typography variant="body2" color="text.secondary">पौष्टिकता आणि स्वच्छता यावर भर.</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1" fontWeight={700}>शिक्षणावर लक्ष</Typography>
                    <Typography variant="body2" color="text.secondary">भूक कमी झाल्याने शिकण्यावर लक्ष वाढते.</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1" fontWeight={700}>ग्रामीण विद्यार्थी सहाय्य</Typography>
                    <Typography variant="body2" color="text.secondary">गावातून आलेल्या विद्यार्थ्यांसाठी विशेष मदत.</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight={800}>प्रेरणादायी विचार</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  "भूक भागवणं ही केवळ गरज नाही — ती शिक्षणाची पहिली पायरी आहे. जेव्हा पोट भरतं, तेव्हा मन शिकण्यासाठी मोकळं होतं."
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  "गावातून आलेला प्रत्येक विद्यार्थी हे महाराष्ट्राचं भविष्य आहे — आणि ही योजना त्या भविष्याला उर्जा देणारी आहे."
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default GopinathScheme;
