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
    <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
      <Box sx={{ width: { xs: 240, sm: 280 } }} role="presentation">
        {/* Drawer Header */}
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6" fontWeight="bold">
            Sewa Portal
          </Typography>
          {user && (
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {user.username} ({user.role})
            </Typography>
          )}
        </Box>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.path}
              component={RouterLink}
              to={item.path}
              onClick={() => setDrawerOpen(false)}
              sx={{
                '&:hover': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ 
                  fontSize: { xs: '0.9rem', sm: '1rem' } 
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
      <AppBar position="sticky" elevation={2}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Mobile Menu */}
            {isMobile && user && (
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setDrawerOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo */}
            <Home sx={{ mr: 1, fontSize: { xs: 24, sm: 28 } }} />
            <Typography
              variant="h6"
              component={RouterLink}
              to="/home"
              sx={{
                flexGrow: isMobile ? 1 : 0,
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 'bold',
                mr: { xs: 2, md: 4 },
                fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
              }}
            >
              Sewa Portal
            </Typography>

            {/* Desktop Menu */}
            {!isMobile && user && (
              <Box sx={{ flexGrow: 1, display: 'flex', gap: { xs: 0.5, md: 1 }, flexWrap: 'wrap' }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    color="inherit"
                    startIcon={item.icon}
                    sx={{
                      fontSize: { xs: '0.8rem', md: '0.875rem' },
                      px: { xs: 1, md: 2 },
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, fontSize: { sm: '0.85rem', md: '0.875rem' } }}>
                  {user.username}
                </Typography>
                <IconButton onClick={handleMenu} color="inherit" size="small">
                  <Avatar sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }}>
                    <AccountCircle />
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
                      mt: 1,
                      minWidth: 180,
                    },
                  }}
                >
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
                      {user.username} ({user.role})
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Logout sx={{ mr: 1 }} fontSize="small" />
                    <Typography sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  color="inherit"
                  startIcon={<Login />}
                  sx={{
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    px: { xs: 1.5, sm: 2 },
                  }}
                >
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  color="inherit"
                  variant="outlined"
                  startIcon={<PersonAdd />}
                  sx={{ 
                    display: { xs: 'none', sm: 'inline-flex' },
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    px: { xs: 1.5, sm: 2 },
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
