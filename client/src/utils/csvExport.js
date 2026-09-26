/**
 * Pure Milk Bar ERP - Professional CSV Export Engine
 * 
 * Features:
 * - RFC 4180 compliant CSV string generation and escaping
 * - UTF-8 Byte Order Mark (\uFEFF) for flawless Excel, Google Sheets, & Numbers compatibility
 * - Currency & special characters support (Urdu text, PKR, Rs., symbols)
 * - Safe null/undefined handling (zero crashes on missing fields)
 * - Professional report headers (Title, Metadata, Date Filters, Generation Timestamps)
 * - Summary & totals rows support
 * - Multi-section & bundle export formatting
 */

/**
 * Escapes a single cell according to RFC 4180 rules.
 * @param {*} val 
 * @returns {string} Escaped cell string wrapped in quotes if necessary
 */
export function escapeCell(val) {
  if (val === null || val === undefined) {
    return '""';
  }

  // Handle arrays or objects safely
  let str;
  if (Array.isArray(val)) {
    str = val.map((item) => (item !== null && item !== undefined ? String(item) : '')).join('; ');
  } else if (typeof val === 'object' && !(val instanceof Date)) {
    str = JSON.stringify(val);
  } else {
    str = String(val);
  }

  // If cell contains commas, quotes, newlines, carriage returns, or semicolons
  if (
    str.includes(',') ||
    str.includes('"') ||
    str.includes('\n') ||
    str.includes('\r') ||
    str.includes(';')
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  // Avoid CSV formula injection for cells starting with =, +, -, @
  if (/^[=+\-@]/.test(str)) {
    return `"\t${str.replace(/"/g, '""')}"`;
  }

  return `"${str}"`;
}

/**
 * Builds a clean, standardized filename with date stamp.
 * @param {string} filename 
 * @returns {string} Formatted filename ending in .csv
 */
export function formatCsvFilename(filename) {
  const baseName = (filename || 'export')
    .trim()
    .replace(/\.csv$/i, '')
    .replace(/[^a-zA-Z0-9_\-\.]/g, '_')
    .replace(/_+/g, '_');

  const today = new Date().toISOString().split('T')[0];
  if (!baseName.includes(today)) {
    return `${baseName}_${today}.csv`;
  }
  return `${baseName}.csv`;
}

/**
 * Initiates browser download of CSV string with UTF-8 BOM.
 * @param {string} filename 
 * @param {string} csvContent 
 */
export function triggerCsvDownload(filename, csvContent) {
  if (!csvContent) return;

  const finalFilename = formatCsvFilename(filename);
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', finalFilename);
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Exports a single tabular dataset with optional report title, metadata, and summary rows.
 * @param {Object} params
 * @param {string} params.filename - Base filename for export
 * @param {string} [params.title] - Document title displayed at top
 * @param {Array<[string, *]>} [params.metadata] - Key-value metadata rows (e.g. [['Report Date', '2026-09-26']])
 * @param {Array<string>} params.headers - Array of column header names
 * @param {Array<Array<*>>|Array<Object>} params.rows - Array of data rows (arrays or objects matching headers)
 * @param {Array<Array<*>>} [params.summaryRows] - Summary / totals rows appended at bottom
 */
export function exportTableToCSV({
  filename = 'report',
  title = '',
  metadata = [],
  headers = [],
  rows = [],
  summaryRows = [],
}) {
  const lines = [];

  // 1. Report Title Header
  if (title) {
    lines.push([escapeCell(`PURE MILK BAR ERP — ${title.toUpperCase()}`)]);
    lines.push([escapeCell(`Generated On: ${new Date().toLocaleString()}`)]);
    lines.push(['']);
  }

  // 2. Metadata Key-Value pairs
  if (metadata && metadata.length > 0) {
    metadata.forEach(([key, val]) => {
      lines.push([escapeCell(key), escapeCell(val)]);
    });
    lines.push(['']);
  }

  // 3. Table Column Headers
  if (headers && headers.length > 0) {
    lines.push(headers.map(escapeCell));
  }

  // 4. Data Rows
  (rows || []).forEach((row) => {
    if (Array.isArray(row)) {
      lines.push(row.map(escapeCell));
    } else if (typeof row === 'object' && row !== null) {
      lines.push(headers.map((h) => escapeCell(row[h] ?? '')));
    }
  });

  // 5. Summary / Totals Rows
  if (summaryRows && summaryRows.length > 0) {
    lines.push(['']);
    summaryRows.forEach((sRow) => {
      lines.push(sRow.map(escapeCell));
    });
  }

  const csvContent = lines.map((line) => (Array.isArray(line) ? line.join(',') : line)).join('\r\n');
  triggerCsvDownload(filename, csvContent);
}

/**
 * Exports a multi-section document containing multiple structured tables.
 * Ideal for Daily Master Sheets, Daily Closing, and All Modules Complete Bundle.
 * 
 * @param {Object} params
 * @param {string} params.filename - Export filename
 * @param {string} [params.title] - Global report title
 * @param {Array<[string, *]>} [params.metadata] - Global metadata
 * @param {Array<Object>} params.sections - Array of section objects:
 *   {
 *     title: string,
 *     description?: string,
 *     headers?: Array<string>,
 *     rows?: Array<Array<*>>,
 *     summaryRows?: Array<Array<*>>,
 *   }
 */
export function exportMultiSectionCSV({
  filename = 'master_report',
  title = 'Pure Milk Bar ERP — Master Multi-Module System Report',
  metadata = [],
  sections = [],
}) {
  const lines = [];

  // Global Header
  if (title) {
    lines.push([escapeCell(`================================================================================`)]);
    lines.push([escapeCell(title.toUpperCase())]);
    lines.push([escapeCell(`System Export Date & Time: ${new Date().toLocaleString()}`)]);
    lines.push([escapeCell(`Status: Complete System Data Synchronized`)]);
    lines.push([escapeCell(`================================================================================`)]);
    lines.push(['']);
  }

  // Global Metadata
  if (metadata && metadata.length > 0) {
    metadata.forEach(([k, v]) => {
      lines.push([escapeCell(k), escapeCell(v)]);
    });
    lines.push(['']);
  }

  // Sections
  sections.forEach((sec, idx) => {
    if (!sec) return;

    // Section Header Separator
    lines.push([escapeCell(`--------------------------------------------------------------------------------`)]);
    lines.push([escapeCell(`SECTION ${idx + 1}: ${(sec.title || 'Data Section').toUpperCase()}`)]);
    if (sec.description) {
      lines.push([escapeCell(`Notes: ${sec.description}`)]);
    }
    lines.push([escapeCell(`--------------------------------------------------------------------------------`)]);

    // Section Column Headers
    if (sec.headers && sec.headers.length > 0) {
      lines.push(sec.headers.map(escapeCell));
    }

    // Section Data Rows
    if (sec.rows && sec.rows.length > 0) {
      sec.rows.forEach((r) => {
        if (Array.isArray(r)) {
          lines.push(r.map(escapeCell));
        } else if (typeof r === 'object' && r !== null && sec.headers) {
          lines.push(sec.headers.map((h) => escapeCell(r[h] ?? '')));
        }
      });
    } else {
      lines.push([escapeCell('No records found for this section in the selected date range.')]);
    }

    // Section Summary Rows
    if (sec.summaryRows && sec.summaryRows.length > 0) {
      lines.push(['']);
      sec.summaryRows.forEach((sRow) => {
        lines.push(sRow.map(escapeCell));
      });
    }

    lines.push(['']);
    lines.push(['']);
  });

  const csvContent = lines.map((line) => (Array.isArray(line) ? line.join(',') : line)).join('\r\n');
  triggerCsvDownload(filename, csvContent);
}

export default {
  escapeCell,
  formatCsvFilename,
  triggerCsvDownload,
  exportTableToCSV,
  exportMultiSectionCSV,
};
