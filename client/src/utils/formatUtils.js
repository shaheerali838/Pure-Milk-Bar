/**
 * Currency & Metric Formatting Utilities
 * 
 * Standardizes display formatting across all metric cards and dashboards:
 * Moves negative sign directly adjacent to the numeric value after the "Rs." symbol.
 * 
 * Examples:
 *   formatCurrency(-44155)             => "Rs. -44,155"
 *   formatCurrency(44155)              => "Rs. 44,155"
 *   formatCurrency(44155, { withPlus: true }) => "Rs. +44,155"
 */

export function formatCurrency(val, { withPlus = false, decimals = 0 } = {}) {
  const num = Number(val) || 0;
  const isNegative = num < 0;
  const absVal = Math.abs(num);
  const formattedAbs =
    decimals > 0
      ? absVal.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : Math.round(absVal).toLocaleString();

  if (isNegative) {
    return `Rs. -${formattedAbs}`;
  }
  if (withPlus && num > 0) {
    return `Rs. +${formattedAbs}`;
  }
  return `Rs. ${formattedAbs}`;
}

export function formatPKR(val, options) {
  return formatCurrency(val, options);
}
