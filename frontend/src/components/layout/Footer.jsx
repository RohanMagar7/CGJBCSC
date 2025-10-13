import { Box, Container, Typography, Link, Divider } from '@mui/material';
import { GitHub, Email } from '@mui/icons-material';

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
            © {new Date().getFullYear()} Sewa Portal. All rights reserved.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 2 }, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              href="https://github.com"
              color="inherit"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, textDecoration: 'none' }}
            >
              <GitHub fontSize="small" sx={{ fontSize: { xs: 16, sm: 20 } }} />
              <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>GitHub</Typography>
            </Link>
            <Link
              href="mailto:support@sewaportal.com"
              color="inherit"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, textDecoration: 'none' }}
            >
              <Email fontSize="small" sx={{ fontSize: { xs: 16, sm: 20 } }} />
              <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Contact</Typography>
            </Link>
          </Box>
        </Box>
        
        <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />
        
        <Typography 
          variant="caption" 
          color="text.secondary" 
          align="center" 
          display="block"
          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
        >
          Digital Service Application Management System
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
