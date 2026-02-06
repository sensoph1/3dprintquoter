import React, { useState } from 'react';
import {
  ShoppingCart, Search, Trash2, ChevronDown, ChevronRight,
  DollarSign, Hash, Tag, CreditCard
} from 'lucide-react';
import Accordion from './Accordion';
import Tooltip from './Tooltip';
import generateUniqueId from '../utils/idGenerator';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'square', label: 'Square' },
  { value: 'venmo', label: 'Venmo' },
  { value: 'other', label: 'Other' },
];

const SalesTab = ({ library, saveToDisk }) => {
  const sales = library.sales || [];
  const events = library.events || [];
  const printedParts = library.printedParts || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Log Sale form state
  const [newSale, setNewSale] = useState({
    itemName: '',
    inventoryId: null,
    quantity: 1,
    unitPrice: '',
    paymentMethod: 'cash',
    eventId: '',
    notes: '',
  });
  const [inventorySearch, setInventorySearch] = useState('');
  const [showInventoryDropdown, setShowInventoryDropdown] = useState(false);

  // Summary stats
  const totalRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalSalesCount = sales.length;
  const todayStr = new Date().toLocaleDateString();
  const itemsSoldToday = sales
    .filter(s => s.date === todayStr)
    .reduce((sum, s) => sum + (s.quantity || 0), 0);

  // Search/filter
  const filteredSales = sales.filter(s =>
    s.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Inventory item selection
  const filteredParts = printedParts.filter(p =>
    p.name.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  const selectInventoryItem = (part) => {
    setNewSale({
      ...newSale,
      itemName: part.name,
      inventoryId: part.id,
      unitPrice: part.unitPrice || part.priceByProfitMargin || '',
    });
    setInventorySearch('');
    setShowInventoryDropdown(false);
  };

  const handleLogSale = () => {
    if (!newSale.itemName || !newSale.unitPrice) return;

    const qty = Math.max(1, parseInt(newSale.quantity) || 1);
    const price = parseFloat(newSale.unitPrice) || 0;

    const sale = {
      id: `sale-${generateUniqueId()}-${Math.random().toString(36).substr(2, 6)}`,
      date: new Date().toLocaleDateString(),
      itemName: newSale.itemName,
      quantity: qty,
      unitPrice: price,
      total: qty * price,
      paymentMethod: newSale.paymentMethod,
      eventId: newSale.eventId ? parseInt(newSale.eventId) : null,
      inventoryId: newSale.inventoryId,
      squareOrderId: null,
      squareSource: false,
      notes: newSale.notes,
    };

    let updatedLibrary = { ...library };
    const updatedSales = [sale, ...(library.sales || [])];
    updatedLibrary.sales = updatedSales;

    // Decrement inventory if linked to an inventory item
    if (newSale.inventoryId) {
      const updatedParts = library.printedParts.map(p => {
        if (p.id === newSale.inventoryId) {
          return { ...p, qty: Math.max(0, (p.qty || 0) - qty) };
        }
        return p;
      });
      updatedLibrary.printedParts = updatedParts;
    }

    saveToDisk(updatedLibrary);

    // Reset form
    setNewSale({
      itemName: '',
      inventoryId: null,
      quantity: 1,
      unitPrice: '',
      paymentMethod: 'cash',
      eventId: '',
      notes: '',
    });
  };

  const deleteSale = (id) => {
    if (window.confirm('Delete this sale record?')) {
      const updatedSales = sales.filter(s => s.id !== id);
      saveToDisk({ ...library, sales: updatedSales });
    }
  };

  const getEventName = (eventId) => {
    const event = events.find(e => e.id === eventId);
    return event ? event.name : null;
  };

  const getPaymentLabel = (method) => {
    const pm = PAYMENT_METHODS.find(p => p.value === method);
    return pm ? pm.label : method;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-3">
            <ShoppingCart className="text-blue-600" size={28} /> Sales
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Track actual sales — manual entries and Square imports</p>
        </div>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-2xl text-center">
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-1">Total Revenue</span>
          <span className="text-2xl font-black text-blue-600">${totalRevenue.toFixed(2)}</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl text-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Sales</span>
          <span className="text-2xl font-black text-slate-800">{totalSalesCount}</span>
        </div>
        <div className="bg-green-50 p-4 rounded-2xl text-center">
          <span className="text-[10px] font-black text-green-400 uppercase tracking-widest block mb-1">Sold Today</span>
          <span className="text-2xl font-black text-green-600">{itemsSoldToday}</span>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-6">
        {/* LOG SALE FORM */}
        <Accordion title="Log Sale">
          <div className="space-y-4">
            {/* Item name with inventory search */}
            <div className="relative">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 block mb-2">Item Name</label>
              <input
                type="text"
                placeholder="Search inventory or type item name..."
                value={inventorySearch || newSale.itemName}
                onChange={(e) => {
                  const val = e.target.value;
                  setInventorySearch(val);
                  setNewSale({ ...newSale, itemName: val, inventoryId: null });
                  setShowInventoryDropdown(val.length > 0);
                }}
                onFocus={() => {
                  if (inventorySearch.length > 0 || newSale.itemName.length > 0) {
                    setShowInventoryDropdown(true);
                  }
                }}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm"
              />
              {showInventoryDropdown && filteredParts.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {filteredParts.map(part => (
                    <li
                      key={part.id}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                      onClick={() => selectInventoryItem(part)}
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-800">{part.name}</div>
                        <div className="text-[10px] text-slate-400">Qty: {part.qty} in stock</div>
                      </div>
                      <div className="font-black text-blue-600 text-sm">${(part.unitPrice || part.priceByProfitMargin || 0).toFixed(2)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 block mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={newSale.quantity}
                  onChange={(e) => setNewSale({ ...newSale, quantity: e.target.value })}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 block mb-2">Unit Price</label>
                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="px-4 font-bold text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newSale.unitPrice}
                    onChange={(e) => setNewSale({ ...newSale, unitPrice: e.target.value })}
                    className="w-full py-4 pr-4 bg-transparent outline-none font-bold text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 block mb-2">Payment</label>
                <select
                  value={newSale.paymentMethod}
                  onChange={(e) => setNewSale({ ...newSale, paymentMethod: e.target.value })}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm"
                >
                  {PAYMENT_METHODS.map(pm => (
                    <option key={pm.value} value={pm.value}>{pm.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Event link */}
            {events.length > 0 && (
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 block mb-2">Event (optional)</label>
                <select
                  value={newSale.eventId}
                  onChange={(e) => setNewSale({ ...newSale, eventId: e.target.value })}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm"
                >
                  <option value="">No Event</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>{event.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 block mb-2">Notes (optional)</label>
              <input
                type="text"
                placeholder="Sale notes..."
                value={newSale.notes}
                onChange={(e) => setNewSale({ ...newSale, notes: e.target.value })}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm"
              />
            </div>

            {/* Total preview + submit */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Total: <span className="font-black text-blue-600 text-lg">
                  ${((parseFloat(newSale.unitPrice) || 0) * (parseInt(newSale.quantity) || 1)).toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleLogSale}
                disabled={!newSale.itemName || !newSale.unitPrice}
                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Log Sale
              </button>
            </div>
          </div>
        </Accordion>

        {/* SEARCH BAR */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <div className="flex items-center bg-white border border-slate-100 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
              <Search className="ml-4 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search sales by item name..."
                className="w-full pl-4 pr-4 py-4 bg-transparent outline-none font-medium text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SALES TABLE */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Item</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Qty</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Unit Price</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Total</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Payment</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Event</th>
                <th className="p-6 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-20 text-center text-slate-400 font-bold italic">
                    {searchTerm ? 'No sales match your search.' : 'No sales recorded yet.'}
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <React.Fragment key={sale.id}>
                    <tr
                      onClick={() => setExpandedId(expandedId === sale.id ? null : sale.id)}
                      className={`group cursor-pointer transition-colors hover:bg-slate-50 ${expandedId === sale.id ? 'bg-blue-50/30' : ''}`}
                    >
                      <td className="p-6">
                        <div className="font-black text-slate-900 text-sm">{sale.date}</div>
                      </td>
                      <td className="p-6">
                        <div className="font-bold text-slate-700 flex items-center gap-2">
                          {sale.itemName}
                          {sale.squareSource && (
                            <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase">
                              Square
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="font-bold text-slate-700">{sale.quantity}</div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="font-black text-slate-700">${(sale.unitPrice || 0).toFixed(2)}</div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="text-lg font-black text-blue-600">${(sale.total || 0).toFixed(2)}</div>
                      </td>
                      <td className="p-6">
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                          {getPaymentLabel(sale.paymentMethod)}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="text-sm text-slate-500">
                          {sale.eventId ? getEventName(sale.eventId) || '—' : '—'}
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        {expandedId === sale.id ? <ChevronDown size={20} className="text-blue-600" /> : <ChevronRight size={20} className="text-slate-300" />}
                      </td>
                    </tr>

                    {expandedId === sale.id && (
                      <tr className="bg-slate-50/50">
                        <td colSpan="8" className="p-6 border-t border-slate-100">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              {sale.notes && (
                                <div>
                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Notes</span>
                                  <p className="text-sm text-slate-600 mt-1">{sale.notes}</p>
                                </div>
                              )}
                              {sale.squareOrderId && (
                                <div>
                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Square Order</span>
                                  <p className="text-sm text-slate-600 mt-1 font-mono">{sale.squareOrderId}</p>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteSale(sale.id); }}
                              className="flex items-center gap-1 text-[9px] font-black uppercase text-red-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesTab;
