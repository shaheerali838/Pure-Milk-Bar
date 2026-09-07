import React from 'react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const links = [
    { id: 'Dashboard', name: 'Dashboard' },
    { id: 'Farm', name: 'Farm' },
    { id: 'Supplier', name: 'Supplier' },
  ];

  return (
    <div className="w-64 bg-[#ffffff] min-h-screen flex flex-col border-r border-[#e1e1e1]">
      <div className="px-5 py-4 mb-6 border-b border-[#e1e1e1]">
        <h1 className="text-xl font-bold text-[#33435a]">Pur Milk Bar</h1>
        <p className="text-xs text-slate-400">Dairy & Farm Management</p>
      </div>

      <nav className="flex-1 px-3 space-y-2">
        {links.map((link) => {
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#009966] text-white'
                  : 'text-[#33435a] hover:bg-slate-100'
              }`}
            >
              {link.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
