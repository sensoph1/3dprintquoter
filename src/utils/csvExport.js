import { calculateEventMetrics } from './eventMetrics';

/**
 * Escape a value for CSV: wrap in quotes if it contains commas, quotes, or newlines.
 */
const escapeCSV = (value) => {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
};

/**
 * Convert headers + rows into a CSV string.
 */
export const arrayToCSV = (headers, rows) => {
  const lines = [headers.map(escapeCSV).join(',')];
  for (const row of rows) {
    lines.push(row.map(escapeCSV).join(','));
  }
  return lines.join('\n');
};

/**
 * Trigger a browser download of a CSV string.
 */
export const downloadCSV = (filename, csvString) => {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Filter items by date range. Parser handles both locale strings ("1/15/2025") and ISO ("2025-01-15").
 */
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  // Try ISO first
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return new Date(dateStr + 'T00:00:00');
  // Try locale string (M/D/YYYY)
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

const filterByDateRange = (items, dateField, from, to) => {
  if (!from && !to) return items;
  const fromDate = from ? new Date(from + 'T00:00:00') : null;
  const toDate = to ? new Date(to + 'T23:59:59') : null;
  return items.filter(item => {
    const d = parseDate(item[dateField]);
    if (!d) return true;
    if (fromDate && d < fromDate) return false;
    if (toDate && d > toDate) return false;
    return true;
  });
};

/**
 * Format sales data as CSV.
 */
export const formatSalesCSV = (sales, events, dateRange) => {
  const filtered = filterByDateRange(sales, 'date', dateRange?.from, dateRange?.to);
  const getEventName = (eventId) => {
    const event = events.find(e => e.id === eventId);
    return event ? event.name : '';
  };

  const headers = ['Date', 'Item', 'Qty', 'Unit Price', 'Total', 'Payment', 'Event', 'Source', 'Square Order ID', 'Notes'];
  const rows = filtered.map(s => [
    s.date || '',
    s.itemName || '',
    s.quantity || 1,
    (s.unitPrice || 0).toFixed(2),
    (s.total || 0).toFixed(2),
    s.paymentMethod || '',
    s.eventId ? getEventName(s.eventId) : '',
    s.squareSource ? 'Square' : 'Manual',
    s.squareOrderId || '',
    s.notes || '',
  ]);

  return arrayToCSV(headers, rows);
};

/**
 * Format estimates/quote history as CSV.
 */
export const formatEstimatesCSV = (history, events, dateRange) => {
  const filtered = filterByDateRange(history, 'date', dateRange?.from, dateRange?.to);
  const getEventName = (eventId) => {
    const event = events.find(e => e.id === eventId);
    return event ? event.name : '';
  };

  const headers = ['Date', 'Quote No', 'Name', 'Category', 'Status', 'Qty', 'Hours', 'Labor Mins', 'Cost', 'Margin Price', 'Hourly Price', 'Material Price', 'Event', 'Notes'];
  const rows = filtered.map(h => [
    h.date || '',
    h.quoteNo || '',
    h.name || '',
    h.category || '',
    h.status || 'draft',
    h.details?.qty || 1,
    h.details?.hours || 0,
    h.details?.laborMinutes || 0,
    (h.costPerItem || 0).toFixed(2),
    (h.priceByProfitMargin || h.unitPrice || 0).toFixed(2),
    (h.priceByHourlyRate || 0).toFixed(2),
    (h.priceByMaterialMultiplier || 0).toFixed(2),
    h.eventId ? getEventName(h.eventId) : '',
    h.notes || '',
  ]);

  return arrayToCSV(headers, rows);
};

/**
 * Format printed parts inventory as CSV.
 */
export const formatPrintedPartsCSV = (printedParts) => {
  const headers = ['Name', 'Category', 'Color', 'Qty', 'Margin Price', 'Hourly Price', 'Material Price', 'Stock Value'];
  const rows = printedParts.map(p => {
    const price = p.priceByProfitMargin || p.unitPrice || 0;
    return [
      p.name || '',
      p.category || '',
      p.color || '',
      p.qty || 0,
      price.toFixed(2),
      (p.priceByHourlyRate || 0).toFixed(2),
      (p.priceByMaterialMultiplier || 0).toFixed(2),
      (price * (p.qty || 0)).toFixed(2),
    ];
  });

  return arrayToCSV(headers, rows);
};

/**
 * Format consumables inventory as CSV.
 */
export const formatConsumablesCSV = (inventory) => {
  const headers = ['Name', 'Qty', 'Unit Cost', 'Threshold', 'Stock Value'];
  const rows = inventory.map(i => [
    i.name || '',
    i.qty || 0,
    (i.unitCost || 0).toFixed(2),
    i.lowStockThreshold || 10,
    ((i.unitCost || 0) * (i.qty || 0)).toFixed(2),
  ]);

  return arrayToCSV(headers, rows);
};

/**
 * Format events summary as CSV.
 */
export const formatEventsCSV = (events, sales, history) => {
  const headers = ['Name', 'Start Date', 'End Date', 'Days', 'Location', 'Booth Fee', 'Other Costs', 'Total Costs', 'Revenue', 'Revenue/Day', 'COGS', 'Net Profit', 'Profit/Day', 'Margin %', 'Items Sold', 'Notes'];
  const rows = events.map(event => {
    const metrics = calculateEventMetrics(event, sales, history);
    return [
      event.name || '',
      event.date || '',
      event.endDate || '',
      metrics.days,
      event.location || '',
      (event.boothFee || 0).toFixed(2),
      (event.otherCosts || 0).toFixed(2),
      metrics.eventCosts.toFixed(2),
      metrics.grossRevenue.toFixed(2),
      metrics.revenuePerDay.toFixed(2),
      metrics.totalCOGS.toFixed(2),
      metrics.netProfit.toFixed(2),
      metrics.profitPerDay.toFixed(2),
      metrics.profitMargin.toFixed(1),
      metrics.itemsSold,
      event.notes || '',
    ];
  });

  return arrayToCSV(headers, rows);
};

/**
 * Format materials/filaments as CSV.
 */
export const formatMaterialsCSV = (filaments) => {
  const headers = ['Name', 'Color Name', 'Price', 'Grams', 'Cost/Gram'];
  const rows = filaments.map(f => [
    f.name || '',
    f.colorName || '',
    (f.price || 0).toFixed(2),
    f.grams || 1000,
    ((f.price || 0) / (f.grams || 1000)).toFixed(4),
  ]);

  return arrayToCSV(headers, rows);
};

/**
 * Format printers as CSV.
 */
export const formatPrintersCSV = (printers) => {
  const headers = ['Name', 'Make/Model', 'Watts', 'Cost', 'Hours of Life', 'Depreciation/Hour'];
  const rows = printers.map(p => [
    p.name || '',
    p.makeModel || '',
    p.watts || 0,
    (p.cost || 0).toFixed(2),
    p.hoursOfLife || 0,
    p.hoursOfLife ? ((p.cost || 0) / p.hoursOfLife).toFixed(4) : '0',
  ]);

  return arrayToCSV(headers, rows);
};

/**
 * Create a full JSON backup of all data.
 */
export const createJSONBackup = (library, history) => {
  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    library,
    history,
  };
  return JSON.stringify(backup, null, 2);
};

/**
 * Download a JSON backup file.
 */
export const downloadJSONBackup = (library, history) => {
  const json = createJSONBackup(library, history);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `printprice-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Parse and validate a JSON backup file.
 * Returns { valid: boolean, data?: { library, history }, error?: string }
 */
export const parseJSONBackup = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);

    // Basic validation
    if (!data.library || typeof data.library !== 'object') {
      return { valid: false, error: 'Invalid backup: missing library data' };
    }

    // Check for required library fields
    const requiredFields = ['filaments', 'printers'];
    for (const field of requiredFields) {
      if (!Array.isArray(data.library[field])) {
        return { valid: false, error: `Invalid backup: missing ${field}` };
      }
    }

    return {
      valid: true,
      data: {
        library: data.library,
        history: Array.isArray(data.history) ? data.history : [],
      },
    };
  } catch (e) {
    return { valid: false, error: 'Invalid JSON format' };
  }
};
