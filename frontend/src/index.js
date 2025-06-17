import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios';

const LOCAL_URL = 'http://localhost:8000/api';
const PROD_URL = 'https://quicky-5e4n.onrender.com/api';

async function chooseBaseURL() {
  try {
    const res = await fetch('http://localhost:8000/test/', { method: 'GET', cache: 'no-cache' });
    if (res.ok) {
      axios.defaults.baseURL = LOCAL_URL;
      console.log('✅ Connected to LOCALHOST');
    } else {
      throw new Error('Localhost returned not OK');
    }
  } catch (error) {
    axios.defaults.baseURL = PROD_URL;
    console.log('🌐 Falling back to PRODUCTION');
  }
}

// Wait for baseURL setup before rendering React
chooseBaseURL().then(() => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
