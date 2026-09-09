import React, { useState } from 'react';
import CustomerHeader from '../components/Customer_&_Accounts/CustomerHeader';
import CustomerStatsCards from '../components/Customer_&_Accounts/CustomerStatsCards';
import CustomerFilters from '../components/Customer_&_Accounts/CustomerFilters';
import CustomerTable from '../components/Customer_&_Accounts/CustomerTable';
import AddCustomerModal from '../components/Customer_&_Accounts/AddCustomerModal';

export default function CustomerManagement() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      <CustomerHeader onOpenAddModal={() => setIsAddModalOpen(true)} />
      <CustomerStatsCards />
      <CustomerFilters />
      <CustomerTable />

      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
