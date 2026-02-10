/**
 * Calculate number of days for an event
 */
export const getEventDays = (event) => {
  if (!event.endDate || event.endDate === event.date) return 1;
  const start = new Date(event.date + 'T00:00:00');
  const end = new Date(event.endDate + 'T00:00:00');
  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
};

/**
 * Calculate financial metrics for an event by combining sales records and legacy history entries.
 */
export const calculateEventMetrics = (event, sales, history) => {
  const linkedSalesRecords = sales.filter(s => s.eventId === event.id);
  const linkedHistoryItems = history.filter(h => h.eventId === event.id && h.status === 'sold');

  const salesRevenue = linkedSalesRecords.reduce((sum, s) => sum + (s.total || 0), 0);
  const salesItemCount = linkedSalesRecords.reduce((sum, s) => sum + (s.quantity || 1), 0);

  const historyRevenue = linkedHistoryItems.reduce((sum, h) => {
    const qty = h.details?.qty || 1;
    return sum + (h.unitPrice * qty);
  }, 0);
  const historyItemCount = linkedHistoryItems.reduce((sum, h) => sum + (h.details?.qty || 1), 0);
  const totalCOGS = linkedHistoryItems.reduce((sum, h) => {
    const qty = h.details?.qty || 1;
    return sum + ((h.costPerItem || 0) * qty);
  }, 0);

  const grossRevenue = salesRevenue + historyRevenue;
  const eventCosts = (parseFloat(event.boothFee) || 0) + (parseFloat(event.otherCosts) || 0);
  const netProfit = grossRevenue - eventCosts - totalCOGS;
  const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;
  const itemsSold = salesItemCount + historyItemCount;

  const linkedSales = [
    ...linkedSalesRecords.map(s => ({
      id: s.id,
      name: s.itemName,
      quoteNo: s.squareSource ? `SQ-${(s.squareOrderId || '').slice(-6)}` : 'Manual',
      unitPrice: s.unitPrice,
      details: { qty: s.quantity },
    })),
    ...linkedHistoryItems,
  ];

  // Per-day metrics for multi-day events
  const days = getEventDays(event);
  const revenuePerDay = grossRevenue / days;
  const profitPerDay = netProfit / days;

  return { grossRevenue, totalCOGS, eventCosts, netProfit, profitMargin, itemsSold, salesCount: linkedSales.length, linkedSales, days, revenuePerDay, profitPerDay };
};
