import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

/**
 * Reusable SubNav Component
 * 
 * Supports both colorful custom tab themes and standardized neutral themes.
 * When tab.color is defined, applies the distinct vibrant color palette.
 */
export default function SubNav({
  tabs = [],
  variant = 'navy',
  size = 'default',
  className = '',
}) {
  const { pathname } = useLocation();

  const variantStyles = {
    navy: 'bg-[#1a2340] text-white shadow-xs border-transparent',
    emerald: 'bg-emerald-700 text-white shadow-xs border-transparent',
    dark: 'bg-slate-900 text-white shadow-xs border-transparent',
    primary: 'bg-emerald-600 text-white shadow-xs border-transparent',
  };

  const activeFallbackStyle = variantStyles[variant] || variantStyles.navy;

  const sizeStyles = {
    default: 'px-4 h-9.5 sm:h-10 text-xs sm:text-[13px] gap-2',
    sm: 'px-3 h-8 text-xs gap-1.5',
    compact: 'px-3.5 h-8.5 text-xs gap-1.5',
  };

  const currentSize = sizeStyles[size] || sizeStyles.default;

  return (
    <nav
      aria-label="Sub Navigation"
      className={`w-full overflow-x-auto no-scrollbar py-1 ${className}`}
    >
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
        {tabs.map((tab) => {
          const { id, to, aliasTo, label, icon: Icon, color, match, badge } = tab;

          // Compute active status
          let isActive = false;
          if (typeof match === 'function') {
            isActive = match(pathname);
          } else if (aliasTo) {
            const aliases = Array.isArray(aliasTo) ? aliasTo : [aliasTo];
            isActive =
              pathname === to ||
              pathname === `${to}/` ||
              aliases.some(
                (alias) =>
                  pathname === alias ||
                  pathname === `${alias}/` ||
                  pathname.startsWith(`${alias}/`)
              ) ||
              (to !== '/' && pathname.startsWith(`${to}/`));
          } else {
            isActive =
              pathname === to ||
              pathname === `${to}/` ||
              (to !== '/' && to !== '/dashboard' && pathname.startsWith(`${to}/`));
          }

          if (color) {
            // Distinct tab coloring
            return (
              <NavLink
                key={id || to}
                to={to}
                className={`inline-flex items-center justify-center font-bold rounded-full whitespace-nowrap shrink-0 transition-all duration-150 select-none cursor-pointer text-white hover:brightness-110 ${currentSize}`}
                style={{
                  backgroundColor: isActive ? color : `${color}dd`,
                  border: isActive
                    ? '2px solid rgba(255, 255, 255, 0.45)'
                    : '2px solid transparent',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                {Icon && <Icon className="w-4 h-4 shrink-0 text-white" />}
                <span>{label}</span>
                {badge !== undefined && badge !== null && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-white/20 text-white">
                    {badge}
                  </span>
                )}
              </NavLink>
            );
          }

          // Fallback neutral theme
          return (
            <NavLink
              key={id || to}
              to={to}
              className={`inline-flex items-center justify-center font-semibold rounded-full whitespace-nowrap shrink-0 transition-all duration-150 select-none cursor-pointer border ${currentSize} ${
                isActive
                  ? `${activeFallbackStyle} font-bold`
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200/60'
              }`}
            >
              {Icon && (
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                  }`}
                />
              )}
              <span>{label}</span>
              {badge !== undefined && badge !== null && (
                <span
                  className={`ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
