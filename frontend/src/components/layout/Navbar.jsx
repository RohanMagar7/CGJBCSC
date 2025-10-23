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
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  alpha,
  Stack,
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
  ChevronLeft,
  ExpandMore,
  Info,
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

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
    handleClose();
  };

  const menuItems = user
    ? [
        ...(isAdmin
          ? [
              { label: 'Dashboard', icon: <Dashboard />, path: '/admin' },
              { label: 'Applications', icon: <Assignment />, path: '/admin/applications' },
              { label: 'Users', icon: <People />, path: '/admin/users' },
              { label: 'Services', icon: <ListAlt />, path: '/admin/services' },
              { label: 'Payments', icon: <Payment />, path: '/admin/payments' },
              { label: 'Announcements', icon: <Description />, path: '/admin/announcements' },
            ]
          : [
              { label: 'Home', icon: <Home />, path: '/home' },
              { label: 'Services', icon: <CardTravel />, path: '/services' },
              { label: 'My Applications', icon: <ListAlt />, path: '/applications' },
              { label: 'Gov Schemes Info', icon: <Info />, path: '/gov-schemes' },
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
          width: { xs: 280, sm: 320 },
          backgroundColor: 'background.paper',
          borderRight: 'none',
          boxShadow: '0 8px 40px -12px rgba(0,0,0,0.1)',
        }
      }}
    >
      <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }} role="presentation">
        {/* Drawer Header */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight="bold" color="primary">
            Menu
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <ChevronLeft />
          </IconButton>
        </Box>
        
        <List sx={{ flexGrow: 1, p: 1 }}>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.label}
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected, &.Mui-selected:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                }
              }}
              selected={window.location.pathname === item.path}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>

        {user && (
          <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<Logout />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );

  const renderDesktopMenu = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {menuItems.map((item) => (
        <Button
          key={item.label}
          component={RouterLink}
          to={item.path}
          sx={{
            color: 'text.primary',
            fontWeight: 500,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: '2px',
              backgroundColor: 'primary.main',
              transition: 'width 0.3s ease',
            },
            '&:hover::after, &.active::after': {
              width: '80%',
            },
            '&.active': {
              color: 'primary.main',
            }
          }}
          className={window.location.pathname === item.path ? 'active' : ''}
        >
          {item.label}
        </Button>
      ))}
    </Box>
  );

  return (
    <>
      <AppBar position="sticky">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {user && isMobile && (
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setDrawerOpen(true)}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                flexGrow: { xs: 1, md: 0 },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.2rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              CGJBCSC
            </Typography>

            {user && !isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                {renderDesktopMenu()}
              </Box>
            )}

            <Box sx={{ flexGrow: { xs: 0, md: 0 } }}>
              {user ? (
                <>
                  <IconButton onClick={handleMenu} sx={{ p: 0 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {user.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <ExpandMore sx={{ ml: 0.5, color: 'text.secondary' }} />
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                      sx: {
                        mt: 1.5,
                        borderRadius: 2,
                        boxShadow: '0 8px 40px -12px rgba(0,0,0,0.2)',
                      }
                    }}
                  >
                    <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                      <Typography fontWeight="bold">{user.username}</Typography>
                      <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                    </Box>
                    <MenuItem onClick={handleLogout} sx={{ m: 1, borderRadius: 1.5, color: 'error.main' }}>
                      <ListItemIcon>
                        <Logout fontSize="small" color="error" />
                      </ListItemIcon>
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    component={RouterLink}
                    to="/login"
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    component={RouterLink}
                    to="/register"
                  >
                    Register
                  </Button>
                </Stack>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      {user && renderDrawer()}
    </>
  );
};

export default Navbar;
