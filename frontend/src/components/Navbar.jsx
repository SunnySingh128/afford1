import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Notifications as NotificationsIcon } from '@mui/icons-material';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <AppBar position="static" color="inherit" elevation={1}>
      <Toolbar>
        <NotificationsIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          AffordMed Notifications
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
          <Button 
            variant={location.pathname === '/' ? 'contained' : 'text'} 
            onClick={() => navigate('/')}
            disableElevation
          >
            All Notifications
          </Button>
          <Button 
            variant={location.pathname === '/priority' ? 'contained' : 'text'} 
            onClick={() => navigate('/priority')}
            color="secondary"
            disableElevation
          >
            Priority Inbox
          </Button>
        </Box>
        <Button color="error" onClick={handleLogout}>Logout</Button>
      </Toolbar>
    </AppBar>
  );
}
