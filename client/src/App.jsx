import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layouts/Layout';
import Dashboard from './features/dashboard/pages/Dashboard';
import Farm from './features/farm/pages/Farm';
import Supplier from './features/suppliers/pages/Supplier';
import CustomerManagement from './features/customers/pages/CustomerManagement';
import CustomerKhataLedger from './features/customers/pages/CustomerKhataLedger';
import CollectionPayment from './features/customers/pages/CollectionPayment';
import ReceivablesAging from './features/customers/pages/ReceivablesAging';
import { LoginPage } from './features/auth';
import { CustomerProvider } from './context/CustomerContext';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <CustomerProvider>
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
            <Route index element={<Navigate to="/customer" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="farm" element={<Farm />} />
            <Route path="supplier" element={<Supplier />} />

            {/* Accounts & Khata Ledger Routes */}
            <Route path="customer" element={<CustomerManagement />} />
            <Route path="customer-khata-ledger" element={<CustomerKhataLedger />} />
            <Route path="collection-payment" element={<CollectionPayment />} />
            <Route path="receivables" element={<ReceivablesAging />} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/customer" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CustomerProvider>
  );
}
