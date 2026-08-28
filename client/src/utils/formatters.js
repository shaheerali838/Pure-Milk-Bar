export const formatPKR = (amount) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const formatKgOrLiter = (qty, unit = 'kg') => {
  return `${Number(qty || 0).toFixed(2)} ${unit}`;
};