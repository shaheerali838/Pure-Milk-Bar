import React, { useState } from 'react';
import {
  Search,
  X,
  Eye,
  Edit,
  Trash2,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Wallet,
} from 'lucide-react';
import { useSupplierContext } from '@/context/SupplierContext';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

export default function SupplierTable({ onView, onEdit }) {
  const { suppliers, deleteSupplier, settleSupplierBalance } = useSupplierContext();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [settlingSupplier, setSettlingSupplier] = useState(null);

  // Filter suppliers by name, contact, or area + status
  const filteredSuppliers = suppliers.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(q) ||
      (s.contact && s.contact.toLowerCase().includes(q)) ||
      (s.area && s.area.toLowerCase().includes(q)) ||
      (s.id && s.id.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'All' ? true : s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id) => {
    deleteSupplier(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
      {/* Search and Status Filter Header */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="flex items-center gap-2 w-full md:w-80 bg-slate-50 border border-slate-200 rounded-full px-3.5 h-[38px]">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search supplier name, contact, area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-700 placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full text-xs font-semibold text-slate-600 self-start md:self-auto">
          {['All', 'Active', 'Inactive'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <Table className="w-full text-left text-xs sm:text-sm">
          <TableHeader className="bg-slate-50/80 border-b border-slate-200">
            <TableRow>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                Supplier Name
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                Type & Area
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                Contact Phone
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                Rate / Liter
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                Total Sourced
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                Total Payout
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                Balance Due
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-center">
                Status
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-slate-100">
            {filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-14 text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                      <Users className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 font-display">No Suppliers Registered</p>
                    <p className="text-xs text-slate-400 max-w-xs">
                      {search
                        ? 'No suppliers match your search filters.'
                        : 'Storage data is 0. Click "Add Supplier" above to register your first dairy supplier.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredSuppliers.map((supplier) => (
                <TableRow
                  key={supplier.id}
                  onClick={() => onView(supplier)}
                  className="hover:bg-slate-50/80 transition-colors duration-150 cursor-pointer"
                >
                  {/* Supplier Name */}
                  <TableCell className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      {supplier.image ? (
                        <img
                          src={supplier.image}
                          alt={supplier.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-[#155dfc] flex items-center justify-center font-bold text-xs shrink-0">
                          {supplier.name.replace(/Supplier\s+/i, '').charAt(0).toUpperCase() || 'S'}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-slate-900 font-display block">
                          {supplier.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {supplier.id} • {supplier.joinDate || new Date().toISOString().split('T')[0]}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Type & Area */}
                  <TableCell className="py-3.5 px-4 text-slate-700">
                    <div className="text-xs font-semibold text-slate-800">
                      {supplier.supplierType}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{supplier.area}</span>
                    </div>
                  </TableCell>

                  {/* Contact Phone */}
                  <TableCell className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{supplier.contact || '—'}</span>
                    </div>
                  </TableCell>

                  {/* Rate / Liter */}
                  <TableCell className="py-3.5 px-4 text-right font-semibold text-slate-800 tabular">
                    Rs. {supplier.ratePerLiter}
                  </TableCell>

                  {/* Total Sourced */}
                  <TableCell className="py-3.5 px-4 text-right font-bold text-slate-900 tabular">
                    {(supplier.totalSourced || 0).toLocaleString()} L
                  </TableCell>

                  {/* Total Payout */}
                  <TableCell className="py-3.5 px-4 text-right font-bold text-emerald-700 tabular">
                    Rs. {(supplier.totalPayout || 0).toLocaleString()}
                  </TableCell>

                  {/* Balance Due */}
                  <TableCell className="py-3.5 px-4 text-right font-bold tabular">
                    <div className="flex flex-col items-end">
                      <span
                        className={
                          (supplier.balanceDue || 0) > 0
                            ? 'text-amber-600 font-extrabold'
                            : 'text-slate-400'
                        }
                      >
                        Rs. {(supplier.balanceDue || 0).toLocaleString()}
                      </span>
                      {(supplier.balanceDue || 0) > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSettlingSupplier(supplier);
                          }}
                          className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 hover:bg-emerald-600 hover:text-white border border-amber-200 transition-all cursor-pointer shadow-2xs"
                          title="Clear and settle this balance"
                        >
                          <Wallet className="w-2.5 h-2.5" />
                          <span>Settle</span>
                        </button>
                      )}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3.5 px-4 text-center">
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-semibold border-0 ${
                        supplier.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {supplier.status === 'Active' ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {supplier.status}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(supplier);
                        }}
                        title="View Details"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(supplier);
                        }}
                        title="Edit Supplier"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(supplier.id);
                        }}
                        title="Delete Supplier"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Settle Balance Confirmation Modal */}
      {settlingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 font-display">
              Settle Supplier Balance?
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Disburse full payment of{' '}
              <span className="font-bold text-slate-900">
                Rs. {(settlingSupplier.balanceDue || 0).toLocaleString()}
              </span>{' '}
              to{' '}
              <span className="font-bold text-slate-900">{settlingSupplier.name}</span>.
              This will mark their pending milk intake batches as <span className="font-bold text-emerald-600">Paid</span> and increase Total Payouts.
            </p>

            <div className="flex items-center justify-end gap-2 pt-4 mt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSettlingSupplier(null)}
                className="px-3.5 h-[34px] rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  settleSupplierBalance(settlingSupplier.id);
                  setSettlingSupplier(null);
                }}
                className="px-4 h-[34px] rounded-full text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
              >
                Confirm Settlement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 font-display">
              Delete Supplier?
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to remove this supplier profile? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-3.5 h-[34px] rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 h-[34px] rounded-full text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
