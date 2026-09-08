import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layouts/Layout';
import Dashboard from './features/dashboard/pages/Dashboard';
import Farm from './features/farm/pages/Farm';
import Supplier from './features/suppliers/pages/Supplier';
import { LoginPage } from './features/auth';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <LoginPage
              onLogin={(email, password) => {
                console.log('Logging in user:', email);
                setIsAuthenticated(true);
              }}
            />
          }
        />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="farm" element={<Farm />} />
          <Route path="supplier" element={<Supplier />} />
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


