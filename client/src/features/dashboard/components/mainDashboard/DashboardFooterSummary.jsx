import { Bike, Users, FileText, Droplets, ChevronRight } from 'lucide-react';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { useSupplierContext } from '@/context/SupplierContext';
import { usePOSContext } from '@/context/POSContext';
import { useAnimalContext } from '@/context/AnimalContext';
import { useIntakeContext } from '@/context/IntakeContext';

import { Link } from 'react-router-dom';

export default function DashboardFooterSummary() {
  const { deliveries = [] } = useDeliveryContext();
  const { suppliers = [], totals: supplierTotals = {} } = useSupplierContext();
  const { salesHistory = [] } = usePOSContext();
  const { animals = [] } = useAnimalContext();
  const { totals: intakeTotals = {}, intakeLogs = [] } = useIntakeContext();

  // 1. Milk Deliveries
  const deliveryCount = deliveries.length;
  const deliveryLiters = deliveries.reduce((s, d) => s + (Number(d.qtyLiters) || 0), 0);

  // 2. Suppliers
  const totalSuppliers =
    supplierTotals.totalSuppliers ??
    suppliers.length;
  const activeSuppliers =
    supplierTotals.activeSuppliers ??
    suppliers.filter((s) => s.status === 'Active').length;

  // 3. Invoices
  const invoicesCount = salesHistory.length;

  // 4. Total Milk Inflow
  const farmLiters = animals.reduce((s, a) => s + (parseFloat(a.totalDailyYield) || 0), 0);
  const procuredLiters =
    intakeTotals.totalProcuredVolume !== undefined
      ? Number(intakeTotals.totalProcuredVolume)
      : intakeLogs.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
  const totalInflow = farmLiters + procuredLiters;

  const footerCards = [
    {
      id: 'deliveries',
      title: 'Milk Deliveries',
      value: `${deliveryCount} Runs`,
      sub: `${deliveryLiters.toFixed(0)} L dispatched doorstep`,
      icon: Bike,
      color: '#155dfc',
      badge: 'Today Runs',
      to: '/delivery',
    },
    {
      id: 'suppliers',
      title: 'Active Suppliers',
      value: `${activeSuppliers} / ${totalSuppliers}`,
      sub: 'Dairy farmers in supply base',
      icon: Users,
      color: '#009966',
      badge: 'Supply Base',
      to: '/supplier/directory',
    },
    {
      id: 'invoices',
      title: 'Issued Invoices',
      value: `${invoicesCount} Invoices`,
      sub: 'POS counter & receipts',
      icon: FileText,
      color: '#9333ea',
      badge: 'POS Orders',
      to: '/pos',
    },
    {
      id: 'inflow',
      title: 'Total Milk Inflow',
      value: `${totalInflow.toFixed(1)} L`,
      sub: 'Combined farm & dock intake',
      icon: Droplets,
      color: '#0092b8',
      badge: 'Daily Volume',
      to: '/supplier/intake',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
      {footerCards.map((c) => {
        const Icon = c.icon;
        return (
          <Link
            key={c.id}
            to={c.to}
            className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md hover:border-slate-300 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer select-none group"
            style={{ borderTop: `4px solid ${c.color}` }}
          >
            <div className="flex items-start justify-between mb-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                style={{ background: `${c.color}15` }}
              >
                <Icon style={{ width: 16, height: 16, color: c.color }} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md text-slate-600 bg-slate-100 border border-slate-200">
                  {c.badge}
                </span>
                <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            <div>
              <p className="text-2xl font-black text-slate-900 leading-tight tracking-tight mb-0.5 font-display tabular">
                {c.value}
              </p>
              <p className="text-xs font-bold text-slate-700">{c.title}</p>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">{c.sub}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
