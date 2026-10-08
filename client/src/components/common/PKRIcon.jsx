import React from 'react';
import { Banknote } from 'lucide-react';

/**
 * PKRIcon / Banknote - Universal Currency & Money Icon
 * Uses Lucide Banknote icon everywhere money or Rs is represented.
 */
export function PKRIcon({ className = 'w-4 h-4', size, style, strokeWidth = 2, ...props }) {
  return (
    <Banknote
      className={className}
      size={size}
      strokeWidth={strokeWidth}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      {...props}
    />
  );
}

export const RupeeIcon = PKRIcon;
export default PKRIcon;
