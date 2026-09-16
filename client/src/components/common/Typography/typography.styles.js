
// Base font size, weight, and tracking styles per variant
export const variantStyles = {
  // Main page titles (e.g. Dashboard header, Hero title)
  h1: 'text-4xl font-bold tracking-tight',

  // Section headers (e.g. Section titles, Major card headers)
  h2: 'text-3xl font-semibold tracking-tight',

  // Sub-section headers and card titles
  h3: 'text-2xl font-semibold tracking-tight',

  // Small card headings or modal titles
  h4: 'text-xl font-semibold tracking-tight',

  // Sub-headings, list titles, or section labels
  h5: 'text-lg font-semibold',

  // Default body paragraph text
  body: 'text-base font-normal',

  // Compact body text for dense tables, card details, or sidebars
  bodySmall: 'text-sm font-normal',

  // Auxiliary helper text, timestamps, metadata, or footnotes
  caption: 'text-xs font-normal',

  // Form input labels and field headers
  label: 'text-sm font-medium',

  // Category tags, section labels, or uppercase status headers
  overline: 'text-xs font-semibold uppercase tracking-wide',
};

// Default text colors associated with each variant
export const defaultVariantColors = {
  h1: 'text-slate-900',
  h2: 'text-slate-900',
  h3: 'text-slate-900',
  h4: 'text-slate-900',
  h5: 'text-slate-900',
  body: 'text-slate-900',
  bodySmall: 'text-slate-700',
  caption: 'text-slate-500',
  label: 'text-slate-700',
  overline: 'text-slate-400',
};

// Combined variant classes object for quick reference
export const variantClasses = {
  // Main page titles (e.g. Dashboard header, Hero title)
  h1: `${variantStyles.h1} ${defaultVariantColors.h1}`,

  // Section headers (e.g. Section titles, Major card headers)
  h2: `${variantStyles.h2} ${defaultVariantColors.h2}`,

  // Sub-section headers and card titles
  h3: `${variantStyles.h3} ${defaultVariantColors.h3}`,

  // Small card headings or modal titles
  h4: `${variantStyles.h4} ${defaultVariantColors.h4}`,

  // Sub-headings, list titles, or section labels
  h5: `${variantStyles.h5} ${defaultVariantColors.h5}`,

  // Default body paragraph text
  body: `${variantStyles.body} ${defaultVariantColors.body}`,

  // Compact body text for dense tables, card details, or sidebars
  bodySmall: `${variantStyles.bodySmall} ${defaultVariantColors.bodySmall}`,

  // Auxiliary helper text, timestamps, metadata, or footnotes
  caption: `${variantStyles.caption} ${defaultVariantColors.caption}`,

  // Form input labels and field headers
  label: `${variantStyles.label} ${defaultVariantColors.label}`,

  // Category tags, section labels, or uppercase status headers
  overline: `${variantStyles.overline} ${defaultVariantColors.overline}`,
};

// Color overrides mapped to sensible Tailwind text color classes
export const colorClasses = {
  default: 'text-slate-900',
  muted: 'text-slate-500',
  inverted: 'text-white',
  danger: 'text-red-600',
  accent: 'text-emerald-600',
};

// Default HTML elements to render for each variant
export const defaultTags = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  body: 'p',
  bodySmall: 'p',
  caption: 'span',
  label: 'label',
  overline: 'span',
};
