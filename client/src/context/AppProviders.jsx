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
import { SourcExpenseProvider } from "./SourcExpenseContext";
import { PayrollProvider } from "./PayrollContext";
import { TransactionProvider } from "./TransactionContext";
import { AuditProvider } from "./AuditContext";
import { SettingsProvider } from "./SettingsContext";

const providers = [
  AuthProvider,
  CustomerProvider,
  LedgerProvider,
  AnimalProvider,
  ExpenseProvider,
  StaffPayrollProvider,
  StaffProvider,
  DeliveryStaffProvider,
  FuelLogProvider,
  RiderSalaryProvider,
  DeliveryProvider,
  SupplierProvider,
  IntakeProvider,
  POSProvider,
  SourcExpenseProvider,
  PayrollProvider,
  TransactionProvider,
  AuditProvider,
  SettingsProvider,
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
