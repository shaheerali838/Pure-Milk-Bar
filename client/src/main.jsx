import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.jsx'

// Automatically purge legacy/mock data from browser localStorage on boot while preserving active login auth tokens
try {
  const legacyStorageKeys = [
    'pure_milk_bar_animals',
    'pure_milk_bar_suppliers',
    'pure_milk_bar_dummy',
    'pmb_dummy_sales',
    'pmb_mock_products',
  ];
  legacyStorageKeys.forEach((key) => localStorage.removeItem(key));
} catch (_) {}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
