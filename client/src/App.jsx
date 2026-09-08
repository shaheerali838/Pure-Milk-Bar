import React, { useState } from 'react';
import Layout from './layouts/Layout';
import Dashboard from './components/Dashboard';
import Farm from './components/Farm';
import Supplier from './components/Supplier';
import { LoginPage } from './features/auth';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLogin={(email, password) => {
          console.log('Logging in user:', email);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setIsAuthenticated(false)}
          className="text-xs text-slate-500 hover:text-slate-700 underline font-medium cursor-pointer"
        >
          ← Back to Login Screen
        </button>
      </div>
      {activeTab === 'Dashboard' && <Dashboard />}
      {activeTab === 'Farm' && <Farm />}
      {activeTab === 'Supplier' && <Supplier />}
    </Layout>
  );
}

