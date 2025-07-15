import React, { use, useEffect, useState } from 'react';
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
  useMediaQuery,List,ListItem,ListItemAvatar,ListItemText,Chip
} from '@mui/material';
import { 
  Logout, 
  Notifications, 
  Person,
  Settings 
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import logo from './assets/salestrakpa-logo.png';

const Header = ({ children }) => {
  const [user, setUser] = useState(null);
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

  const [expiredReminders, setExpiredReminders] = useState([]);

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

useEffect(() => {
  const fetchUserData = async () => {
    try {
      const userRes = await fetch(`${process.env.REACT_APP_API_URL}/me`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!userRes.ok) throw new Error('Failed to fetch user data');
      const userData = await userRes.json();
      setUser(userData.user);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchReminders = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/getAllremainderDate`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      const today = new Date();
      const expired = data.filter((item) => new Date(item.reminder_date) < today);
      setExpiredReminders(expired);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  fetchUserData();
  fetchReminders();
}, []);

const getDaysDifference = (date) => {
  const today = new Date();
  const reminderDate = new Date(date);
  const diff = Math.floor((today - reminderDate) / (1000 * 60 * 60 * 24));
  return diff;
};

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-GB', { month: 'short' }); // e.g., "Jun"
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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
            <Link to="/home" style={{ textDecoration: 'none' }}>
            <img 
              src={logo} 
              alt="SalesTrak PA" 
              style={{ 
                height: '55px',
                objectFit: 'contain',
                cursor: 'pointer'
              }} 
            />
            </Link>
          </Box>

          {/* Right Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

             {user && (
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold',color: 'primary.main'}}>
                Welcome, {user.name}
              </Typography>
            )}


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
                badgeContent={expiredReminders.length}
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
      minWidth: 360,
      maxWidth: 400,
      borderRadius: 2,
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      border: '1px solid #e2e8f0',
      maxHeight: 450,
      overflowY: 'auto',
    },
  }}
  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
>
  <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e2e8f0' }}>
    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>
      EXPIRED REMINDERS
    </Typography>
  </Box>

  {expiredReminders.length > 0 ? (
    <>
      <List disablePadding >
        {expiredReminders.map((reminder) => (
          <ListItem
            key={reminder.id}
            divider
            alignItems="flex-start"
            sx={{ py: 1, px: 2, cursor: 'pointer' }}
            onClick={() => {
              const encodedHeaderId = btoa(reminder.header_id);
              const encodedItemId = btoa(reminder.item_id);
              navigate(`/newitem/${encodedHeaderId}/${encodedItemId}`);
              handleNotificationClose();
            }}
          >
            <ListItemAvatar sx={{ minWidth: 40 }}>
              <Avatar
                sx={{
                  bgcolor: 'error.light',
                  width: 32,
                  height: 32,
                }}
              >
                <Typography
                  variant="caption"
                  fontSize="0.75rem"
                  color="text.primary"
                >
                  {Math.abs(getDaysDifference(reminder.reminder_date))}
                </Typography>
              </Avatar>
            </ListItemAvatar>

            <ListItemText
              secondary={
                <>
                  <Typography variant="body2" color="text.primary">
                    {formatDate(reminder.reminder_date)} - {reminder.reminder_name}
                  </Typography>
                  <Typography variant="body2" color="text.primary">
                    {reminder.item_title?.toUpperCase()} - {reminder.header_name}
                  </Typography>
                </>
              }
              primaryTypographyProps={{
                fontWeight: 'medium',
                fontSize: '0.875rem',
              }}
              secondaryTypographyProps={{
                variant: 'body2',
                fontSize: '0.75rem',
              }}
            />
          </ListItem>
        ))}
      </List>
    </>
  ) : (
    <MenuItem sx={{ px: 2, py: 1.2 }}>
      <Typography variant="body2" sx={{ color: '#64748b' }}>
        No expired reminders
      </Typography>
    </MenuItem>
  )}
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