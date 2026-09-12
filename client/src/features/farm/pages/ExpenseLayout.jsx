import React from 'react';
import { Outlet } from 'react-router-dom';
import { ExpenseProvider } from '../components/expense/ExpenseContext';

export default function ExpenseLayout() {
  return (
    <ExpenseProvider>
      <Outlet />
    </ExpenseProvider>
  );
}
