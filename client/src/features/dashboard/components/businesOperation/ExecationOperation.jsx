import { Bike, Box, Layers, Milk, ShoppingCart, Tractor, Truck } from 'lucide-react'
import React from 'react'
import { NavLink } from 'react-router-dom'

export const ExecationOperation = () => {

  return (
    <div>
        <div className='border rounded-xl p-4 bg-white shadow-sm '>
            <p className='font-semibold text-sm text-slate-700 mb-4'>Executive Business Operations</p>
            <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-1'>
                <NavLink to="/farm" className='bg-[#009966]/90 flex items-center justify-center h-10 gap-1 hover:bg-[#009966] border rounded-xl transition-colors cursor-pointer'>
                    <Tractor className='text-white w-5 h-5 shrink-0' />
                    <p className='font-semibold text-sm text-white'>Farm </p>
                </NavLink>
                <NavLink to="/supplier" className='bg-[#155dfc]/90  flex items-center justify-center gap-2 hover:bg-[#155dfc] border rounded-xl h-10 transition-colors cursor-pointer'>
                    <Truck className='text-white w-5 h-5 shrink-0' />
                    <p className='font-semibold text-sm text-white'>Supplier</p>
                </NavLink>
                <NavLink to="/proccessing" className='bg-[#009689]/90  flex items-center justify-center gap-2 hover:bg-[#009689] border rounded-xl h-10 transition-colors cursor-pointer'>
                    <Layers className='text-white w-5 h-5 shrink-0' />
                    <p className='font-semibold text-sm text-white'>Dahi</p>
                </NavLink>
                <NavLink to="/pos" className='bg-[#4f39f6]/90  flex items-center justify-center gap-2 hover:bg-[#4f39f6] border rounded-xl h-10 transition-colors cursor-pointer'>
                    <ShoppingCart className='text-white w-5 h-5 shrink-0' />
                    <p className='font-semibold text-sm text-white'>POS</p>
                </NavLink>
                <NavLink to="/delivery" className='bg-[#9810fa]/90  flex items-center justify-center gap-2 hover:bg-[#9810fa] border rounded-xl h-10 transition-colors cursor-pointer'>
                    <Bike className='text-white w-5 h-5 shrink-0' />
                    <p className='font-semibold text-sm text-white'>Delivery</p>
                </NavLink>
                <NavLink to="/products" className='bg-[#0092b8]/90  flex items-center justify-center gap-2 hover:bg-[#0092b8] border rounded-xl h-10 transition-colors cursor-pointer'>
                    <Milk className='text-white w-5 h-5 shrink-0' />
                    <p className='font-semibold text-sm text-white'>Khata</p>
                </NavLink>
                <NavLink to="/supplier" className=' bg-[#e17100]/90 flex items-center justify-center gap-2 hover:bg-[#e17100] border rounded-xl h-10 transition-colors cursor-pointer'>
                    <Box className='text-white w-5 h-5 shrink-0' />
                    <p className='font-semibold text-sm text-white'>Daily Closing</p>
                </NavLink>
            </div>
        </div>
    </div>
  )
}