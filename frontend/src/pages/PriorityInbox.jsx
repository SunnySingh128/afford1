import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, CircularProgress, Alert, Paper } from '@mui/material';
import axios from 'axios';
import NotificationItem from '../components/NotificationItem';

export default function PriorityInbox() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPriorityNotifications();
  }, []);

  const fetchPriorityNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Fetching top 10 priority notifications
      const res = await axios.get('http://localhost:5000/api/priority-notifications?n=10', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(res.data.data.notifications);
      setError('');
    } catch (err) {
      setError('Failed to load priority notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Remove from priority inbox immediately once read
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Priority Inbox
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Displaying your top 10 most important unread notifications.
          (Weight: Placement &gt; Result &gt; Event).
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
          <CircularProgress />
        </Box>
      ) : notifications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fdf8' }} variant="outlined">
          <Typography variant="h6" color="success.main">You're all caught up!</Typography>
          <Typography variant="body2" color="text.secondary">No unread priority notifications.</Typography>
        </Paper>
      ) : (
        <Box>
          {notifications.map((notification, index) => (
            <Box key={notification.id} sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  width: 30, 
                  textAlign: 'center', 
                  mr: 2, 
                  color: index < 3 ? 'primary.main' : 'text.disabled',
                  fontWeight: 'bold'
                }}
              >
                #{index + 1}
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <NotificationItem 
                  notification={notification} 
                  onMarkAsRead={handleMarkAsRead}
                />
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
}
