import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Dashboard,
  ListAlt,
  AdminPanelSettings,
  Logout,
  Login,
  PersonAdd,
  Home,
  Assignment,
  People,
  Payment,
  CardTravel,
  Description,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const menuItems = user
    ? [
        ...(isAdmin
          ? [
              { label: 'Admin Dashboard', icon: <AdminPanelSettings />, path: '/admin' },
              { label: 'Manage Applications', icon: <Assignment />, path: '/admin/applications' },
              { label: 'Manage Users', icon: <People />, path: '/admin/users' },
              { label: 'Manage Services', icon: <ListAlt />, path: '/admin/services' },
              { label: 'Payments', icon: <Payment />, path: '/admin/payments' },
              { label: 'Announcements', icon: <Dashboard />, path: '/admin/announcements' },
            ]
          : [
              { label: 'Home', icon: <Home />, path: '/home' },
              { label: 'Services', icon: <CardTravel />, path: '/services' },
              { label: 'My Applications', icon: <ListAlt />, path: '/applications' },
            ]),
      ]
    : [];

  const renderDrawer = () => (
    <Drawer 
      anchor="left" 
      open={drawerOpen} 
      onClose={() => setDrawerOpen(false)}
      PaperProps={{
        sx: {
          width: { xs: 260, sm: 300 },
          background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
        }
      }}
    >
      <Box sx={{ width: '100%' }} role="presentation">
        {/* Drawer Header */}
        <Box sx={{ p: 3, color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1.5,
              }}
            >
              <Home sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography variant="h6" fontWeight="800" letterSpacing="-0.5px">
              Sewa Portal
            </Typography>
          </Box>
          {user && (
            <Box 
              sx={{ 
                p: 1.5, 
                bgcolor: 'rgba(255,255,255,0.15)', 
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
              }}
            >
              <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                {user.full_name}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, textTransform: 'capitalize' }}>
                {user.role}
              </Typography>
            </Box>
          )}
        </Box>
        <List sx={{ pt: 2 }}>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.path}
              component={RouterLink}
              to={item.path}
              onClick={() => setDrawerOpen(false)}
              sx={{
                py: 1.5,
                px: 2.5,
                mx: 1,
                mb: 0.5,
                borderRadius: 2,
                color: 'rgba(255,255,255,0.9)',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  transform: 'translateX(8px)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'white' }}>{item.icon}</ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ 
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 60, md: 70 } }}>
            {/* Mobile Menu */}
            {isMobile && user && (
              <IconButton
                edge="start"
                sx={{ 
                  mr: 2,
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.light',
                  }
                }}
                onClick={() => setDrawerOpen(true)}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo */}
            <Box
              component={RouterLink}
              to="/home"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
                mr: { xs: 2, md: 4 },
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
            >
              <Box
                sx={{
                  width: { xs: 36, md: 40 },
                  height: { xs: 36, md: 40 },
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5,
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                }}
              >
                <Home sx={{ color: 'white', fontSize: { xs: 20, md: 24 } }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  flexGrow: isMobile ? 1 : 0,
                  fontWeight: 800,
                  fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.35rem' },
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px',
                }}
              >
                Sewa Portal
              </Typography>
            </Box>

            {/* Desktop Menu */}
            {!isMobile && user && (
              <Box sx={{ flexGrow: 1, display: 'flex', gap: 0.5, ml: 2 }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    startIcon={item.icon}
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                      },
                      '& .MuiButton-startIcon': {
                        color: 'primary.main',
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            <Box sx={{ flexGrow: 1 }} />

            {/* User Menu */}
            {user ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    display: { xs: 'none', sm: 'flex' },
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      lineHeight: 1.2,
                    }}
                  >
                    {user.full_name}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      textTransform: 'capitalize',
                    }}
                  >
                    {user.role}
                  </Typography>
                </Box>
                <IconButton 
                  onClick={handleMenu} 
                  size="small"
                  sx={{
                    p: 0.5,
                    border: '2px solid',
                    borderColor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.light',
                    }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: { xs: 32, sm: 36 }, 
                      height: { xs: 32, sm: 36 },
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontWeight: 700,
                    }}
                  >
                    {user.full_name.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      minWidth: 200,
                      borderRadius: 2,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      border: '1px solid',
                      borderColor: 'divider',
                    },
                  }}
                >
                  <MenuItem disabled sx={{ opacity: 1, cursor: 'default' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                        {user.full_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {user.role}
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{
                      mt: 1,
                      color: 'error.main',
                      '&:hover': {
                        bgcolor: 'error.light',
                      }
                    }}
                  >
                    <Logout sx={{ mr: 1.5 }} fontSize="small" />
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  startIcon={<Login />}
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    px: 2.5,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    color: 'primary.main',
                    border: '1px solid',
                    borderColor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.light',
                    }
                  }}
                >
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  startIcon={<PersonAdd />}
                  sx={{ 
                    display: { xs: 'none', sm: 'inline-flex' },
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    px: 2.5,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #66398f 100%)',
                      boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                    }
                  }}
                >
                  Register
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      {renderDrawer()}
    </>
  );
};

export default Navbar;
