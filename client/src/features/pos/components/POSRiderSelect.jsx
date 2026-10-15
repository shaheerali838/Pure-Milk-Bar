import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function POSRiderSelect({
  value,
  onChange,
  riders = [],
  placeholder = "— Choose Assigned Rider —",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

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

  const selectedRider = riders.find(
    (r) => String(r.id || r._id) === String(value)
  );

  const handleSelect = (r) => {
    onChange?.(r ? r.id || r._id : '');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full bg-white border rounded-lg px-3 py-2 text-xs transition cursor-pointer flex items-center justify-between text-left ${
          isOpen
            ? 'border-emerald-500 ring-1 ring-emerald-500'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <span className="truncate pr-2 font-medium text-slate-800">
          {selectedRider ? (
            `${selectedRider.name} (${selectedRider.phone || 'No phone'})`
          ) : (
            <span className="text-slate-400 font-normal">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-600' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 no-scrollbar">
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className="w-full px-3 py-2 text-left text-xs text-slate-500 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between"
            >
              <span>{placeholder}</span>
              {!value && <Check className="w-3.5 h-3.5 text-emerald-600" />}
            </button>

            {riders.map((r) => {
              const isSelected = String(r.id || r._id) === String(value);
              return (
                <button
                  key={r.id || r._id}
                  type="button"
                  onClick={() => handleSelect(r)}
                  className={`w-full px-3 py-2 text-left transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-xs font-semibold block truncate">
                      {r.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {r.phone || 'No phone'}{r.vehicleType ? ` &bull; ${r.vehicleType}` : ''}
                    </span>
                  </div>
                  {r.active === false ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                      Off Duty
                    </span>
                  ) : isSelected ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
