import React from 'react';

/**
 * PKRIcon - Pakistani Rupee (₨ / Rs) Currency Icon
 * Pure vector SVG that matches Lucide icons styling (strokeWidth 2, rounded caps).
 * Replaces generic DollarSign ($) with official Pakistani Currency symbol.
 */
export function PKRIcon({ className = 'w-4 h-4', size, style, strokeWidth = 2, ...props }) {
  const pixelSize = typeof size === 'number' ? size : undefined;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={pixelSize}
      height={pixelSize}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="PKR Currency (₨)"
      {...props}
    >
      {/* Letter 'R' */}
      <path d="M4 4.5v15" />
      <path d="M4 4.5h5.2a3.5 3.5 0 0 1 3.5 3.5v0a3.5 3.5 0 0 1-3.5 3.5H4" />
      <path d="M9.5 11.5l3.8 8" />
      {/* Currency crossbar on R */}
      <path d="M2.5 8h9.5" />
      {/* Letter 's' */}
      <path d="M15.8 15.2c.4-.7 1.2-1.2 2.1-1.2 1.2 0 2 .7 2 1.6 0 1.8-3.8 1.3-3.8 3.2 0 .9.8 1.5 2 1.5.9 0 1.7-.4 2.2-1" />
    </svg>
  );
}

export const RupeeIcon = PKRIcon;
export default PKRIcon;
