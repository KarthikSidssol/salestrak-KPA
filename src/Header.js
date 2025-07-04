import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Typography,
  Divider,
  useMediaQuery,
} from '@mui/material';
import { 
  Logout, 
  Notifications, 
  Person,
  Settings 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import logo from './assets/salestrakpa-logo.png';

const Header = ({ children }) => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationAnchor, setNotificationAnchor] = React.useState(null);
  const open = Boolean(anchorEl);
  const notificationOpen = Boolean(notificationAnchor);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  
  const handleNotificationClick = (event) => setNotificationAnchor(event.currentTarget);
  const handleNotificationClose = () => setNotificationAnchor(null);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/logOut`, {
        method: 'POST',
        credentials: 'include',
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleClose();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Professional Header */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          height: '64px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          zIndex: 1200,
        }}
      >
        <Toolbar sx={{
          minHeight: '64px !important',
          px: { xs: 2, sm: 3 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo Section */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src={logo} 
              alt="SalesTrak PA" 
              style={{ 
                height: '36px',
                objectFit: 'contain'
              }} 
            />
          </Box>

          {/* Right Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notifications */}
            <IconButton 
              onClick={handleNotificationClick}
              sx={{ 
                p: 1.5,
                color: '#64748b',
                '&:hover': { 
                  backgroundColor: '#f8fafc',
                  color: '#334155'
                }
              }}
            >
              <Badge 
                badgeContent={3} 
                color="error" 
                sx={{ 
                  '& .MuiBadge-badge': { 
                    fontSize: '0.75rem',
                    height: '18px',
                    minWidth: '18px',
                    fontWeight: 600
                  } 
                }}
              >
                <Notifications fontSize="small" />
              </Badge>
            </IconButton>

            {/* User Avatar */}
            <IconButton 
              onClick={handleMenu} 
              sx={{ 
                p: 0.5,
                ml: 1,
                '&:hover': { 
                  backgroundColor: 'transparent'
                }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  bgcolor: '#3b82f6',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                  }
                }}
              >
                U
              </Avatar>
            </IconButton>

            {/* Notifications Menu */}
            <Menu
              anchorEl={notificationAnchor}
              open={notificationOpen}
              onClose={handleNotificationClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 320,
                  maxWidth: 360,
                  borderRadius: 2,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  border: '1px solid #e2e8f0'
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  Notifications
                </Typography>
              </Box>
              <MenuItem sx={{ px: 2, py: 1.5 }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  New order received
                </Typography>
              </MenuItem>
              <MenuItem sx={{ px: 2, py: 1.5 }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Customer inquiry pending
                </Typography>
              </MenuItem>
              <MenuItem sx={{ px: 2, py: 1.5 }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Weekly report ready
                </Typography>
              </MenuItem>
            </Menu>

            {/* User Menu */}
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  border: '1px solid #e2e8f0'
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  John Doe
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  john.doe@company.com
                </Typography>
              </Box>
              
              <MenuItem 
                onClick={handleClose}
                sx={{ 
                  px: 2, 
                  py: 1.5,
                  '&:hover': { backgroundColor: '#f8fafc' }
                }}
              >
                <Person sx={{ fontSize: 18, mr: 1.5, color: '#64748b' }} />
                <Typography variant="body2" sx={{ color: '#374151' }}>
                  Profile
                </Typography>
              </MenuItem>
              
              <MenuItem 
                onClick={handleClose}
                sx={{ 
                  px: 2, 
                  py: 1.5,
                  '&:hover': { backgroundColor: '#f8fafc' }
                }}
              >
                <Settings sx={{ fontSize: 18, mr: 1.5, color: '#64748b' }} />
                <Typography variant="body2" sx={{ color: '#374151' }}>
                  Settings
                </Typography>
              </MenuItem>
              
              <Divider sx={{ my: 0.5 }} />
              
              <MenuItem 
                onClick={handleLogout}
                sx={{ 
                  px: 2, 
                  py: 1.5,
                  '&:hover': { backgroundColor: '#fef2f2' }
                }}
              >
                <Logout sx={{ fontSize: 18, mr: 1.5, color: '#ef4444' }} />
                <Typography variant="body2" sx={{ color: '#dc2626' }}>
                  Sign Out
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Box 
        component="main" 
        sx={{
          flex: 1,
          pt: '64px',
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: '#f8fafc',
          position: 'relative'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Header;