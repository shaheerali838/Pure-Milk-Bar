import { Layers, ShoppingCart, Bike, Milk } from "lucide-react";



export const saleInformation = [
    {
      id: 'Sale',
      name: 'Dahi & Milk Proccessing',
      icon: Layers,
      path: '/proccessing',
      iconBg: 'bg-[#f0f4f9]',
      iconColor: 'text-[#486581]',
      iconBorder: 'border border-[#e2e8f0]',
      activeBg: 'bg-black text-white shadow-md shadow-black/20',
      activeBadgeBg: 'bg-neutral-800 text-white',
    },
    {
      id: 'Counter',
      name: 'Counter POS & Sales',
      icon: ShoppingCart,
      path: '/pos',
      iconBg: 'bg-[#eafaf1]',
      iconColor: 'text-[#10b981]',
      iconBorder: 'border border-[#c6f6d5]',
      activeBg: 'bg-[#009966] text-white shadow-md shadow-emerald-500/20',
      activeBadgeBg: 'bg-[#007a52] text-white',
    },
    {
      id: 'Doorstep',
      name: 'Doorstep Deliveries',
      icon: Bike,
      path: '/delivery',
      iconBg: 'bg-[#eef4ff]',
      iconColor: 'text-[#2563eb]',
      iconBorder: 'border border-[#dbeafe]',
      activeBg: 'bg-[#1864f7] text-white shadow-md shadow-blue-500/25',
      activeBadgeBg: 'bg-[#0f4ec4] text-white',
    },
    {
      id: 'Products',
      name: 'Products & Pricing',
      icon: Milk,
      path: '/products',
      iconBg: 'bg-[#eef4ff]',
      iconColor: 'text-[#2563eb]',
      iconBorder: 'border border-[#dbeafe]',
      activeBg: 'bg-[#1864f7] text-white shadow-md shadow-blue-500/25',
      activeBadgeBg: 'bg-[#0f4ec4] text-white',
    },
  ];