import { Bike, Layers, Milk, ShoppingCart, Tractor, Truck } from 'lucide-react'
import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const links = [
  { to: '/farm',                  label: 'Farm Operation',    icon: Tractor,      color: '#009966' },
  { to: '/supplier',              label: 'Supplier Sourcing', icon: Truck,        color: '#155dfc' },
  { to: '/proccessing',           label: 'Dahi Processing',   icon: Layers,       color: '#009689' },
  { to: '/pos',                   label: 'Counting POS',      icon: ShoppingCart, color: '#4f39f6' },
  { to: '/delivery',              label: 'DoorStep Delivery', icon: Bike,         color: '#9810fa' },
  { to: '/customer-khata-ledger', label: 'Khata',             icon: Milk,         color: '#0092b8' },
]

export const ExecationOperation = () => {
  const { pathname } = useLocation()

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1.5">
      {links.map(({ to, label, icon: Icon, color }) => {
        const isActive = pathname === to || pathname.startsWith(to + '/')
        return (
          <NavLink
            key={to}
            to={to}
            className="flex items-center justify-center gap-1.5 px-3.5 h-[38px] rounded-full whitespace-nowrap cursor-pointer"
            style={{
              background: isActive ? color : `${color}dd`,
              boxShadow: isActive ? `0 4px 16px ${color}55` : 'none',
              border: isActive ? '2px solid rgba(255,255,255,0.28)' : '2px solid transparent',
            }}
          >
            <Icon className="w-[14px] h-[14px] shrink-0 text-white" />
            <span className="text-[12px] sm:text-[13px] font-semibold text-white leading-none">{label}</span>
          </NavLink>
        )
      })}
    </div>
  )
}