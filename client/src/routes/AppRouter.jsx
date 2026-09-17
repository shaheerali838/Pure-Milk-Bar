import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layout
import Layout from "../layouts/Layout";

// Auth
import { LoginPage } from "../features/auth";

// Dashboard
import Dashboard from "../features/dashboard/pages/Dashboard";

// Farm Management
import Farm from "../features/farm/pages/Farm";
import FarmDashboard from "../features/farm/pages/FarmDashboard";
import AnimalsHerd from "../features/farm/pages/AnimalsHerd";

import MilkingRegister from "../features/farm/pages/MilkingRegister";
import DahiProcessing from "../features/farm/pages/DahiProcessing";
import ExpenseLayout from "../features/farm/pages/ExpenseLayout";
import FarmExpenses from "../features/farm/pages/FarmExpenses";

import ExpenseDetailPage from "../features/farm/pages/ExpenseDetailPage";
import FarmPL from "../features/farm/pages/FarmPL";
import DailySheet from "../features/farm/pages/DailySheet";

// Suppliers & Production
import Supplier from "../features/suppliers/pages/Supplier";
import SupplierDashboard from "../features/suppliers/pages/SupplierDashboard";
import SupplierDirectory from "../features/suppliers/pages/SupplierDirectory";
import IntakeRegister from "../features/suppliers/pages/IntakeRegister";
import SourceExpense from "../features/suppliers/pages/SourceExpense";
import SupplierPL from "../features/suppliers/pages/SupplierPL";
import ProcurementSheet from "../features/suppliers/pages/ProcurementSheet";
import Proccessing from "../features/inventory/pages/Processing";
import Products from "../features/inventory/pages/Products";

// Sales & Point of Sale (POS)
import Pos from "../features/pos/pages/Pos";

// Delivery & Logistics
import Delivery from "../features/deliveries/pages/Delivery";

// Customers & Accounts Ledger
import CustomerManagement from "../features/customers/pages/CustomerManagement";
import CustomerKhataLedger from "../features/customers/pages/CustomerKhataLedger";

// Finance, Reconciliation & Daily Closing
import CustomerFinance from "../features/finance/pages/CustomerFinance";
import RiderDeliveryFinancePage from "../features/finance/pages/RiderDeliveryFinancePage";
import DailyClosing from "../features/finance/pages/DailyClosing";

// Staff Management
import StaffManagement from "../features/staff/pages/StaffManagement";

export function AppRouter() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <LoginPage
              onLogin={(email, password) => {
                console.log("User logged in:", email);
                setIsAuthenticated(true);
              }}
            />
          }
        />

        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="farm" element={<Farm />}>
            <Route index element={<FarmDashboard />} />
            <Route path="animals" element={<AnimalsHerd />} />

            <Route path="milking" element={<MilkingRegister />} />
            <Route path="processing" element={<DahiProcessing />} />
            <Route path="expenses" element={<ExpenseLayout />}>
              <Route index element={<FarmExpenses />} />

              <Route path="detail/:id" element={<ExpenseDetailPage />} />
            </Route>
            <Route path="pl" element={<FarmPL />} />
            <Route path="dailysheet" element={<DailySheet />} />
          </Route>

          <Route path="supplier" element={<Supplier />}>
            <Route index element={<SupplierDashboard />} />
            <Route path="dashboard" element={<SupplierDashboard />} />
            <Route path="directory" element={<SupplierDirectory />} />
            <Route path="intake" element={<IntakeRegister />} />
            <Route path="expenses" element={<SourceExpense />} />
            <Route path="pl" element={<SupplierPL />} />
            <Route path="procurement" element={<ProcurementSheet />} />
          </Route>
          <Route path="proccessing" element={<Proccessing />} />
          <Route path="products" element={<Products />} />

          <Route path="pos" element={<Pos />} />

          <Route path="delivery" element={<Delivery />} />

          <Route path="customer" element={<CustomerManagement />} />
          <Route path="customer-khata-ledger" element={<CustomerKhataLedger />} />

          <Route path="finance/customer" element={<CustomerFinance />} />
          <Route path="finance/delivery" element={<RiderDeliveryFinancePage />} />
          <Route path="finance/daily-closing" element={<DailyClosing />} />
          <Route path="finance/staff" element={<StaffManagement />} />

          <Route path="staff" element={<StaffManagement />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
