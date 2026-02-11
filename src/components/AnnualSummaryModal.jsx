import React, { useState, useMemo } from 'react';
import { X, FileText, Download, FileSpreadsheet, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import AnnualSummaryPDF from './AnnualSummaryPDF';
import { downloadCSV, arrayToCSV } from '../utils/csvExport';

// Calculate months a subscription was active in a given year
const getSubscriptionMonthsInYear = (priceHistory, year) => {
  if (!priceHistory || priceHistory.length === 0) return [];

  const yearStart = new Date(`${year}-01-01`);
  const yearEnd = new Date(`${year}-12-31`);

  return priceHistory.map(period => {
    const periodStart = new Date(period.startDate);
    const periodEnd = period.endDate ? new Date(period.endDate) : new Date();

    // Check if period overlaps with the year
    if (periodEnd < yearStart || periodStart > yearEnd) return { ...period, months: 0 };

    // Calculate overlap
    const overlapStart = periodStart < yearStart ? yearStart : periodStart;
    const overlapEnd = periodEnd > yearEnd ? yearEnd : periodEnd;

    const months = (overlapEnd.getFullYear() - overlapStart.getFullYear()) * 12
      + (overlapEnd.getMonth() - overlapStart.getMonth())
      + (overlapEnd.getDate() >= overlapStart.getDate() ? 1 : 0);

    return { ...period, months: Math.max(0, months) };
  });
};

const AnnualSummaryModal = ({ library, history, sales, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState(null);

  // Get available years from sales data
  const availableYears = useMemo(() => {
    const years = new Set();
    const currentYear = new Date().getFullYear();

    // Add years from sales
    (sales || []).forEach(s => {
      if (s.date) {
        const d = new Date(s.date);
        if (!isNaN(d.getTime())) years.add(d.getFullYear());
      }
    });

    // Add years from events
    (library.events || []).forEach(e => {
      if (e.date) {
        const d = new Date(e.date);
        if (!isNaN(d.getTime())) years.add(d.getFullYear());
      }
    });

    // Always include current year
    years.add(currentYear);

    return Array.from(years).sort((a, b) => b - a);
  }, [sales, library.events]);

  const [selectedYear, setSelectedYear] = useState(availableYears[0] || new Date().getFullYear());

  // Calculate summary data for selected year
  const summaryData = useMemo(() => {
    const yearStart = new Date(`${selectedYear}-01-01`);
    const yearEnd = new Date(`${selectedYear}-12-31T23:59:59`);

    // Filter sales for the year
    const yearSales = (sales || []).filter(s => {
      if (!s.date) return false;
      const d = new Date(s.date);
      return d >= yearStart && d <= yearEnd;
    });

    // Revenue calculations
    const totalRevenue = yearSales.reduce((sum, s) => sum + (s.total || 0), 0);
    const salesCount = yearSales.length;

    // Revenue by payment method
    const revenueByPayment = {};
    yearSales.forEach(s => {
      const method = s.paymentMethod || 'Other';
      revenueByPayment[method] = (revenueByPayment[method] || 0) + (s.total || 0);
    });

    // COGS from sales (if we have cost data)
    const totalCOGS = yearSales.reduce((sum, s) => {
      // Try to find matching estimate for COGS
      const estimate = (history || []).find(h => h.name === s.itemName);
      const costPerItem = estimate?.costPerItem || 0;
      return sum + (costPerItem * (s.quantity || 1));
    }, 0);

    // Subscription costs for the year
    let subscriptionCosts = 0;
    (library.subscriptions || []).forEach(sub => {
      if (sub.priceHistory && sub.priceHistory.length > 0) {
        const periodsInYear = getSubscriptionMonthsInYear(sub.priceHistory, selectedYear);
        periodsInYear.forEach(period => {
          const monthlyCost = sub.cycle === 'yearly' ? period.price / 12 : period.price;
          subscriptionCosts += period.months * monthlyCost;
        });
      }
    });

    // Event costs for the year
    const yearEvents = (library.events || []).filter(e => {
      if (!e.date) return false;
      const d = new Date(e.date);
      return d >= yearStart && d <= yearEnd;
    });
    const eventCosts = yearEvents.reduce((sum, e) => sum + (e.boothFee || 0) + (e.otherCosts || 0), 0);

    // Total expenses
    const totalExpenses = subscriptionCosts + eventCosts + totalCOGS;

    // Net profit
    const netProfit = totalRevenue - totalExpenses;

    return {
      totalRevenue,
      salesCount,
      revenueByPayment,
      totalCOGS,
      subscriptionCosts,
      eventCosts,
      totalExpenses,
      netProfit,
    };
  }, [selectedYear, sales, library, history]);

  const handleDownloadPDF = async () => {
    setLoading(true);
    setLoadingType('pdf');

    try {
      const doc = (
        <AnnualSummaryPDF
          data={summaryData}
          year={selectedYear}
          shopName={library.shopName}
        />
      );
      const blob = await pdf(doc).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Annual-Summary-${selectedYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  const handleDownloadCSV = () => {
    setLoading(true);
    setLoadingType('csv');

    try {
      const headers = ['Category', 'Item', 'Amount'];
      const rows = [
        ['Revenue', 'Total Sales', summaryData.totalRevenue.toFixed(2)],
        ['Revenue', 'Transaction Count', summaryData.salesCount],
        ...Object.entries(summaryData.revenueByPayment).map(([method, amount]) => [
          'Revenue', `Payment: ${method}`, amount.toFixed(2)
        ]),
        ['', '', ''],
        ['Expenses', 'Subscriptions & Software', summaryData.subscriptionCosts.toFixed(2)],
        ['Expenses', 'Event Fees', summaryData.eventCosts.toFixed(2)],
        ['Expenses', 'Cost of Goods Sold', summaryData.totalCOGS.toFixed(2)],
        ['Expenses', 'Total Expenses', summaryData.totalExpenses.toFixed(2)],
        ['', '', ''],
        ['Summary', 'Total Revenue', summaryData.totalRevenue.toFixed(2)],
        ['Summary', 'Total Expenses', summaryData.totalExpenses.toFixed(2)],
        ['Summary', 'Net Profit/Loss', summaryData.netProfit.toFixed(2)],
      ];

      const csvString = arrayToCSV(headers, rows);
      downloadCSV(`Annual-Summary-${selectedYear}.csv`, csvString);
    } catch (error) {
      console.error('Error generating CSV:', error);
      alert('Error generating CSV. Please try again.');
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  const isProfit = summaryData.netProfit >= 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <FileText size={20} />
            <h3 className="font-black text-lg uppercase tracking-wide">Annual Summary</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Year Selector */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Select Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Summary Preview */}
          <div className="space-y-3">
            {/* Revenue */}
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Revenue</div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Total Sales ({summaryData.salesCount})</span>
                <span className="text-lg font-black text-green-600">${summaryData.totalRevenue.toFixed(2)}</span>
              </div>
            </div>

            {/* Expenses */}
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Expenses</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subscriptions</span>
                  <span className="font-bold">${summaryData.subscriptionCosts.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Event Fees</span>
                  <span className="font-bold">${summaryData.eventCosts.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">COGS</span>
                  <span className="font-bold">${summaryData.totalCOGS.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-600 font-bold">Total</span>
                  <span className="font-black text-red-500">${summaryData.totalExpenses.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Net Profit/Loss */}
            <div className={`rounded-xl p-4 ${isProfit ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {isProfit ? (
                    <TrendingUp className="text-green-600" size={20} />
                  ) : (
                    <TrendingDown className="text-red-600" size={20} />
                  )}
                  <span className={`font-black uppercase text-sm ${isProfit ? 'text-green-700' : 'text-red-700'}`}>
                    {isProfit ? 'Net Profit' : 'Net Loss'}
                  </span>
                </div>
                <span className={`text-2xl font-black ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(summaryData.netProfit).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && loadingType === 'pdf' ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download size={16} />
                Download PDF
              </>
            )}
          </button>
          <button
            onClick={handleDownloadCSV}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && loadingType === 'csv' ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileSpreadsheet size={16} />
                Download CSV
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnualSummaryModal;
