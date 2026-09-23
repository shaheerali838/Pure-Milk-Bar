import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FinanceNav from '../components/FinanceNav';
import FinanceOverviewCards from '../components/FinanceOverviewCards';
import CustomerFinance from './CustomerFinance';
import DeliveryFinance from '../components/DeliveryFinance/DeliveryFinance';
import FarmDailyReport from '../components/FarmDailyReport';
import SupplierDailyReport from '../components/SupplierDailyReport';
import DahiDailyReport from '../../dahi/component/DahiDailyReport';

export default function FinancePage({ initialTab }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from prop, pathname, or state
  const getTabFromLocation = () => {
    if (initialTab) return initialTab;
    if (location.pathname === '/finance/customer') return 'customer';
    if (location.pathname === '/finance/delivery') return 'delivery';
    if (location.pathname === '/finance/report-farm') return 'report-farm';
    if (location.pathname === '/finance/report-supplier') return 'report-supplier';
    if (location.pathname === '/finance/report-dahi') return 'report-dahi';
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
    } else if (newTab === 'report-farm') {
      navigate('/finance/report-farm');
    } else if (newTab === 'report-supplier') {
      navigate('/finance/report-supplier');
    } else if (newTab === 'report-dahi') {
      navigate('/finance/report-dahi');
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
          onSelectFarmReport={() => handleTabChange('report-farm')}
          onSelectSupplierReport={() => handleTabChange('report-supplier')}
          onSelectDahiReport={() => handleTabChange('report-dahi')}
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

      {activeTab === 'report-farm' && (
        <div className="space-y-3">
          <FarmDailyReport />
        </div>
      )}

      {activeTab === 'report-supplier' && (
        <div className="space-y-3">
          <SupplierDailyReport />
        </div>
      )}

      {activeTab === 'report-dahi' && (
        <div className="space-y-3">
          <DahiDailyReport />
        </div>
      )}
    </div>
  );
}
