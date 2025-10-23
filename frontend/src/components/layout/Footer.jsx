import { Box, Container, Typography, Link, Stack, IconButton } from '@mui/material';
import { GitHub, Email, LinkedIn } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        mt: 'auto',
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} CGJBCSC Portal. All rights reserved.
          </Typography>
          
          <Stack direction="row" spacing={1}>
            <IconButton component="a" href="https://github.com/rohanmagar7" target="_blank" aria-label="GitHub">
              <GitHub />
            </IconButton>
            <IconButton component="a" href="https://www.linkedin.com/in/rohanmagar7" target="_blank" aria-label="LinkedIn">
              <LinkedIn />
            </IconButton>
            <IconButton component="a" href="mailto:rohanmagar.dev@gmail.com" aria-label="Email">
              <Email />
            </IconButton>
          </Stack>
        </Stack>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center" 
          sx={{ mt: 2 }}
        >
          Developed by <Link href="https://www.linkedin.com/in/rohanmagar7" target="_blank" color="primary" underline="hover">Rohan Magar</Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
