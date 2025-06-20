import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  useScrollTrigger,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
} from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

import { Link as RouterLink, useLocation } from 'react-router-dom';
import { ReactComponent as LogoIcon } from './icon.svg';
import axios from 'axios';
import { CloudDone as CloudDoneIcon, CloudOff as CloudOffIcon } from '@mui/icons-material';

const Navbar = () => {
  const location = useLocation();
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Add state for backend status
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online', 'offline', 'checking'
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [showDevRanbir, setShowDevRanbir] = useState(false); // State for "by DevRanbir" animation
  const [anchorEl, setAnchorEl] = useState(null); // State for dropdown anchor element
  const open = Boolean(anchorEl);

  const toggleSound = () => {
    setSoundOn((prev) => {
      const newState = !prev;

      const mediaElements = document.querySelectorAll('audio, video');
      mediaElements.forEach((el) => {
        el.muted = !newState;
      });

      return newState;
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const renderSoundToggleButton = () => (
    <Tooltip title={soundOn ? 'Mute Website' : 'Unmute Website'}>
      <Button onClick={toggleSound} sx={commonButtonSx}>
        {soundOn ? <VolumeUpIcon /> : <VolumeOffIcon />}
      </Button>
    </Tooltip>
  );

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const commonButtonSx = {
    minWidth: '40px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    p: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.7)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
  };

  const renderFullscreenToggleButton = () => (
    <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
      <Button onClick={toggleFullscreen} sx={commonButtonSx}>
        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
      </Button>
    </Tooltip>
  );

  const renderThemeToggleButton = () => (
    <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
      <Button onClick={toggleTheme} sx={commonButtonSx}>
        {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
      </Button>
    </Tooltip>
  );

  const checkBackendStatus = async () => {
    setBackendStatus('checking');
    try {
      const response = await axios.get('/wakeUP/test/', { timeout: 5000 });
      if (response.status === 200) {
        setBackendStatus('online');
        return true;
      } else {
        setBackendStatus('offline');
        return false;
      }
    } catch (error) {
      console.error('Backend connection error:', error);
      setBackendStatus('offline');
      return false;
    }
  };

  const wakeUpBackend = async () => {
    setIsWakingUp(true);
    setSnackbarMessage('Attempting to wake up the backend...');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);

    try {
      const response = await axios.get('/wakeUP/test/', { timeout: 15000 });
      if (response.status === 200) {
        setSnackbarMessage('Backend is now online!');
        setSnackbarSeverity('success');
        setBackendStatus('online');
      } else {
        setSnackbarMessage('Failed to wake up the backend. Please try again.');
        setSnackbarSeverity('error');
      }
    } catch (error) {
      console.error('Wake up error:', error);
      setSnackbarMessage('Failed to wake up the backend. The server might be in sleep mode.');
      setSnackbarSeverity('error');
    } finally {
      setIsWakingUp(false);
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    checkBackendStatus();

    const intervalId = setInterval(() => {
      checkBackendStatus();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleQuickyQuizyClick = () => {
    if (isMobile) {
      setShowDevRanbir(true);
      const timer = setTimeout(() => {
        setShowDevRanbir(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  };

  // Dropdown menu handlers
  const handleMenuClick = (event) => {
    if (isMobile) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = () => {
    handleMenuClose(); // Close menu after click
  };

  const renderBackendStatusButton = () => {
    if (backendStatus === 'checking') {
      return (
        <Tooltip title="Checking backend connection...">
          <Button
            sx={{
              minWidth: '40px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              p: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
            disabled
          >
            <CircularProgress size={24} color="inherit" />
          </Button>
        </Tooltip>
      );
    } else if (backendStatus === 'online') {
      return (
        <Tooltip title="Backend is connected">
          <Button
            sx={{
              minWidth: '40px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              p: 0,
              backgroundColor: 'rgba(46, 125, 50, 0.2)',
              color: '#4caf50',
              '&:hover': {
                backgroundColor: 'rgba(46, 125, 50, 0.3)',
              },
            }}
            onClick={checkBackendStatus}
          >
            <CloudDoneIcon />
          </Button>
        </Tooltip>
      );
    } else {
      return (
        <Tooltip title="Backend is offline. Click to wake up">
          <Button
            sx={{
              minWidth: '40px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              p: 0,
              backgroundColor: 'rgba(211, 47, 47, 0.2)',
              color: '#f44336',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.3)',
              },
            }}
            onClick={wakeUpBackend}
            disabled={isWakingUp}
          >
            {isWakingUp ? <CircularProgress size={24} color="inherit" /> : <CloudOffIcon />}
          </Button>
        </Tooltip>
      );
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: trigger ? 'rgba(26, 26, 26, 0.95)' : 'rgba(26, 26, 26, 0.9)',
        backdropFilter: 'blur(20px)',
        transition: 'all 0.3s ease-in-out',
        borderBottom: '1px solid rgba(64, 64, 64, 0.3)',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="logo"
          // Conditionally apply component and to props based on isMobile
          {...(!isMobile && { component: RouterLink, to: "/" })}
          onClick={isMobile ? handleMenuClick : null} // Only use onClick for menu on mobile
          sx={{
            mr: 0.5,
            p: 1.5,
            borderRadius: 2,
            transition: 'all 0.2s ease-in-out',
            color: '#FF6B35',
            '&:hover': {
              backgroundColor: 'rgba(255, 107, 53, 0.1)',
              transform: 'scale(1.05)',
            }
          }}
        >
          <LogoIcon style={{ height: 28, width: 28, color: '#FF6B35' }} />
        </IconButton>

        {/* Dropdown Menu for Mobile */}
        {isMobile && (
          <Menu
            id="mobile-nav-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            MenuListProps={{
              'aria-labelledby': 'mobile-logo-button',
            }}
            sx={{
              '& .MuiPaper-root': {
                backgroundColor: 'rgba(26, 26, 26, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(64, 64, 64, 0.3)',
                mt: 1,
              },
              '& .MuiMenuItem-root': {
                color: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 107, 53, 0.1)',
                  color: '#FF6B35',
                },
              },
            }}
          >
            <MenuItem onClick={handleMenuItemClick} component={RouterLink} to="/">Home</MenuItem>
            <MenuItem onClick={handleMenuItemClick} component={RouterLink} to="/upload">Upload Content</MenuItem>
            <MenuItem onClick={handleMenuItemClick} component={RouterLink} to="/saved-files">Saved Files</MenuItem>
          </Menu>
        )}

        <Typography
          variant="h5"
          component="div"
          onClick={handleQuickyQuizyClick}
          sx={{
            flexGrow: 1,
            fontWeight: 600,
            background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            cursor: isMobile ? 'pointer' : 'default',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          Quicky Quizy{' '}
          <Box
            component="span"
            sx={{
              fontSize: '0.65em',
              fontWeight: 400,
              py: 0.5,
              display: { xs: 'block', sm: 'inline' },
              height: { xs: showDevRanbir ? 'auto' : 0, sm: 'auto' },
              opacity: { xs: showDevRanbir ? 1 : 0, sm: 1 },
              transform: { xs: showDevRanbir ? 'translateY(0)' : 'translateY(100%)', sm: 'translateY(0)' },
              transition: 'height 0.3s ease-in-out, opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
              position: { xs: 'absolute', sm: 'static' },
              left: { xs: '68px', sm: 'auto' },
              top: { xs: '38px', sm: 'auto' },
              width: { xs: 'fit-content', sm: 'auto' },
              visibility: { xs: showDevRanbir ? 'visible' : 'hidden', sm: 'visible' },
            }}
          >
            by DevRanbir
          </Box>
        </Typography>

        <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, alignItems: 'center' }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 500,
              position: 'relative',
              color: isActiveRoute('/') ? '#FF6B35' : 'rgba(255, 255, 255, 0.9)',
              backgroundColor: isActiveRoute('/')
                ? 'rgba(255, 107, 53, 0.1)'
                : 'transparent',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
                color: '#FF6B35',
                transform: 'translateY(-1px)',
              },
              '&::after': isActiveRoute('/') ? {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60%',
                height: '2px',
                backgroundColor: '#FF6B35',
                borderRadius: '1px',
              } : {},
            }}
          >
            Home
          </Button>

          <Button
            color="inherit"
            component={RouterLink}
            to="/upload"
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 500,
              position: 'relative',
              color: isActiveRoute('/upload') ? '#FF6B35' : 'rgba(255, 255, 255, 0.9)',
              backgroundColor: isActiveRoute('/upload')
                ? 'rgba(255, 107, 53, 0.1)'
                : 'transparent',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
                color: '#FF6B35',
                transform: 'translateY(-1px)',
              },
              '&::after': isActiveRoute('/upload') ? {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60%',
                height: '2px',
                backgroundColor: '#FF6B35',
                borderRadius: '1px',
              } : {},
            }}
          >
            Upload Content
          </Button>

          <Button
            color="inherit"
            component={RouterLink}
            to="/saved-files"
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 500,
              position: 'relative',
              color: isActiveRoute('/saved-files') ? '#FF6B35' : 'rgba(255, 255, 255, 0.9)',
              backgroundColor: isActiveRoute('/saved-files')
                ? 'rgba(255, 107, 53, 0.1)'
                : 'transparent',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
                color: '#FF6B35',
                transform: 'translateY(-1px)',
              },
              '&::after': isActiveRoute('/saved-files') ? {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60%',
                height: '2px',
                backgroundColor: '#FF6B35',
                borderRadius: '1px',
              } : {},
            }}
          >
            Saved Files
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {renderFullscreenToggleButton()}
          {renderThemeToggleButton()}
          {renderSoundToggleButton()}
          {renderBackendStatusButton()}
        </Box>
      </Toolbar>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </AppBar>
  );
};

export default Navbar;