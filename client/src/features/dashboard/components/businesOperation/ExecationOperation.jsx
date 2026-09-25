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
    <div className="w-full overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
        {links.map(({ to, label, icon: Icon, color }) => {
          const isActive = pathname === to || pathname.startsWith(to + '/')
          return (
            <NavLink
              key={to}
              to={to}
              className="flex items-center justify-center gap-2 px-4 h-[38px] sm:h-[40px] rounded-full whitespace-nowrap shrink-0 transition-all duration-150 hover:brightness-110 hover:-translate-y-px active:translate-y-0 cursor-pointer shadow-xs"
              style={{
                background: isActive ? color : `${color}dd`,
                boxShadow: isActive ? `0 4px 14px ${color}66` : 'none',
                border: isActive ? '2px solid rgba(255,255,255,0.45)' : '2px solid transparent',
              }}
            >
              <Icon className="w-4 h-4 shrink-0 text-white" />
              <span className="text-xs sm:text-[13px] font-bold text-white leading-none tracking-tight">{label}</span>
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}