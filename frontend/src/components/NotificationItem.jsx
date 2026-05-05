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

  const getTypeStyles = (type) => {
    switch (type) {
      case 'Placement': return { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' };
      case 'Result': return { bg: '#FFFBEB', color: '#92400E', border: '#FDE68A' };
      case 'Event': return { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' };
      default: return { bg: '#F8FAFC', color: '#475569', border: '#E2E8F0' };
    }
  };

  const typeStyle = getTypeStyles(notification.type);

  return (
    <Card 
      elevation={0}
      sx={{ 
        mb: 2, 
        bgcolor: isNew ? 'background.paper' : '#FAFAFA',
        border: '1px solid',
        borderColor: isNew ? 'primary.light' : 'divider',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0 12px 24px -10px rgba(0,0,0,0.1)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      {isNew && (
        <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(to bottom, #4F46E5, #EC4899)' }} />
      )}
      <CardContent sx={{ display: 'flex', alignItems: 'flex-start', pb: '16px !important', pl: isNew ? 3 : 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
            {isNew && (
              <Chip 
                size="small" 
                label="New" 
                sx={{ 
                  height: 22, 
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #4F46E5, #EC4899)',
                  color: 'white',
                  border: 'none'
                }} 
              />
            )}
            <Chip 
              size="small" 
              icon={typeStyle.icon}
              label={notification.type} 
              sx={{
                bgcolor: typeStyle.bg,
                color: typeStyle.color,
                border: `1px solid ${typeStyle.border}`,
                fontWeight: 600,
                fontSize: '0.75rem',
                '& .MuiChip-icon': { color: typeStyle.color }
              }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, ml: 'auto' }}>
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </Typography>
          </Box>
          <Typography variant="h6" component="h3" sx={{ fontSize: '1.15rem', fontWeight: isNew ? 700 : 600, color: isNew ? 'text.primary' : 'text.secondary', mb: 0.5, letterSpacing: '-0.01em' }}>
            {notification.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            {notification.message}
          </Typography>
        </Box>
        
        <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 1 }}>
          {isNew ? (
            <IconButton 
              color="primary" 
              onClick={() => onMarkAsRead(notification.id)}
              title="Mark as read"
              sx={{ 
                bgcolor: 'primary.50',
                '&:hover': { bgcolor: 'primary.100', transform: 'scale(1.1)' },
                transition: 'all 0.2s'
              }}
            >
              <CheckCircleOutlineIcon />
            </IconButton>
          ) : (
            <CheckCircleIcon sx={{ m: 1, color: '#CBD5E1' }} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
