import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  useScrollTrigger,
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { ReactComponent as LogoIcon } from './icon.svg'; 

const Navbar = () => {
  const location = useLocation();
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  const isActiveRoute = (path) => {
    return location.pathname === path;
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
        component={RouterLink}
        to="/"
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
        <LogoIcon style={{ height: 28, width: 28 , color: '#FF6B35' }} />
      </IconButton>

      <Typography 
        variant="h5" 
        component="div" 
        sx={{ 
          flexGrow: 1,
          fontWeight: 600,
          background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%)',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Quicky Quizy{' '}
        <Box component="span" sx={{ fontSize: '0.65em', fontWeight: 400 , py: 0.5}}>
          by DevRanbir
        </Box>
      </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
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
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;