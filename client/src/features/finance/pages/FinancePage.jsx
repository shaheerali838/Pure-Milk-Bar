import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FinanceNav from '../components/FinanceNav';
import FinanceOverviewCards from '../components/FinanceOverviewCards';
import CustomerFinance from './CustomerFinance';
import DeliveryFinance from '../components/DeliveryFinance/DeliveryFinance';

export default function FinancePage({ initialTab }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from prop, pathname, or state
  const getTabFromLocation = () => {
    if (initialTab) return initialTab;
    if (location.pathname === '/finance/customer') return 'customer';
    if (location.pathname === '/finance/delivery') return 'delivery';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromLocation());

  useEffect(() => {
    setActiveTab(getTabFromLocation());
  }, [location.pathname, initialTab]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (newTab === 'overview') {
      navigate('/finance');
    } else if (newTab === 'customer') {
      navigate('/finance/customer');
    } else if (newTab === 'delivery') {
      navigate('/finance/delivery');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header / Navigation Bar */}
      <FinanceNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Tab Content Display */}
      {activeTab === 'overview' && (
        <FinanceOverviewCards
          onSelectCustomerFinance={() => handleTabChange('customer')}
          onSelectRiderFinance={() => handleTabChange('delivery')}
        />
      )}

      {activeTab === 'customer' && (
        <div className="space-y-3">
          <CustomerFinance />
        </div>
      )}

      {activeTab === 'delivery' && (
        <div className="space-y-3">
          <DeliveryFinance />
        </div>
      )}
    </div>
  );
}
