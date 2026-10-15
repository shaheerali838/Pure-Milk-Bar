import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

export default function POSCustomerSelect({
  value,
  onChange,
  customers = [],
  placeholder = "— Choose Customer Account —",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedCustomer = customers.find(
    (c) => String(c.id || c._id) === String(value)
  );

  const filteredCustomers = customers.filter((cust) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = (cust.name || '').toLowerCase();
    const phone = (cust.phone || '').toLowerCase();
    const area = (cust.area || '').toLowerCase();
    return name.includes(q) || phone.includes(q) || area.includes(q);
  });

  const handleSelect = (cust) => {
    onChange?.(cust ? cust.id || cust._id : '');
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full bg-white border rounded-lg px-3 py-2 text-xs transition cursor-pointer flex items-center justify-between text-left ${
          isOpen
            ? 'border-emerald-500 ring-1 ring-emerald-500'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex-1 min-w-0 pr-2">
          {selectedCustomer ? (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="font-bold text-slate-800 text-xs block truncate">
                  {selectedCustomer.name}
                </span>
                <span className="text-[11px] text-slate-500 block truncate font-normal">
                  {selectedCustomer.phone || 'No phone'} &bull; {selectedCustomer.area || 'Model Town'}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-bold text-slate-800 block">
                  Rs. {Number(selectedCustomer.khataBalance || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  Limit: Rs. {Number(selectedCustomer.creditLimit || 10000).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-slate-400 font-normal">
              {placeholder}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-600' : ''
          }`}
        />
      </button>

      {/* Custom Dropdown Menu Container */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Quick Search Header */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:border-emerald-500">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search name, phone, area..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs text-slate-800 bg-transparent outline-none placeholder:text-slate-400 font-medium"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Structured Options List with Constrained Internal Scrollbar */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 no-scrollbar">
            {/* Clear/Deselect option */}
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className="w-full px-3 py-2 text-left text-xs text-slate-500 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between"
            >
              <span>{placeholder}</span>
              {!value && <Check className="w-3.5 h-3.5 text-emerald-600" />}
            </button>

            {filteredCustomers.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching customer accounts found
              </div>
            ) : (
              filteredCustomers.map((cust) => {
                const isSelected = String(cust.id || cust._id) === String(value);
                const khataBal = Number(cust.khataBalance || 0);
                const creditLim = Number(cust.creditLimit || 10000);
                const isOverLimit = khataBal >= creditLim;

                return (
                  <button
                    key={cust.id || cust._id}
                    type="button"
                    onClick={() => handleSelect(cust)}
                    className={`w-full px-3 py-2.5 text-left transition cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-100 text-slate-900'
                        : 'hover:bg-slate-50/80 text-slate-700'
                    }`}
                  >
                    {/* Left: Customer Name & Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 block truncate">
                          {cust.name}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5 font-normal">
                        {cust.phone || 'No phone'} &bull; {cust.area || 'Model Town'}
                      </div>
                    </div>

                    {/* Right: Structured Financial Badges */}
                    <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                          isOverLimit
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : khataBal > 0
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        Khata: Rs. {khataBal.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Limit: Rs. {creditLim.toLocaleString()}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
