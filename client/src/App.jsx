import React, { useState } from 'react';
import Layout from './layouts/Layout';
import Dashboard from './components/Dashboard';
import Farm from './components/Farm';
import Supplier from './components/Supplier';

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'Dashboard' && <Dashboard />}
      {activeTab === 'Farm' && <Farm />}
      {activeTab === 'Supplier' && <Supplier />}
    </Layout>
  );
}
