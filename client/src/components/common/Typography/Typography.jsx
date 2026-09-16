
import React from 'react';
import {
  variantStyles,
  defaultVariantColors,
  colorClasses,
  defaultTags,
} from './typography.styles';

export default function Typography({
  variant = 'body',
  color,
  as,
  className = '',
  children,
  ...props
}) {
  // Determine HTML tag to render
  const Component = as || defaultTags[variant] || 'p';

  // Base typography classes (font size, weight, tracking)
  const baseStyle = variantStyles[variant] || variantStyles.body;

  // Resolve color: explicit color prop override > variant's default color
  const colorStyle = color
    ? colorClasses[color] || color
    : defaultVariantColors[variant] || defaultVariantColors.body;

  // Merge classes cleanly
  const combinedClasses = `${baseStyle} ${colorStyle} ${className}`.trim();

  return (
    <Component className={combinedClasses} {...props}>
      {children}
    </Component>
  );
}
