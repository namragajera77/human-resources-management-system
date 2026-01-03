import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';

export const ProtectedRoute = ({ children, requireAdmin, requireAdminOrHR }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          gap: 3
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': {
                transform: 'scale(1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              },
              '50%': {
                transform: 'scale(1.05)',
                boxShadow: '0 12px 48px rgba(0,0,0,0.15)'
              }
            }
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#714B67', 
              fontWeight: 700,
              fontSize: '36px'
            }}
          >
            D
          </Typography>
        </Box>
        <CircularProgress 
          size={50}
          thickness={4}
          sx={{ 
            color: '#ffffff',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round'
            }
          }} 
        />
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#ffffff', 
            fontWeight: 500,
            fontSize: '18px',
            letterSpacing: '0.5px',
            opacity: 0.95
          }}
        >
          Loading Dayflow...
        </Typography>
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && user.role !== 'Admin') {
    return <Navigate to="/dashboard" />;
  }

  if (requireAdminOrHR && user.role !== 'Admin' && user.role !== 'HR') {
    return <Navigate to="/dashboard" />;
  }

  // Check if first login and redirect to change password
  if (user.isFirstLogin && window.location.pathname !== '/change-password') {
    return <Navigate to="/change-password" />;
  }

  return children;
};
