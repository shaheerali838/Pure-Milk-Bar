import React from "react";
import { AuthProvider } from "./AuthContext";
import { CustomerProvider } from "./CustomerContext";
import { LedgerProvider } from "./LedgerContext";
import { AnimalProvider } from "./AnimalContext";
import { ExpenseProvider } from "./ExpenseContext";
import { StaffProvider } from "./StaffContext";
import { StaffPayrollProvider } from "./StaffPayrollContext";
import { DeliveryStaffProvider } from "./DeliveryStaffContext";
import { FuelLogProvider } from "./FuelLogContext";
import { RiderSalaryProvider } from "./RiderSalaryContext";
import { DeliveryProvider } from "./DeliveryContext";
import { SupplierProvider } from "./SupplierContext";
import { IntakeProvider } from "./IntakeContext";
import { POSProvider } from "./POSContext";
import { DahiProvider } from "./DahiContext";
import { SourcExpenseProvider } from "./SourcExpenseContext";
import { PayrollProvider } from "./PayrollContext";
import { TransactionProvider } from "./TransactionContext";
import { AuditProvider } from "./AuditContext";
import { SettingsProvider } from "./SettingsContext";

const providers = [
  // 1. Root & Base Configuration
  AuthProvider,
  SettingsProvider,

  // 2. Base Domain Entities
  CustomerProvider,
  AnimalProvider,
  ExpenseProvider,
  SourcExpenseProvider,
  StaffProvider,
  StaffPayrollProvider,
  DeliveryStaffProvider,
  FuelLogProvider,
  RiderSalaryProvider,
  DeliveryProvider,
  IntakeProvider,
  DahiProvider,
  PayrollProvider,

  // 3. Dependent Domain Providers
  LedgerProvider,
  SupplierProvider,

  // 4. POS Engine
  POSProvider,

  // 5. Aggregate Transactions
  TransactionProvider,

  // 6. Global Audit Logging
  AuditProvider,
];

export const AppProviders = ({ children }) => {
  return providers.reduceRight(
    (accumulatedProviders, CurrentProvider) => (
      <CurrentProvider>{accumulatedProviders}</CurrentProvider>
    ),
    children,
  );
};

export default AppProviders;
