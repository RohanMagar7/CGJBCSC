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
   const initialForm = {
     full_name: '', dob: '', gender: '', mobile: '', email: '', aadhaar: '',
     // Education
     college_name: '', course: '', study_year: '', admission_date: '', college_address: '', college_contact: '', college_id_number: '',
     // Residence
     permanent_address: '', current_address: '', residence_proof_attached: false, native_place: '', residence_type: '', residence_name_address: '',
     // Scheme
     ration_card_number: '', ration_card_type: '', veg_nonveg: '',
     // Meal info (not sent to backend as there is no model field, kept for records)
     current_meal_location: '', why_need: '', near_canteen: '', expected_canteen_location: '',
     // Bank
     bank_name: '', branch_name: '', account_number: '', ifsc: '',
     // Declaration
     declaration: false,
   };

   const [form, setForm] = useState(initialForm);

  const [files, setFiles] = useState({});
  const [fileErrors, setFileErrors] = useState({});

  const openForm = () => setFormOpen(true);
  const closeForm = () => setFormOpen(false);

  const handleFieldChange = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [key]: val }));
  };

  const handleFileChange = (key) => (e) => {
    const f = e.target.files[0];
    if (!f) return;
    // Validate type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 250 * 1024; // 250 KB
    if (!allowedTypes.includes(f.type)) {
      setFileErrors((p) => ({ ...p, [key]: 'Unsupported file type. Accepted: jpg, png, pdf' }));
      return;
    }
    if (f.size > maxSize) {
      setFileErrors((p) => ({ ...p, [key]: 'File too large. Max 250 KB' }));
      return;
    }
    // clear any previous error for this key
    setFileErrors((p) => {
      const copy = { ...p };
      delete copy[key];
      return copy;
    });
    setFiles((p) => ({ ...p, [key]: f }));
  };

  const FileInput = ({ label, accept = '.pdf,.jpg,.jpeg,.png', name }) => (
    <Stack direction="column" spacing={0.5}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button variant="outlined" size="small" component="label" sx={{ alignSelf: 'flex-start' }}>
          {label}
          <input hidden type="file" accept={accept} onChange={handleFileChange(name)} />
        </Button>
        {files[name] && (
          <>
            {files[name].type && files[name].type.startsWith('image/') ? (
              <Avatar src={URL.createObjectURL(files[name])} alt={files[name].name} sx={{ width: 40, height: 40 }} />
            ) : null}
            <Box>
              <Typography variant="caption">{files[name].name}</Typography>
              <Typography variant="caption" color={files[name].size > 250*1024 ? 'error' : 'text.secondary'} sx={{ display: 'block' }}>{Math.round(files[name].size/1024)} KB</Typography>
            </Box>
            <IconButton size="small" onClick={handleFileRemove(name)} aria-label={`remove-${name}`}>
              <DeleteOutline fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>
      {fileErrors[name] ? (
        <Typography variant="caption" color="error">{fileErrors[name]}</Typography>
      ) : (
        <Typography variant="caption" color="text.secondary">Max size: 250 KB • Accepted: jpg, jpeg, png, pdf</Typography>
      )}
    </Stack>
  );

  const handleSubmitForm = async () => {
    setSubmitting(true);
    setError('');
    try {
      // Client-side validation for required fields and documents
      const requiredFields = [
        'full_name','dob','gender','aadhaar','mobile','email',
        'permanent_address','current_address',
        'college_name','course','study_year','admission_date','college_address',
        'current_meal_location','why_need','expected_canteen_location',
        'bank_name','branch_name','account_number','ifsc'
      ];
      const requiredFileKeys = ['aadhaar_file','ration_card_file','fee_residence_proof','college_id_card','last_marksheet','bank_passbook','passport_photo'];

      const missingFields = requiredFields.filter((k) => {
        const v = form[k];
        return v === undefined || v === null || String(v).trim() === '';
      });
      const missingFiles = requiredFileKeys.filter((k) => !files[k]);
      if (missingFields.length > 0 || missingFiles.length > 0) {
        const fieldLabels = {
          full_name: 'विद्यार्थ्याचे पूर्ण नाव', dob: 'जन्मतारीख', gender: 'लिंग', aadhaar: 'आधार क्रमांक', mobile: 'मोबाईल क्रमांक', email: 'ई-मेल आयडी',
          permanent_address: 'कायमचा पत्ता', current_address: 'सध्याचा पत्ता',
          college_name: 'महाविद्यालय / संस्था नाव', course: 'अभ्यासक्रम / शाखा', study_year: 'वर्ग / वर्ष', admission_date: 'प्रवेश दिनांक', college_address: 'महाविद्यालय पत्ता व संपर्क',
          current_meal_location: 'तुम्ही सध्या जेवण कुठे करता?', why_need: 'अन्नछत्राची गरज का आहे?', expected_canteen_location: 'अपेक्षित अन्नछत्राचे ठिकाण',
          bank_name: 'बँक नाव', branch_name: 'शाखा', account_number: 'खाते क्रमांक', ifsc: 'IFSC'
        };
        const missingFieldLabels = missingFields.map((k) => fieldLabels[k] || k);
        const fileLabels = {
          aadhaar_file: 'आधार कार्ड', ration_card_file: 'राशन कार्ड', fee_residence_proof: 'रहिवासी पुरावा', college_id_card: 'महाविद्यालय ओळखपत्र', last_marksheet: 'गुणपत्रिका', bank_passbook: 'बँक पासबुक', passport_photo: 'पासपोर्ट फोटो'
        };
        const missingFileLabels = missingFiles.map((k) => fileLabels[k] || k);
        const msgs = [];
        if (missingFieldLabels.length) msgs.push('कृपया भरा: ' + missingFieldLabels.join(', '));
        if (missingFileLabels.length) msgs.push('कृपया जोडलेली कागदपत्रे अपलोड करा: ' + missingFileLabels.join(', '));
        setError(msgs.join(' • '));
        setSubmitting(false);
        return;
      }

      const fd = new FormData();
      // Only append fields that the backend serializer expects to avoid 400 errors.
      const allowedFields = [
        'full_name', 'dob', 'gender', 'mobile', 'email', 'aadhaar', 'passport_photo',
        'college_name', 'college_address', 'course', 'study_year', 'college_id_number', 'college_id_card', 'college_contact',
        'current_address', 'native_place', 'residence_type', 'residence_name_address', 'permanent_address', 'residence_proof_attached',
        'ration_card_number', 'ration_card_type', 'veg_nonveg', 'ration_card_file',
        'bank_name', 'branch_name', 'account_number', 'ifsc', 'bank_passbook',
        // Meal / canteen related fields
        'current_meal_location', 'why_need', 'near_canteen', 'expected_canteen_location',
        'aadhaar_file', 'fee_residence_proof', 'last_marksheet', 'signature', 'declaration'
      ];

      Object.entries(form).forEach(([k, v]) => {
        if (allowedFields.includes(k) && v !== undefined && v !== null) {
          // Boolean values should be sent as strings 'true'/'false'
          if (typeof v === 'boolean') fd.append(k, v ? 'true' : 'false');
          else fd.append(k, v);
        }
      });
      // append only allowed files (avoid sending unexpected keys to backend serializer)
      const allowedFileKeys = ['passport_photo','college_id_card','ration_card_file','bank_passbook','aadhaar_file','fee_residence_proof','last_marksheet','signature'];
      Object.entries(files).forEach(([k, f]) => {
        if (f && (typeof f === 'object') && allowedFileKeys.includes(k)) fd.append(k, f);
      });

      const res = await apiService.createGopinathApplication(fd);
      if (res && res.data) {
        alert('आपली नोंदणी यशस्वी झाली. धन्यवाद!');
        setFormOpen(false);
        // reset
        setForm(initialForm);
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
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, lineHeight: 1.05 }}> गोपीनाथराव मुंढे साहेब अन्नछत्र योजना</Typography>
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
                    <Feature icon={<SupportAgent />} title="सुरक्षित आणि स्वच्छ">स्वच्छता आणि सुरक्षा मानके पालन केली जातात.</Feature>
                  </Grid>
                </Grid>
                  {/* Registration Form Dialog */}
                  <Dialog open={formOpen} onClose={closeForm} maxWidth="md" fullWidth>
                    <DialogTitle>नोंदणी - गोपीनाथराव मुंढे अन्नछत्र योजना</DialogTitle>
                    <DialogContent dividers sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" fontWeight={800}>विद्यार्थी अर्ज फॉर्म / Application Form</Typography>
                        <Typography variant="subtitle2" color="text.secondary">कृपया खालील सर्व माहिती अचूक भरा</Typography>
                      </Box>

                      {/* Personal Details (responsive two-column layout) */}
                      <Paper elevation={0} sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight={800}>अर्जदाराची वैयक्तिक माहिती</Typography>
                        </Box>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="विद्यार्थ्याचे पूर्ण नाव *" variant="outlined" size="small" required placeholder="पूर्ण नाव" value={form.full_name} onChange={handleFieldChange('full_name')} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="जन्मतारीख *" variant="outlined" size="small" type="date" InputLabelProps={{ shrink: true }} required value={form.dob} onChange={handleFieldChange('dob')} />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                              <InputLabel>लिंग *</InputLabel>
                              <Select size="small" value={form.gender} label="लिंग" onChange={handleFieldChange('gender')} required>
                                <MenuItem value="Male">पुरुष</MenuItem>
                                <MenuItem value="Female">स्त्री</MenuItem>
                                <MenuItem value="Other">इतर</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="आधार क्रमांक *" variant="outlined" size="small" required placeholder="XXXXXXXXXXXX" inputProps={{ maxLength: 12 }} value={form.aadhaar} onChange={handleFieldChange('aadhaar')} />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="मोबाईल क्रमांक *" variant="outlined" size="small" required placeholder="10 digit" inputProps={{ maxLength: 10 }} value={form.mobile} onChange={handleFieldChange('mobile')} />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="ई-मेल आयडी *" variant="outlined" size="small" required placeholder="example@domain.com" value={form.email} onChange={handleFieldChange('email')} />
                          </Grid>
                        </Grid>
                      </Paper>

                      {/* Bank Details - responsive two-column */}
                      <Paper elevation={0} sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight={800}>बँक व खात्याची माहिती</Typography>
                        </Box>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="बँक नाव *" variant="outlined" size="small" required placeholder="बँक नाव" value={form.bank_name} onChange={handleFieldChange('bank_name')} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="शाखा *" variant="outlined" size="small" required placeholder="शाखा" value={form.branch_name} onChange={handleFieldChange('branch_name')} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="खाते क्रमांक *" variant="outlined" size="small" required placeholder="खाते क्रमांक" value={form.account_number} onChange={handleFieldChange('account_number')} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="IFSC कोड *" variant="outlined" size="small" required placeholder="IFSC" value={form.ifsc} onChange={handleFieldChange('ifsc')} />
                          </Grid>
                        </Grid>
                      </Paper>

                      {/* Residence - responsive two-column */}
                      <Paper elevation={0} sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight={800}>कौटुंबिक व राहत्या ठिकाणाची माहिती</Typography>
                        </Box>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="कायमचा पत्ता (गाव, तालुका, जिल्हा) *" variant="outlined" size="small" required placeholder="पूरा पत्ता" value={form.permanent_address} onChange={handleFieldChange('permanent_address')} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="सध्याचा पत्ता (शहरातील वास्तव्याचे ठिकाण) *" variant="outlined" size="small" required placeholder="सध्याचा पत्ता" value={form.current_address} onChange={handleFieldChange('current_address')} />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                              <InputLabel>रहिवासी पुरावा जोडला आहे का? *</InputLabel>
                              <Select size="small" value={form.residence_proof_attached ? 'Yes' : 'No'} onChange={(e)=> setForm(p=>({...p, residence_proof_attached: e.target.value==='Yes'}))}>
                                <MenuItem value="Yes">होय</MenuItem>
                                <MenuItem value="No">नाही</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                              <InputLabel>राशन कार्ड प्रकार</InputLabel>
                              <Select size="small" value={form.ration_card_type} label="राशन कार्ड प्रकार" onChange={handleFieldChange('ration_card_type')}>
                                <MenuItem value="BPL">BPL</MenuItem>
                                <MenuItem value="Antyodaya">अन्त्योदय</MenuItem>
                                <MenuItem value="FoodSecurity">अन्न सुरक्षा</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="राशन कार्ड क्रमांक" variant="outlined" size="small" placeholder="राशन कार्ड क्रमांक" value={form.ration_card_number} onChange={handleFieldChange('ration_card_number')} />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="ठिकाण / जन्मस्थळ" variant="outlined" size="small" placeholder="जन्मस्थळ" value={form.native_place} onChange={handleFieldChange('native_place')} />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="रहिवासी प्रकार" variant="outlined" size="small" placeholder="रहिवासी प्रकार" value={form.residence_type} onChange={handleFieldChange('residence_type')} />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="रहिवासी नाव व पत्ता" variant="outlined" size="small" placeholder="रहिवासी नाव व पत्ता" value={form.residence_name_address} onChange={handleFieldChange('residence_name_address')} />
                          </Grid>
                        </Grid>
                      </Paper>

                      {/* Education 12-16 */}
                      <Paper elevation={0} sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight={800}>🎓 शैक्षणिक माहिती</Typography>
                        </Box>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid item xs={4}><Typography variant="body2" fontWeight={700}>महाविद्यालय / संस्था नाव *</Typography></Grid>
                          <Grid item xs={8}><TextField fullWidth variant="outlined" size="small" required placeholder="महाविद्यालयाचे नाव" value={form.college_name} onChange={handleFieldChange('college_name')} /></Grid>

                          <Grid item xs={4}><Typography variant="body2" fontWeight={700}>अभ्यासक्रम / शाखा *</Typography></Grid>
                          <Grid item xs={8}><TextField fullWidth variant="outlined" size="small" required placeholder="कोर्स / शाखा" value={form.course} onChange={handleFieldChange('course')} /></Grid>

                          <Grid item xs={4}><Typography variant="body2" fontWeight={700}>वर्ग / वर्ष *</Typography></Grid>
                          <Grid item xs={8}><TextField fullWidth variant="outlined" size="small" required placeholder="वर्ग / वर्ष" value={form.study_year} onChange={handleFieldChange('study_year')} /></Grid>

                          <Grid item xs={4}><Typography variant="body2" fontWeight={700}>प्रवेश दिनांक *</Typography></Grid>
                          <Grid item xs={8}><TextField fullWidth variant="outlined" size="small" required type="date" InputLabelProps={{ shrink: true }} value={form.admission_date} onChange={handleFieldChange('admission_date')} /></Grid>

                          <Grid item xs={4}><Typography variant="body2" fontWeight={700}>महाविद्यालय पत्ता व संपर्क *</Typography></Grid>
                          <Grid item xs={8}><TextField fullWidth variant="outlined" size="small" required placeholder="पत्ता व संपर्क" value={form.college_address} onChange={handleFieldChange('college_address')} /></Grid>
                          <Grid item xs={4}><Typography variant="body2" fontWeight={700}>महाविद्यालय ओळख क्रमांक</Typography></Grid>
                          <Grid item xs={8}><TextField fullWidth variant="outlined" size="small" placeholder="महाविद्यालय ओळख क्रमांक" value={form.college_id_number} onChange={handleFieldChange('college_id_number')} /></Grid>
                        </Grid>
                      </Paper>

                      {/* Scheme 17-20 */}
                      <Paper elevation={0} sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight={800}>🍱 अन्नछत्र योजनेशी संबंधित माहिती</Typography>
                        </Box>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid item xs={4}><Typography>तुम्ही सध्या जेवण कुठे करता? *</Typography></Grid>
                          <Grid item xs={8}><TextField fullWidth variant="outlined" size="small" required value={form.current_meal_location} onChange={handleFieldChange('current_meal_location')} /></Grid>

                          <Grid item xs={4}><Typography>अन्नछत्राची गरज का आहे? (थोडक्यात लिहा) *</Typography></Grid>
                          <Grid item xs={8}><TextField fullWidth variant="outlined" size="small" required multiline rows={3} value={form.why_need} onChange={handleFieldChange('why_need')} /></Grid>

                          <Grid item xs={4}><Typography>तुम्ही शासनमान्य अन्नछत्राजवळ राहता का?</Typography></Grid>
                          <Grid item xs={8}><FormControl fullWidth><Select size="small" value={form.near_canteen || 'No'} onChange={handleFieldChange('near_canteen')}><MenuItem value="Yes">होय</MenuItem><MenuItem value="No">नाही</MenuItem></Select></FormControl></Grid>

                          <Grid item xs={4}><Typography>अपेक्षित अन्नछत्राचे ठिकाण (शहर/जिल्हा) *</Typography></Grid>
                          <Grid item xs={8}><TextField fullWidth variant="outlined" size="small" required value={form.expected_canteen_location} onChange={handleFieldChange('expected_canteen_location')} /></Grid>
                        </Grid>
                      </Paper>

                      {/* Documents */}
                      <Paper elevation={0} sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight={800}>📎 जोडलेली कागदपत्रे (Documents Attached)</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>कृपया खालील कागदपत्रे जोडा</Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}><FileInput label="आधार कार्ड *" name="aadhaar_file" /></Grid>
                          <Grid item xs={12} sm={6}><FileInput label="राशन कार्ड *" name="ration_card_file" /></Grid>
                          <Grid item xs={12} sm={6}><FileInput label="गेल्या वर्षाची गुणपत्रिका (Last Year Marksheet) *" name="last_marksheet" /></Grid>
                          <Grid item xs={12} sm={6}><FileInput label="रहिवासी दाखला / भाडेकरार *" name="fee_residence_proof" /></Grid>
                          <Grid item xs={12} sm={6}><FileInput label="महाविद्यालय ओळखपत्र / प्रवेशपत्र *" name="college_id_card" /></Grid>
                          <Grid item xs={12} sm={6}><FileInput label="बँक पासबुकची छायाप्रत *" name="bank_passbook" /></Grid>
                          <Grid item xs={12} sm={6}><FileInput label="पासपोर्ट साईज फोटो (२ नग) *" name="passport_photo" accept=".jpg,.jpeg,.png" /></Grid>
                          <Grid item xs={12} sm={6}><FileInput label="स्वाक्षरी / सही (Signature)" name="signature" accept=".jpg,.jpeg,.png" /></Grid>
                        </Grid>
                      </Paper>

                      <Box sx={{ mb: 2 }}>
                        <FormControlLabel control={<Checkbox checked={form.declaration} onChange={handleFieldChange('declaration')} />} label={<>
                          <Typography variant="body2">मी वरील सर्व माहिती माझ्या माहितीनुसार बरोबर दिली आहे. शासनाने ठरवलेल्या सर्व अटी व शर्ती मला मान्य आहेत. चुकीची माहिती दिल्यास मला योजनेचा लाभ नाकारला जाईल.</Typography>
                        </>} />
                          <Typography variant="caption" color="text.secondary">लक्षात घ्या: सर्व कागदपत्रांचे स्कॅन/फोटो स्पष्ट असावेत आणि 250 KB पेक्षा जास्त नसाव्यात.</Typography>
                        {error && <Typography color="error" variant="body2">{error}</Typography>}
                      </Box>

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
