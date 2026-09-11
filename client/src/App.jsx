import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layouts/Layout';
import Dashboard from './features/dashboard/pages/Dashboard';
import Farm from './features/farm/pages/Farm';
import FarmDashboard from './features/farm/pages/FarmDashboard';
import AnimalsHerd from './features/farm/pages/AnimalsHerd';
import MilkingRegister from './features/farm/pages/MilkingRegister';
import DahiProcessing from './features/farm/pages/DahiProcessing';
import FarmExpenses from './features/farm/pages/FarmExpenses';
import FarmPL from './features/farm/pages/FarmPL';
import DailySheet from './features/farm/pages/DailySheet';
import Supplier from './features/suppliers/pages/Supplier';
import CustomerManagement from './features/customers/pages/CustomerManagement';
import CustomerKhataLedger from './features/customers/pages/CustomerKhataLedger';
import CollectionPayment from './features/customers/pages/CollectionPayment';
import ReceivablesAging from './features/customers/pages/ReceivablesAging';
import Proccessing from './features/inventory/pages/Processing';
import Pos from './features/pos/pages/Pos';
import Delivery from './features/deliveries/pages/Delivery';
import Products from './features/inventory/pages/Products';
import { LoginPage } from './features/auth';
import { CustomerProvider } from './context/CustomerContext';
import { LedgerProvider } from './context/LedgerContext';
import { AnimalProvider } from './context/AnimalContext';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <CustomerProvider>
      <LedgerProvider>
        <AnimalProvider>
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
                
                {/* Farm Routes */}
                <Route path="farm" element={<Farm />}>
                  <Route index element={<FarmDashboard />} />
                  <Route path="animals" element={<AnimalsHerd />} />
                  <Route path="milking" element={<MilkingRegister />} />
                  <Route path="processing" element={<DahiProcessing />} />
                  <Route path="expenses" element={<FarmExpenses />} />
                  <Route path="pl" element={<FarmPL />} />
                  <Route path="dailysheet" element={<DailySheet />} />
                </Route>

                <Route path="supplier" element={<Supplier />} />
                <Route path="proccessing" element={<Proccessing />} />
                <Route path="pos" element={<Pos />} />
                <Route path="delivery" element={<Delivery />} />
                <Route path="products" element={<Products />} />

                {/* Accounts & Khata Ledger Routes */}
                <Route path="customer" element={<CustomerManagement />} />
                <Route path="customer-khata-ledger" element={<CustomerKhataLedger />} />
                <Route path="collection-payment" element={<CollectionPayment />} />
                <Route path="receivables" element={<ReceivablesAging />} />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AnimalProvider>
      </LedgerProvider>
    </CustomerProvider>
  );
}

