import React, { useEffect } from 'react';
import {
  X,
  Droplets,
  Edit,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import IntakeDetail from './IntakeDetail';

// Sidebar drawer displaying intake slip details
export default function IntakeDetailSidebar({
  item,
  isOpen,
  onClose,
  onEdit,
}) {
  // Check visibility (supports both item and isOpen props)
  const isVisible = isOpen !== undefined ? (isOpen && Boolean(item)) : Boolean(item);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isVisible) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onClose]);

  if (!isVisible || !item) return null;

  return (
    <>
      {/* 1. Fixed Dimmed Backdrop on z-40 */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* 2. FIXED Right-Side Sidebar Drawer on z-50 */}
      <aside
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="intake-detail-title"
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm shadow-2xs">
              <Droplets className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="intake-detail-title"
                  className="font-bold text-base text-slate-900 font-display leading-tight"
                >
                  {item.supplierName}
                </h3>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                  {item.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {item.shift} Shift • {item.date} {item.time ? `(${item.time})` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title="Close Sidebar (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar Scrollable Body - Dedicated IntakeDetail Component */}
        <div className="flex-1 overflow-y-auto p-5">
          <IntakeDetail item={item} />
        </div>

        {/* Sidebar Footer Action Buttons */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-full h-[40px] text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100"
          >
            Close
          </Button>

          <Button
            type="button"
            onClick={() => {
              onClose();
              if (onEdit) onEdit(item);
            }}
            className="flex-1 rounded-full h-[40px] text-xs font-semibold text-white flex items-center justify-center gap-1.5 shadow-sm bg-blue-600 hover:bg-blue-700 cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Slip</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
