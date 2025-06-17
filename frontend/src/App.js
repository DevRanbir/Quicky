import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, GlobalStyles } from '@mui/material';
import Navbar from './components/Navbar';
import UploadPage from './pages/UploadPage';
import SavedFilesPage from './pages/SavedFilesPage';
import QuestionsPage from './pages/QuestionsPage';
import HomePage from './pages/HomePage';

// Create a minimalistic red-carrot dark theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF6B35', // Vibrant carrot orange
      light: '#FF8A65',
      dark: '#E64A19',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF3D00', // Deep red-orange
      light: '#FF6E40',
      dark: '#DD2C00',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#1A1A1A', // Deep charcoal
      paper: '#2D2D2D', // Lighter charcoal for cards/surfaces
    },
    surface: {
      main: '#363636', // Medium grey for elevated surfaces
    },
    text: {
      primary: '#FFFFFF', // Pure white for primary text
      secondary: '#B0B0B0', // Light grey for secondary text
      disabled: '#707070',
    },
    divider: '#404040', // Subtle divider color
    action: {
      hover: 'rgba(255, 107, 53, 0.08)', // Subtle carrot hover
      selected: 'rgba(255, 107, 53, 0.12)',
      disabled: 'rgba(255, 255, 255, 0.26)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
    warning: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    error: {
      main: '#F44336',
      light: '#EF5350',
      dark: '#D32F2F',
    },
    info: {
      main: '#FF6B35', // Using carrot color for info as well
      light: '#FF8A65',
      dark: '#E64A19',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.2,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
      letterSpacing: '0em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.3,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      letterSpacing: '0em',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.125rem',
      lineHeight: 1.4,
      letterSpacing: '0.0075em',
    },
    subtitle1: {
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.00714em',
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.6,
      letterSpacing: '0.01071em',
    },
    button: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      textTransform: 'none', // More modern look
    },
  },
  shape: {
    borderRadius: 12, // Rounded corners for modern look
  },
  components: {
    // Global component overrides for minimalistic look
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(255, 107, 53, 0.25)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(255, 107, 53, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          border: '1px solid #404040',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none', // Remove default gradient
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          borderBottom: '1px solid #404040',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#FF6B35',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
  spacing: 8, // Base spacing unit
});

const scrollbarStyles = (
  <GlobalStyles
    styles={{
      '*::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '*::-webkit-scrollbar-track': {
        background: '#363636',
        borderRadius: '4px',
      },
      '*::-webkit-scrollbar-thumb': {
        background: '#FF6B35',
        borderRadius: '4px',
      },
      '*::-webkit-scrollbar-thumb:hover': {
        background: '#E64A19',
      },
      '*::-webkit-scrollbar-corner': {
        background: 'transparent',
      },
      // For Firefox
      '*': {
        scrollbarWidth: 'thin',
        scrollbarColor: '#FF6B35 #363636',
      },
    }}
  />
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normalize CSS and apply dark background */}
      <Router >
        <Navbar />
        {scrollbarStyles}
        <div style={{ 
          paddingTop: '80px', 
          paddingLeft: '24px', 
          paddingRight: '24px',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)', // Subtle gradient
        }}>
          <Routes>
            {/* Home page as default route */}
          <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/saved-files" element={<SavedFilesPage />} />
            <Route path="/questions/:sourceId" element={<QuestionsPage />} /> 
            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;