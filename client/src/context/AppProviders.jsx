import React from "react";
import { CustomerProvider } from "./CustomerContext";
import { LedgerProvider } from "./LedgerContext";
import { AnimalProvider } from "./AnimalContext";
import { ExpenseProvider } from "./ExpenseContext";
import { POSProvider } from "./POSContext";
import { DeliveryProvider } from "./DeliveryContext";
import { DeliveryStaffProvider } from "./DeliveryStaffContext";
import { FuelLogProvider } from "./FuelLogContext";
import { RiderSalaryProvider } from "./RiderSalaryContext";
import { StaffProvider } from "./StaffContext";
import { PayrollProvider } from "./PayrollContext";
import { TransactionProvider } from "./TransactionContext";
import { AuditProvider } from "./AuditContext";
import { SettingsProvider } from "./SettingsContext";
import { SupplierProvider } from "./SupplierContext";
import { IntakeProvider } from "./IntakeContext";

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
  POSProvider,
  PayrollProvider,
  TransactionProvider,
  AuditProvider,
  SettingsProvider,
  IntakeProvider,
  SupplierProvider,
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
