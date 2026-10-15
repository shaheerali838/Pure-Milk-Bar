import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

/**
 * Universal CustomSelect Component
 * Standardized replacement for native HTML <select> across the application.
 *
 * @param {string|number} value - Selected value
 * @param {Function} onChange - Change handler receiving (value, syntheticEvent)
 * @param {Array<string|object>} options - Array of string values or { value, label, sublabel, badge, disabled }
 * @param {string} [placeholder="Select option..."] - Placeholder text when empty
 * @param {boolean} [searchable] - Force enable search filter (auto-enabled if >= 7 options)
 * @param {boolean} [disabled=false] - Disable dropdown
 * @param {string} [className=""] - Wrapper container class
 * @param {string} [buttonClassName=""] - Trigger button custom classes
 * @param {string} [name=""] - Optional form name for synthetic event compatibility
 * @param {Function} [renderOption] - Optional custom option renderer (opt, isSelected)
 */
export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select option...",
  searchable,
  disabled = false,
  className = "",
  buttonClassName = "",
  name = "",
  renderOption,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options to consistent { value, label, sublabel, badge, disabled }
  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string' || typeof opt === 'number') {
        return {
          value: opt,
          label: String(opt),
        };
      }
      return {
        value: opt.value ?? opt.id ?? opt.key ?? opt.name,
        label: opt.label ?? opt.name ?? opt.title ?? String(opt.value ?? ''),
        sublabel: opt.sublabel ?? opt.description ?? opt.phone ?? '',
        badge: opt.badge ?? '',
        disabled: Boolean(opt.disabled),
        raw: opt,
      };
    });
  }, [options]);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    if (value === undefined || value === null || value === '') return null;
    return normalizedOptions.find((opt) => String(opt.value) === String(value)) || null;
  }, [normalizedOptions, value]);

  // Auto-enable search if more than 6 options unless explicitly disabled
  const showSearch = searchable !== undefined ? searchable : normalizedOptions.length >= 7;

  // Filter options by search query
  const filteredOptions = useMemo(() => {
    if (!showSearch || !search.trim()) return normalizedOptions;
    const q = search.toLowerCase().trim();
    return normalizedOptions.filter((opt) => {
      const labelMatch = (opt.label || '').toLowerCase().includes(q);
      const subMatch = (opt.sublabel || '').toLowerCase().includes(q);
      const badgeMatch = (opt.badge || '').toLowerCase().includes(q);
      return labelMatch || subMatch || badgeMatch;
    });
  }, [normalizedOptions, search, showSearch]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Auto focus search input on open
  useEffect(() => {
    if (isOpen && showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, showSearch]);

  const handleSelect = (opt) => {
    if (opt.disabled) return;
    const selectedVal = opt.value;
    const syntheticEvent = { target: { name, value: selectedVal } };

    if (name) {
      onChange?.(syntheticEvent);
    } else {
      onChange?.(selectedVal, syntheticEvent);
    }

    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    const syntheticEvent = { target: { name, value: '' } };
    if (name) {
      onChange?.(syntheticEvent);
    } else {
      onChange?.('', syntheticEvent);
    }
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full bg-white border rounded-lg px-3 py-2 text-xs transition cursor-pointer flex items-center justify-between text-left select-none ${
          disabled
            ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-75'
            : isOpen
            ? 'border-emerald-500 ring-1 ring-emerald-500 shadow-xs'
            : 'border-slate-200 hover:border-slate-300'
        } ${buttonClassName}`}
      >
        <div className="flex-1 min-w-0 pr-2">
          {selectedOption ? (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 truncate">
                <span className="font-semibold text-slate-800 text-xs block truncate">
                  {selectedOption.label}
                </span>
                {selectedOption.sublabel && (
                  <span className="text-[10px] text-slate-500 block truncate font-normal">
                    {selectedOption.sublabel}
                  </span>
                )}
              </div>
              {selectedOption.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 shrink-0 font-mono">
                  {selectedOption.badge}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 font-normal truncate block">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {selectedOption && !disabled && (
            <span
              onClick={handleClear}
              className="p-0.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition cursor-pointer"
              title="Clear selection"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-emerald-600' : ''
            }`}
          />
        </div>
      </button>

      {/* Global UI Standard Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Header if applicable */}
          {showSearch && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:border-emerald-500">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
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
          )}

          {/* Options List with Constrained Scrollbar */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100/70 no-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedOption && String(selectedOption.value) === String(opt.value);

                if (typeof renderOption === 'function') {
                  return (
                    <div
                      key={String(opt.value)}
                      onClick={() => handleSelect(opt)}
                      className={`cursor-pointer transition ${
                        isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'
                      }`}
                    >
                      {renderOption(opt, isSelected)}
                    </div>
                  );
                }

                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt)}
                    className={`w-full px-3 py-2 text-left transition cursor-pointer flex items-center justify-between gap-2.5 ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed bg-slate-50'
                        : isSelected
                        ? 'bg-slate-100 text-slate-900 font-bold'
                        : 'hover:bg-slate-50/80 text-slate-700'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs truncate block font-medium">
                          {opt.label}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                        )}
                      </div>
                      {opt.sublabel && (
                        <span className="text-[10px] text-slate-400 block truncate font-normal">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {opt.badge && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
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
