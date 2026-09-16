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
import AnimalDetailPage from "../features/farm/pages/AnimalDetailPage";
import MilkingRegister from "../features/farm/pages/MilkingRegister";
import DahiProcessing from "../features/farm/pages/DahiProcessing";
import ExpenseLayout from "../features/farm/pages/ExpenseLayout";
import FarmExpenses from "../features/farm/pages/FarmExpenses";
import RecordFarmExpensePage from "../features/farm/pages/RecordFarmExpensePage";
import ExpenseDetailPage from "../features/farm/pages/ExpenseDetailPage";
import FarmPL from "../features/farm/pages/FarmPL";
import DailySheet from "../features/farm/pages/DailySheet";

// Suppliers & Production
import Supplier from "../features/suppliers/pages/Supplier";
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

/**
 * AppRouter defines all client-side navigation routing,
 * layouts, and page hierarchies for the ERP system.
 */
export function AppRouter() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public / Authentication Routes */}
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

        {/* Protected Application Routes with Global Layout */}
        <Route path="/" element={<Layout />}>
          {/* Dashboard Redirect & Home */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Farm Management Routes */}
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

          {/* Operations & Inventory */}
          <Route path="supplier" element={<Supplier />} />
          <Route path="proccessing" element={<Proccessing />} />
          <Route path="products" element={<Products />} />

          {/* Sales & Counter POS */}
          <Route path="pos" element={<Pos />} />

          {/* Deliveries & Riders */}
          <Route path="delivery" element={<Delivery />} />

          {/* Customers & Khata Ledger */}
          <Route path="customer" element={<CustomerManagement />} />
          <Route path="customer-khata-ledger" element={<CustomerKhataLedger />} />

          {/* Finance & Reconciliation */}
          <Route path="finance/customer" element={<CustomerFinance />} />
          <Route path="finance/delivery" element={<RiderDeliveryFinancePage />} />
          <Route path="finance/daily-closing" element={<DailyClosing />} />
          <Route path="finance/staff" element={<StaffManagement />} />

          {/* Staff Management */}
          <Route path="staff" element={<StaffManagement />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
