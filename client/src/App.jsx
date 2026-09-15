import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layouts/Layout";
import Dashboard from "./features/dashboard/pages/Dashboard";
import Farm from "./features/farm/pages/Farm";
import FarmDashboard from "./features/farm/pages/FarmDashboard";
import AnimalsHerd from "./features/farm/pages/AnimalsHerd";
import AnimalDetailPage from "./features/farm/pages/AnimalDetailPage";
import MilkingRegister from "./features/farm/pages/MilkingRegister";
import DahiProcessing from "./features/farm/pages/DahiProcessing";
import FarmExpenses from "./features/farm/pages/FarmExpenses";
import ExpenseLayout from "./features/farm/pages/ExpenseLayout";
import RecordFarmExpensePage from "./features/farm/pages/RecordFarmExpensePage";
import ExpenseDetailPage from "./features/farm/pages/ExpenseDetailPage";
import FarmPL from "./features/farm/pages/FarmPL";
import DailySheet from "./features/farm/pages/DailySheet";
import Supplier from "./features/suppliers/pages/Supplier";
import CustomerManagement from "./features/customers/pages/CustomerManagement";
import CustomerKhataLedger from "./features/customers/pages/CustomerKhataLedger";
import CustomerFinance from "./features/finance/pages/CustomerFinance";
import RiderDeliveryFinancePage from "./features/finance/pages/RiderDeliveryFinancePage";
import Proccessing from "./features/inventory/pages/Processing";
import Pos from "./features/pos/pages/Pos";
import Delivery from "./features/deliveries/pages/Delivery";
import Products from "./features/inventory/pages/Products";
import { LoginPage } from "./features/auth";
import { CustomerProvider } from "./context/CustomerContext";
import { LedgerProvider } from "./context/LedgerContext";
import { AnimalProvider } from "./context/AnimalContext";
import { ExpenseProvider } from "./context/ExpenseContext";
import { POSProvider } from "./context/POSContext";
import { DeliveryProvider } from "./context/DeliveryContext";
import { DeliveryStaffProvider } from "./context/DeliveryStaffContext";
import { FuelLogProvider } from "./context/FuelLogContext";
import { RiderSalaryProvider } from "./context/RiderSalaryContext";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <CustomerProvider>
      <LedgerProvider>
        <AnimalProvider>
          <ExpenseProvider>
            <POSProvider>
              <DeliveryStaffProvider>
                <FuelLogProvider>
                  <RiderSalaryProvider>
                    <DeliveryProvider>
                      <BrowserRouter>
                        <Routes>
                          <Route
                            path="/login"
                            element={
                              <LoginPage
                                onLogin={(email, password) => {
                                  console.log("Logging in user:", email);
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
                              <Route path="animals/detail/:id" element={<AnimalDetailPage />} />
                              <Route path="milking" element={<MilkingRegister />} />
                              <Route path="processing" element={<DahiProcessing />} />
                              <Route path="expenses" element={<ExpenseLayout />}>
                                <Route index element={<FarmExpenses />} />
                                <Route path="new" element={<RecordFarmExpensePage />} />
                                <Route path="edit/:id" element={<RecordFarmExpensePage />} />
                                <Route path="detail/:id" element={<ExpenseDetailPage />} />
                              </Route>
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
                            <Route
                              path="customer-khata-ledger"
                              element={<CustomerKhataLedger />}
                            />

                            {/* Finance Routes */}
                            <Route path="finance/customer" element={<CustomerFinance />} />
                            <Route path="finance/delivery" element={<RiderDeliveryFinancePage />} />

                            {/* Catch-all redirect */}
                            <Route
                              path="*"
                              element={<Navigate to="/dashboard" replace />}
                            />
                          </Route>
                        </Routes>
                      </BrowserRouter>
                    </DeliveryProvider>
                  </RiderSalaryProvider>
                </FuelLogProvider>
              </DeliveryStaffProvider>
            </POSProvider>
          </ExpenseProvider>
        </AnimalProvider>
      </LedgerProvider>
    </CustomerProvider>
  );
}
