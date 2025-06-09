import React, { useState, useRef } from 'react';
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  Tooltip, Toolbar, Divider, Popper, Paper, ClickAwayListener,
  Box, Collapse, Avatar, Typography, Menu, MenuItem
} from '@mui/material';
import {
  Home as HomeIcon, Info as InfoIcon, ContactMail as ContactIcon,
  Settings as SettingsIcon, Category as CategoryIcon, Layers as LayersIcon,
  ExpandLess, ExpandMore, Assessment as ReportIcon, PeopleAlt as CustomerIcon
} from '@mui/icons-material';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button
} from '@mui/material';
import logo from './assets/salestrakpa-logo.png'

import { Link  ,useNavigate } from 'react-router-dom';

const drawerWidth = 240;
const collapsedWidth = 60;

const Navbar = ({ open }) => {
  const [openSubmenu, setOpenSubmenu] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [reportMenu, setReportMenu] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
 
  const navigate = useNavigate(); 

  const masterRef = useRef(null);
  const reportRef = useRef(null);

  const handleHoverEnter = (menu) => {
    if (!open) setHoveredMenu(menu);
  };

  const handleHoverLeave = () => {
    if (!open) setHoveredMenu(null);
  };

  const handleClickAway = () => setHoveredMenu(null);

  const handleUserMenuOpen = (event) => setUserMenuAnchor(event.currentTarget);
  const handleUserMenuClose = () => setUserMenuAnchor(null);

  const handleLogoutClick = () => {
    setOpenLogoutDialog(true);
    handleUserMenuClose(); // Close the user menu when opening dialog
  };
  
  const handleLogoutConfirm = async () => {
    setOpenLogoutDialog(false); // Close the dialog
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/logOut`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        navigate('/', { state: { logoutSuccess: true } });
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  
  const handleLogoutCancel = () => {
    setOpenLogoutDialog(false);
  };

  

  const navItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    // { text: 'About', icon: <InfoIcon />, path: '/about' },
    // { text: 'Contact', icon: <ContactIcon />, path: '/contact' },
  ];

//   const submenuItems = [
//     { text: 'Customer Type', path: '/custype', icon: <LayersIcon /> },
//     { text: 'Product', path: '/product', icon: <CategoryIcon /> },
//   ];

//   const reportItems = [
//     { text: 'Report 1', path: '/report1' },
//     { text: 'Report 2', path: '/report2' },
//   ];
  const customer = { text: 'Customer', icon: <CustomerIcon />, path: '/customer' };
  const customerLogItem = { text: 'Customer Log', icon: <CustomerIcon />, path: '/customer-log' };
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : collapsedWidth,
          backgroundColor: '#1e1e2f',
          color: '#fff',
          transition: 'width 0.3s',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        },
      }}
    >
      <Box>
        {/* <Box display="flex" justifyContent="center" alignItems="center" py={2}>
        <img src={logo} alt="Company Logo" style={{ maxWidth: '80%' }} />
        </Box> */}
        <Toolbar />

        <Divider />
        <List>
          {navItems.map((item, index) => (
            <Tooltip title={!open ? item.text : ''} placement="right" key={index}>
              <ListItem button component={Link} to={item.path} sx={{ py: open ? 0.6 : 1.2 }}>
                <ListItemIcon sx={{ color: '#fff', minWidth: 0, mr: open ? 2 : 'auto' }}>
                  {item.icon}
                </ListItemIcon>
                {open && <ListItemText primary={item.text} sx={{ lineHeight: 1.2, color: '#fff' }} />}
              </ListItem>
            </Tooltip>
          ))}
        </List>

        {/* Master Section */}
        <Box
          ref={masterRef}
          onMouseEnter={() => handleHoverEnter('master')}
          onMouseLeave={handleHoverLeave}
        >
          <ListItem button onClick={() => open && setOpenSubmenu(!openSubmenu)}>
            <ListItemIcon sx={{ color: '#fff', minWidth: 0, mr: open ? 2 : 'auto' }}>
              <SettingsIcon />
            </ListItemIcon>
            {open && (
              <>
                <ListItemText primary="Master" sx={{ color: '#fff', lineHeight: 1.2 }} />
                {openSubmenu ? <ExpandLess /> : <ExpandMore />}
              </>
            )}
          </ListItem>
          {/* <Collapse in={open && openSubmenu}>
            <List component="div" disablePadding>
              {submenuItems.map((sub, idx) => (
                <ListItem key={idx} button component={Link} to={sub.path} sx={{ pl: 4 }}>
                  <ListItemText primary={sub.text} sx={{ color: '#fff' }} />
                </ListItem>
              ))}
            </List>
          </Collapse> */}
        </Box>

        {/* Report Section */}
        <Box
          ref={reportRef}
          onMouseEnter={() => handleHoverEnter('report')}
          onMouseLeave={handleHoverLeave}
        >
          <ListItem button onClick={() => open && setReportMenu(!reportMenu)}>
            <ListItemIcon sx={{ color: '#fff', minWidth: 0, mr: open ? 2 : 'auto' }}>
              <ReportIcon />
            </ListItemIcon>
            {open && (
              <>
                <ListItemText primary="Report" sx={{ color: '#fff', lineHeight: 1.2 }} />
                {reportMenu ? <ExpandLess /> : <ExpandMore />}
              </>
            )}
          </ListItem>
          {/* <Collapse in={open && reportMenu}>
            <List component="div" disablePadding>
              {reportItems.map((rep, idx) => (
                <ListItem key={idx} button component={Link} to={rep.path} sx={{ pl: 4 }}>
                  <ListItemText primary={rep.text} sx={{ color: '#fff' }} />
                </ListItem>
              ))}
            </List>
          </Collapse> */}
        </Box>

        {/* Hover Popups */}
        {/* <Popper open={hoveredMenu === 'master' && !open} anchorEl={masterRef.current} placement="right-start">
          <ClickAwayListener onClickAway={handleClickAway}>
            <Paper onMouseEnter={() => handleHoverEnter('master')} onMouseLeave={handleHoverLeave}>
              <List dense>
                {submenuItems.map((sub, idx) => (
                  <ListItem key={idx} button component={Link} to={sub.path}>
                    <ListItemText primary={sub.text} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </ClickAwayListener>
        </Popper>

        <Popper open={hoveredMenu === 'report' && !open} anchorEl={reportRef.current} placement="right-start">
          <ClickAwayListener onClickAway={handleClickAway}>
            <Paper onMouseEnter={() => handleHoverEnter('report')} onMouseLeave={handleHoverLeave}>
              <List dense>
                {reportItems.map((rep, idx) => (
                  <ListItem key={idx} button component={Link} to={rep.path}>
                    <ListItemText primary={rep.text} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </ClickAwayListener>
        </Popper> */}

        {/* Customer*/}
        {/* <List>
          <Tooltip title={!open ? customer.text : ''} placement="right">
            <ListItem button component={Link} to={customer.path} sx={{ py: open ? 0.6 : 1.2 }}>
              <ListItemIcon sx={{ color: '#fff', minWidth: 0, mr: open ? 2 : 'auto' }}>
                {customer.icon}
              </ListItemIcon>
              {open && <ListItemText primary={customer.text} sx={{ color: '#fff', lineHeight: 1.2 }} />}
            </ListItem>
          </Tooltip>
        </List> */}

        {/* Customer Log */}
        {/* <List>
          <Tooltip title={!open ? customerLogItem.text : ''} placement="right">
            <ListItem button component={Link} to={customerLogItem.path} sx={{ py: open ? 0.6 : 1.2 }}>
              <ListItemIcon sx={{ color: '#fff', minWidth: 0, mr: open ? 2 : 'auto' }}>
                {customerLogItem.icon}
              </ListItemIcon>
              {open && <ListItemText primary={customerLogItem.text} sx={{ color: '#fff', lineHeight: 1.2 }} />}
            </ListItem>
          </Tooltip>
        </List> */}
      </Box>

      {/* User Profile */}
      <Box sx={{ p: 2, borderTop: '1px solid #333' }}>
        <Box display="flex" alignItems="center" gap={1} onClick={handleUserMenuOpen} sx={{ cursor: 'pointer' }}>
          <Avatar sx={{ width: 32, height: 32 }}>U</Avatar>
          {open && (
            <Box>
              <Typography variant="body2" sx={{ color: '#fff' }}>John Doe</Typography>
              <Typography variant="caption" sx={{ color: '#ccc' }}>john@example.com</Typography>
            </Box>
          )}
        </Box>
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
        >
          <MenuItem onClick={() => alert("Change Password clicked")}>Change Password</MenuItem>
          <MenuItem onClick={handleLogoutClick}>Sign Out</MenuItem>
        </Menu>
      </Box>
      {/* Logout Confirmation Dialog */}
        <Dialog
          open={openLogoutDialog}
          onClose={handleLogoutCancel}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Confirm Logout</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to log out?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleLogoutCancel}>Cancel</Button>
            <Button onClick={handleLogoutConfirm} color="primary" autoFocus>
              Logout
            </Button>
          </DialogActions>
        </Dialog>
    </Drawer>
  );
};

export default Navbar;
