import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Percent, Package } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const DashboardTab = ({ library, history }) => {
  const sales = library.sales || [];
  const soldHistory = history.filter(h => h.status === 'sold');

  // Calculate summary metrics
  const calculateMetrics = () => {
    // Revenue from direct sales
    const salesRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);

    // Revenue from sold history items
    const historyRevenue = soldHistory.reduce((sum, h) => {
      const qty = h.details?.qty || 1;
      return sum + (h.unitPrice * qty);
    }, 0);

    const totalRevenue = salesRevenue + historyRevenue;

    // COGS from history items
    const totalCOGS = soldHistory.reduce((sum, h) => {
      const qty = h.details?.qty || 1;
      return sum + ((h.costPerItem || 0) * qty);
    }, 0);

    // Total profit (revenue - COGS)
    const totalProfit = totalRevenue - totalCOGS;

    // Average margin
    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Items sold
    const salesItems = sales.reduce((sum, s) => sum + (s.quantity || 1), 0);
    const historyItems = soldHistory.reduce((sum, h) => sum + (h.details?.qty || 1), 0);
    const itemsSold = salesItems + historyItems;

    return { totalRevenue, totalProfit, avgMargin, itemsSold };
  };

  const metrics = calculateMetrics();

  // Revenue over time (by month)
  const getRevenueByMonth = () => {
    const monthlyData = {};

    // Process sales
    sales.forEach(s => {
      const date = new Date(s.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthLabel, revenue: 0, profit: 0, sortKey: monthKey };
      }
      monthlyData[monthKey].revenue += s.total || 0;
    });

    // Process sold history
    soldHistory.forEach(h => {
      const date = new Date(h.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthLabel, revenue: 0, profit: 0, sortKey: monthKey };
      }
      const qty = h.details?.qty || 1;
      const revenue = h.unitPrice * qty;
      const cost = (h.costPerItem || 0) * qty;
      monthlyData[monthKey].revenue += revenue;
      monthlyData[monthKey].profit += (revenue - cost);
    });

    return Object.values(monthlyData)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-12); // Last 12 months
  };

  // Top sellers by quantity
  const getTopSellers = () => {
    const itemData = {};

    // Process sales
    sales.forEach(s => {
      const name = s.itemName;
      if (!itemData[name]) {
        itemData[name] = { name, quantity: 0, revenue: 0 };
      }
      itemData[name].quantity += s.quantity || 1;
      itemData[name].revenue += s.total || 0;
    });

    // Process sold history
    soldHistory.forEach(h => {
      const name = h.name;
      if (!itemData[name]) {
        itemData[name] = { name, quantity: 0, revenue: 0 };
      }
      const qty = h.details?.qty || 1;
      itemData[name].quantity += qty;
      itemData[name].revenue += h.unitPrice * qty;
    });

    return Object.values(itemData)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);
  };

  // Profit by category
  const getProfitByCategory = () => {
    const categoryData = {};

    // Only history items have category and cost info
    soldHistory.forEach(h => {
      const category = h.category || 'Uncategorized';
      if (!categoryData[category]) {
        categoryData[category] = { name: category, revenue: 0, profit: 0 };
      }
      const qty = h.details?.qty || 1;
      const revenue = h.unitPrice * qty;
      const cost = (h.costPerItem || 0) * qty;
      categoryData[category].revenue += revenue;
      categoryData[category].profit += (revenue - cost);
    });

    return Object.values(categoryData)
      .filter(c => c.revenue > 0)
      .sort((a, b) => b.profit - a.profit);
  };

  const revenueByMonth = getRevenueByMonth();
  const topSellers = getTopSellers();
  const profitByCategory = getProfitByCategory();

  const hasData = sales.length > 0 || soldHistory.length > 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-3">
          <BarChart3 className="text-blue-600" size={28} /> Dashboard
        </h2>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
          Business analytics and performance metrics
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-2xl text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <DollarSign size={12} className="text-blue-400" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Total Revenue</span>
          </div>
          <span className="text-2xl font-black text-blue-600">${metrics.totalRevenue.toFixed(2)}</span>
        </div>
        <div className="bg-green-50 p-4 rounded-2xl text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp size={12} className="text-green-400" />
            <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Total Profit</span>
          </div>
          <span className="text-2xl font-black text-green-600">${metrics.totalProfit.toFixed(2)}</span>
        </div>
        <div className="bg-amber-50 p-4 rounded-2xl text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Percent size={12} className="text-amber-400" />
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Avg Margin</span>
          </div>
          <span className="text-2xl font-black text-amber-600">{metrics.avgMargin.toFixed(1)}%</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Package size={12} className="text-slate-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items Sold</span>
          </div>
          <span className="text-2xl font-black text-slate-800">{metrics.itemsSold}</span>
        </div>
      </div>

      {!hasData ? (
        <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-slate-100 text-center">
          <BarChart3 size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-600 mb-2">No Sales Data Yet</h3>
          <p className="text-slate-400 text-sm">
            Record sales in the Sales tab or mark estimates as sold to see your analytics here.
          </p>
        </div>
      ) : (
        <>
          {/* REVENUE OVER TIME */}
          {revenueByMonth.length > 0 && (
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                Revenue Over Time
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueByMonth} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickLine={{ stroke: '#e2e8f0' }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      formatter={(value) => [`$${value.toFixed(2)}`, '']}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      name="Profit"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TOP SELLERS AND PROFIT BY CATEGORY */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* TOP SELLERS */}
            {topSellers.length > 0 && (
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                  Top Sellers by Quantity
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topSellers}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        tickLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        tickLine={{ stroke: '#e2e8f0' }}
                        width={100}
                      />
                      <Tooltip
                        formatter={(value, name) => [
                          name === 'quantity' ? value : `$${value.toFixed(2)}`,
                          name === 'quantity' ? 'Qty Sold' : 'Revenue'
                        ]}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Bar
                        dataKey="quantity"
                        fill="#3b82f6"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* PROFIT BY CATEGORY */}
            {profitByCategory.length > 0 && (
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                  Profit by Category
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={profitByCategory}
                        dataKey="profit"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={{ stroke: '#94a3b8' }}
                      >
                        {profitByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`$${value.toFixed(2)}`, 'Profit']}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardTab;
