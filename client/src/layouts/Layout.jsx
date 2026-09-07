import React from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

export default function Layout({ activeTab, setActiveTab, children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar activeTab={activeTab} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
