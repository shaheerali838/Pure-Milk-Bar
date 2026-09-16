export function exportToCSV(filename, headers, rows) {
  if (!headers || !headers.length) return;

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  const headerRow = headers.map(escapeCell).join(',');
  const dataRows = (rows || []).map((row) =>
    (Array.isArray(row) ? row : headers.map((h) => row[h] ?? '')).map(escapeCell).join(',')
  );

  const csvContent = [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const cleanFilename = (filename || 'export')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/gi, '_')
    .replace(/_+/g, '_');

  const today = new Date().toISOString().split('T')[0];
  const finalFilename = `${cleanFilename}_${today}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', finalFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default exportToCSV;
