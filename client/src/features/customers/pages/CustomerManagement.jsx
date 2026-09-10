import React, { useState } from 'react';
import CustomerHeader from '../components/Customer_&_Accounts/CustomerHeader';
import CustomerStatsCards from '../components/Customer_&_Accounts/CustomerStatsCards';
import CustomerFilters from '../components/Customer_&_Accounts/CustomerFilters';
import CustomerTable from '../components/Customer_&_Accounts/CustomerTable';
import AddCustomerModal from '../components/Customer_&_Accounts/AddCustomerModal';
import ViewCustomerModal from '../components/Customer_&_Accounts/ViewCustomerModal';
import EditCustomerModal from '../components/Customer_&_Accounts/EditCustomerModal';

export default function CustomerManagement() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [editCustomer, setEditCustomer] = useState(null);

  return (
    <div className="space-y-2.5">
      <CustomerHeader onOpenAddModal={() => setIsAddModalOpen(true)} />
      <CustomerStatsCards />
      <CustomerFilters />
      <CustomerTable
        onViewCustomer={(cust) => setViewCustomer(cust)}
        onEditCustomer={(cust) => setEditCustomer(cust)}
      />

      {/* Add Modal */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* View Details Modal (Eye Icon) */}
      <ViewCustomerModal
        customer={viewCustomer}
        isOpen={!!viewCustomer}
        onClose={() => setViewCustomer(null)}
      />

      {/* Edit Details Form Modal (Pencil Icon) */}
      <EditCustomerModal
        customer={editCustomer}
        isOpen={!!editCustomer}
        onClose={() => setEditCustomer(null)}
      />
    </div>
  );
}
