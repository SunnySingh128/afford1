import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Pagination, CircularProgress, Alert, ToggleButton, ToggleButtonGroup } from '@mui/material';
import axios from 'axios';
import NotificationItem from '../components/NotificationItem';

export default function Dashboard() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState('All');
  const limit = 10;

  useEffect(() => {
    fetchNotifications();
  }, [page, filterType]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = { page, limit };
      if (filterType !== 'All') {
        params.notification_type = filterType;
      }
      
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      
      setNotifications(res.data.data.notifications);
      setTotalPages(res.data.data.pagination.totalPages);
      setError('');
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError('Failed to load notifications.');
      }
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
      // Optimistic update
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: 1 } : n
      ));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilterType(newFilter);
      setPage(1); // Reset to first page on filter change
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          All Notifications
        </Typography>
        
        <ToggleButtonGroup
          color="primary"
          value={filterType}
          exclusive
          onChange={handleFilterChange}
          size="small"
        >
          <ToggleButton value="All">All</ToggleButton>
          <ToggleButton value="Event">Events</ToggleButton>
          <ToggleButton value="Result">Results</ToggleButton>
          <ToggleButton value="Placement">Placements</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
          <CircularProgress />
        </Box>
      ) : notifications.length === 0 ? (
        <Alert severity="info">No notifications found.</Alert>
      ) : (
        <>
          {notifications.map(notification => (
            <NotificationItem 
              key={notification.id} 
              notification={notification} 
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={(e, value) => setPage(value)} 
              color="primary" 
              size="large"
            />
          </Box>
        </>
      )}
    </Container>
  );
}
