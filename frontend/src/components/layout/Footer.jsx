import { Box, Container, Typography, Link, Divider } from '@mui/material';
import { GitHub, Email, Phone, LocationOn, AccessTime } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import siteInfo from '../../config/siteInfo';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: { xs: 2, sm: 3 },
        px: { xs: 1, sm: 2 },
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          justifyContent: { xs: 'center', sm: 'space-between' }, 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: { xs: 1.5, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' },
          textAlign: { xs: 'center', sm: 'left' },
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            © {new Date().getFullYear()} {siteInfo.name}. All rights reserved.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 2 }, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              href="https://github.com/rohanmagar7"
              color="inherit"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, textDecoration: 'none' }}
            >
              <GitHub fontSize="small" sx={{ fontSize: { xs: 16, sm: 20 } }} />
              <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>GitHub</Typography>
            </Link>
            <Link
              href={`mailto:${siteInfo.email}`}
              color="inherit"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, textDecoration: 'none' }}
            >
              <Email fontSize="small" sx={{ fontSize: { xs: 16, sm: 20 } }} />
              <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{siteInfo.email}</Typography>
            </Link>
          </Box>
        </Box>
        
        <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              <LocationOn sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} /> {siteInfo.operationalAddress}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              <Phone sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} /> {siteInfo.phone}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              <AccessTime sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} /> {siteInfo.hours}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Link component={RouterLink} to={siteInfo.privacyPath} color="inherit" underline="none">
              <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Privacy Policy</Typography>
            </Link>
            <Link
              href="https://www.linkedin.com/in/rohanmagar7"
              color="inherit"
              underline="none"
            >
              <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Dev by Rohan Magar</Typography>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
