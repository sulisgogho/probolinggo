import React from 'react';
import ReactDOM from 'react-dom/client';
import { ToastProvider, setBrandTheme, setThemeMode } from '@idds/react';
import './index.css';
import App from './App';

// Inisialisasi tema resmi INA Digital Design System (IDDS)
setBrandTheme('inagov');
setThemeMode('light');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider maxToasts={4}>
      <App />
    </ToastProvider>
  </React.StrictMode>
);

