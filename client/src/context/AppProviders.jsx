import React from "react";
import { CustomerProvider } from "./CustomerContext";
import { LedgerProvider } from "./LedgerContext";
import { AnimalProvider } from "./AnimalContext";
import { ExpenseProvider } from "./ExpenseContext";
import { StaffProvider } from "./StaffContext";
import { DeliveryStaffProvider } from "./DeliveryStaffContext";
import { FuelLogProvider } from "./FuelLogContext";
import { RiderSalaryProvider } from "./RiderSalaryContext";
import { DeliveryProvider } from "./DeliveryContext";
import { SupplierProvider } from "./SupplierContext";
import { IntakeProvider } from "./IntakeContext";
import { POSProvider } from "./POSContext";
import { PayrollProvider } from "./PayrollContext";
import { TransactionProvider } from "./TransactionContext";
import { AuditProvider } from "./AuditContext";
import { SettingsProvider } from "./SettingsContext";
import { SourcExpenseProvider } from "./SourcExpenseContext";

const providers = [
  CustomerProvider,
  LedgerProvider,
  AnimalProvider,
  ExpenseProvider,
  StaffProvider,
  DeliveryStaffProvider,
  FuelLogProvider,
  RiderSalaryProvider,
  DeliveryProvider,
  SupplierProvider,
  IntakeProvider,
  POSProvider,
  PayrollProvider,
  TransactionProvider,
  AuditProvider,
  SettingsProvider,
  SourcExpenseProvider,
];

export const AppProviders = ({ children }) => {
  return providers.reduceRight(
    (accumulatedProviders, CurrentProvider) => (
      <CurrentProvider>{accumulatedProviders}</CurrentProvider>
    ),
    children
  );
};

export default AppProviders;
