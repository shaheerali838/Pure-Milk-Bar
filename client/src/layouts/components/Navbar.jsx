import React from 'react';

export default function Navbar({ activeTab }) {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-between shadow-sm">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          {activeTab}
        </h2>
        <p className="text-xs text-slate-500">Pur Milk Bar / {activeTab}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
          PM
        </div>
        <span className="text-sm font-semibold text-slate-700">Admin</span>
      </div>
    </header>
  );
}
