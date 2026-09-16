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

/**
 * Ordered list of global context providers.
 * Providers at the top wrap those below them.
 */
const providers = [
  CustomerProvider,
  LedgerProvider,
  AnimalProvider,
  ExpenseProvider,
  DeliveryStaffProvider,
  FuelLogProvider,
  RiderSalaryProvider,
  DeliveryProvider,
  POSProvider,
  StaffProvider,
];

/**
 * AppProviders: Flattens the provider hierarchy to prevent "pyramid of doom"
 * and provides a unified context entry point for the entire application.
 */
export const AppProviders = ({ children }) => {
  return providers.reduceRight(
    (accumulatedProviders, CurrentProvider) => (
      <CurrentProvider>{accumulatedProviders}</CurrentProvider>
    ),
    children
  );
};

export default AppProviders;
