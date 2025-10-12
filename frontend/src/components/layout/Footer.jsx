import { Box, Container, Typography, Link, Divider } from '@mui/material';
import { GitHub, Email } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Sewa Portal. All rights reserved.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link
              href="https://github.com"
              color="inherit"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <GitHub fontSize="small" />
              <Typography variant="body2">GitHub</Typography>
            </Link>
            <Link
              href="mailto:support@sewaportal.com"
              color="inherit"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <Email fontSize="small" />
              <Typography variant="body2">Contact</Typography>
            </Link>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Digital Service Application Management System
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
