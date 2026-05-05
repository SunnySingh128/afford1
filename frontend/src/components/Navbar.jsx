import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Badge } from '@mui/material';
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
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        bgcolor: 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
        color: 'text.primary'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Badge 
            color="secondary" 
            variant="dot" 
            sx={{ 
              mr: 1.5,
              '& .MuiBadge-badge': {
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(0.8)', opacity: 0.5 },
                  '50%': { transform: 'scale(1.2)', opacity: 1 },
                  '100%': { transform: 'scale(0.8)', opacity: 0.5 },
                }
              }
            }}
          >
            <NotificationsIcon sx={{ color: 'primary.main', fontSize: 28 }} />
          </Badge>
          <Typography 
            variant="h6" 
            noWrap 
            sx={{ 
              fontWeight: 800, 
              letterSpacing: '-0.5px',
              background: 'linear-gradient(45deg, #4F46E5 30%, #EC4899 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Afford Notifications
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
