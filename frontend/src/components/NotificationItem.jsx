import React from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton } from '@mui/material';
import { CheckCircleOutline as CheckCircleOutlineIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const getColorForType = (type) => {
  switch (type) {
    case 'Placement': return 'success';
    case 'Result': return 'warning';
    case 'Event': return 'info';
    default: return 'default';
  }
};

export default function NotificationItem({ notification, onMarkAsRead }) {
  const isNew = !notification.is_read;

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        mb: 2, 
        bgcolor: isNew ? '#f0f7ff' : 'background.paper',
        borderColor: isNew ? 'primary.light' : 'divider',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 2,
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'flex-start', pb: '16px !important' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
            {isNew && <Chip size="small" label="New" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />}
            <Chip 
              size="small" 
              label={notification.type} 
              color={getColorForType(notification.type)} 
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </Typography>
          </Box>
          <Typography variant="h6" component="h3" sx={{ fontSize: '1.1rem', fontWeight: isNew ? 600 : 500 }}>
            {notification.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {notification.message}
          </Typography>
        </Box>
        
        <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {isNew ? (
            <IconButton 
              color="primary" 
              onClick={() => onMarkAsRead(notification.id)}
              title="Mark as read"
            >
              <CheckCircleOutlineIcon />
            </IconButton>
          ) : (
            <CheckCircleIcon color="disabled" sx={{ m: 1 }} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
