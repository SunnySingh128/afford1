import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PriorityInbox from './pages/PriorityInbox';
import Navbar from './components/Navbar';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4F46E5', // Premium Indigo
      light: '#818CF8',
      dark: '#3730A3',
    },
    secondary: {
      main: '#EC4899', // Vibrant Pink
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 600,
    }
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { 
          textTransform: 'none', 
          fontWeight: 600,
          padding: '8px 24px',
        },
        contained: {
          boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(79, 70, 229, 0.23)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease-in-out',
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { 
          borderRadius: 20, 
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        }
      }
    }
  },
});

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Navbar /><Dashboard /></PrivateRoute>} />
          <Route path="/priority" element={<PrivateRoute><Navbar /><PriorityInbox /></PrivateRoute>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
