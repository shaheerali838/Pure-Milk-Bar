import React from 'react';
import { Droplets, Layers, CheckCircle2, ShoppingBag, Truck, ChevronRight } from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';

export default function POSCardOverflow({ onSelectSource }) {
  const { inventoryMetrics, farmSalesMetrics, supplierSalesMetrics } = usePOSContext();

  const cards = [
    {
      id: 'farm_sales',
      title: 'Farm Milk Sales',
      amount: `Rs. ${(farmSalesMetrics?.totalRevenue || 0).toLocaleString()}`,
      sub: `${farmSalesMetrics?.milkSold || 0} L Milk • ${farmSalesMetrics?.dahiSold || 0} kg Dahi`,
      icon: Droplets,
      color: '#009966',
      badge: 'Farm Milk',
      clickable: true,
      onClick: () => onSelectSource && onSelectSource('farm'),
    },
    {
      id: 'supplier_sales',
      title: 'Supplier Milk Sales',
      amount: `Rs. ${(supplierSalesMetrics?.totalRevenue || 0).toLocaleString()}`,
      sub: `${supplierSalesMetrics?.milkSold || 0} L Milk • ${supplierSalesMetrics?.dahiSold || 0} kg Dahi`,
      icon: Truck,
      color: '#155dfc',
      badge: 'Supplier Milk',
      clickable: true,
      onClick: () => onSelectSource && onSelectSource('supplier'),
    },
    {
      id: 'milk_sold',
      title: 'Total Milk Sold',
      amount: `${inventoryMetrics.milkSold} L`,
      sub: `Rs. ${(Number(inventoryMetrics.totalMilkPrice) || 0).toLocaleString()} Total Sales`,
      icon: CheckCircle2,
      color: '#4f39f6',
      badge: 'Milk Sold',
      clickable: true,
      onClick: () => onSelectSource && onSelectSource('all'),
    },
    {
      id: 'dahi_sold',
      title: 'Total Dahi Sold',
      amount: `${inventoryMetrics.dahiSold} kg`,
      sub: `Rs. ${(Number(inventoryMetrics.totalDahiPrice) || 0).toLocaleString()} Total Sales`,
      icon: ShoppingBag,
      color: '#8b5cf6',
      badge: 'Dahi Sold',
      clickable: true,
      onClick: () => onSelectSource && onSelectSource('all'),
    },
    {
      id: 'total_milk',
      title: 'Farm Milk Stock',
      amount: `${inventoryMetrics?.totalMilk ?? 0} L`,
      sub: inventoryMetrics?.totalFarmYield ? `Barn Yield: ${Number(inventoryMetrics.totalFarmYield).toFixed(1)}L` : 'Remaining in Farm Barn',
      icon: Droplets,
      color: '#009689',
      badge: 'Farm Stock',
      clickable: true,
      onClick: () => onSelectSource && onSelectSource('farm'),
    },
    {
      id: 'total_supplier_milk',
      title: 'Supplier Milk Stock',
      amount: `${inventoryMetrics?.supplierMilkStock ?? 0} L`,
      sub: inventoryMetrics?.totalSupplierIntake ? `Chiller Intake: ${Number(inventoryMetrics.totalSupplierIntake).toFixed(1)}L` : 'Remaining in Chiller',
      icon: Truck,
      color: '#0284c7',
      badge: 'Supplier Stock',
      clickable: true,
      onClick: () => onSelectSource && onSelectSource('supplier'),
    },
    {
      id: 'total_dahi',
      title: 'Total Dahi Stock',
      amount: `${inventoryMetrics?.totalDahi ?? 0} kg`,
      sub: `In Cold Storage`,
      icon: Layers,
      color: '#f59e0b',
      badge: 'Dahi Stock',
      clickable: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-2.5">
      {cards.map(({ id, title, amount, sub, icon: Icon, color, badge, clickable, onClick }) => (
        <div
          key={id}
          onClick={clickable ? onClick : undefined}
          role={clickable ? 'button' : undefined}
          tabIndex={clickable ? 0 : undefined}
          onKeyDown={clickable ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
          className={`flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs transition-all duration-200 ${
            clickable
              ? 'cursor-pointer hover:shadow-md hover:scale-[1.01] hover:border-slate-300'
              : 'hover:shadow-xs'
          }`}
          style={{ borderTop: `3.5px solid ${color}` }}
        >
          <div className="flex items-start justify-between mb-1.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
              style={{ background: `${color}15` }}
            >
              <Icon style={{ width: 15, height: 15, color }} />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md text-slate-600 bg-slate-100 border border-slate-200/80">
                {badge}
              </span>
              {clickable && <ChevronRight className="w-3 h-3 text-slate-400" />}
            </div>
          </div>

          <div>
            <p className="text-lg font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
              {amount}
            </p>
            <p className="text-xs font-bold text-slate-800">{title}</p>
            <p className="text-[10px] font-medium text-slate-400 line-clamp-1">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
