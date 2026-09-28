import React from 'react';
import { Sliders, MapPin, Home, Shield } from 'lucide-react';

export default function StaffRoleDetailsSection({ formData, onChange }) {
  return (
    <div className="pt-2 border-t border-slate-100">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center text-xs">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
            5. Role-Specific Details ({formData.role})
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
          Dynamic fields for {formData.role}
        </span>
      </div>

      {/* A. If Delivery Rider */}
      {formData.role === 'Delivery Rider' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs animate-in fade-in duration-200">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Assigned Route / Delivery Area <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                name="route"
                value={formData.route}
                onChange={onChange}
                placeholder="e.g. Route A - Model Town"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Vehicle Number / Plate
            </label>
            <input
              type="text"
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={onChange}
              placeholder="e.g. LEA-2024-8921"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-mono font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Driving License No.
            </label>
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={onChange}
              placeholder="e.g. DL-LHR-98213"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-mono font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Vehicle Type
            </label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={onChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition cursor-pointer font-medium"
            >
              <option value="Motorcycle">Motorcycle / Bike</option>
              <option value="Chilled Van">Chilled Milk Van</option>
              <option value="Loader Rickshaw">Loader Rickshaw</option>
              <option value="Pickup Truck">Pickup Carrier</option>
            </select>
          </div>
        </div>
      )}

      {/* B. If Farm Worker or Milking Staff */}
      {(formData.role === 'Farm Worker' || formData.role === 'Milking Staff') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs animate-in fade-in duration-200">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Assigned Barn / Shed
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Home className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                name="assignedBarn"
                value={formData.assignedBarn}
                onChange={onChange}
                placeholder="e.g. Shed 1 (High Yield) or Shed 2"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Milking Specialization / Duty
            </label>
            <select
              name="milkingShiftSpecialization"
              value={formData.milkingShiftSpecialization}
              onChange={onChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition cursor-pointer font-medium"
            >
              <option value="Machine Milking Specialist">Machine Milking Specialist</option>
              <option value="Hand Milking Staff">Hand Milking Staff</option>
              <option value="Bulk Tank Chiller Operator">Bulk Tank Chiller Operator</option>
              <option value="Cattle Feeding & Barn Cleaning">Cattle Feeding &amp; Barn Cleaning</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Assigned Cattle Count (Approx)
            </label>
            <input
              type="number"
              min="0"
              name="assignedCattleCount"
              value={formData.assignedCattleCount}
              onChange={onChange}
              placeholder="e.g. 15 animals"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-mono font-medium"
            />
          </div>
        </div>
      )}

      {/* C. If Farm Supervisor */}
      {formData.role === 'Farm Supervisor' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs animate-in fade-in duration-200">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Supervised Section / Barn Yard
            </label>
            <input
              type="text"
              name="departmentSupervised"
              value={formData.departmentSupervised}
              onChange={onChange}
              placeholder="e.g. Yard 4, Milking Parlor & Chilling Dock"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Herd Supervision Scope
            </label>
            <input
              type="text"
              name="assignedBarn"
              value={formData.assignedBarn}
              onChange={onChange}
              placeholder="e.g. Dairy Cattle & Calf Nursery"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Special Responsibilities
            </label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={onChange}
              placeholder="e.g. Milking yield logs & fodder management"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
            />
          </div>
        </div>
      )}

      {/* D. If Security Guard */}
      {formData.role === 'Security Guard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs animate-in fade-in duration-200">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Assigned Guard Post / Gate
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Shield className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                name="guardPost"
                value={formData.guardPost}
                onChange={onChange}
                placeholder="e.g. Main Gate 1, Bulk Intake Gate"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Security Clearance / Weapon License #
            </label>
            <input
              type="text"
              name="weaponLicense"
              value={formData.weaponLicense}
              onChange={onChange}
              placeholder="e.g. WPN-99214 (or None)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-mono font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Emergency Hotline / Police Check
            </label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={onChange}
              placeholder="e.g. Verified by local police station"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
            />
          </div>
        </div>
      )}

      {/* E. If Cashier or Accountant */}
      {(formData.role === 'Cashier' || formData.role === 'Accountant') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs animate-in fade-in duration-200">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Assigned POS Counter / Terminal
            </label>
            <input
              type="text"
              name="posRegisterId"
              value={formData.posRegisterId}
              onChange={onChange}
              placeholder="e.g. Counter 1 - Retail Counter"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Khata / Credit Authorization Limit (PKR)
            </label>
            <input
              type="number"
              min="0"
              name="khataAuthLimit"
              value={formData.khataAuthLimit}
              onChange={onChange}
              placeholder="e.g. 50000"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-mono font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Daily Drawer Clearance Note
            </label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={onChange}
              placeholder="e.g. Daily shift close at 9:00 PM"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
            />
          </div>
        </div>
      )}

      {/* F. If Dairy Manager */}
      {formData.role === 'Dairy Manager' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs animate-in fade-in duration-200">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Supervised Department
            </label>
            <select
              name="departmentSupervised"
              value={formData.departmentSupervised}
              onChange={onChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition cursor-pointer font-medium"
            >
              <option value="Livestock & Milking">Livestock &amp; Milking Operations</option>
              <option value="Procurement & Supplier Intake">Procurement &amp; Supplier Intake</option>
              <option value="Retail POS & Home Deliveries">Retail POS &amp; Home Deliveries</option>
              <option value="General Farm Management">General Farm Administration</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Administrative Authority Notes
            </label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={onChange}
              placeholder="e.g. Full inventory and shift approval authority"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
            />
          </div>
        </div>
      )}

      {/* Common Notes field for any other role */}
      {formData.role !== 'Security Guard' &&
        formData.role !== 'Cashier' &&
        formData.role !== 'Accountant' &&
        formData.role !== 'Dairy Manager' &&
        formData.role !== 'Farm Supervisor' && (
          <div className="mt-3">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              General Duty Notes &amp; Special Instructions
            </label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={onChange}
              placeholder="e.g. Trained in machine milking, key holder..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
            />
          </div>
        )}
    </div>
  );
}
