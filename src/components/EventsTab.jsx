import React, { useState } from 'react';
import { Calendar, MapPin, DollarSign, Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronRight, TrendingUp, BarChart3 } from 'lucide-react';
import Accordion from './Accordion';
import Tooltip from './Tooltip';
import generateUniqueId from '../utils/idGenerator';

const EventsTab = ({ library, history, saveToDisk }) => {
  const [newEvent, setNewEvent] = useState({ name: '', date: '', location: '', boothFee: '', otherCosts: '', notes: '' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [activeView, setActiveView] = useState('list');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [compareEventIds, setCompareEventIds] = useState([]);
  const [expandedEventId, setExpandedEventId] = useState(null);

  const events = library.events || [];

  // Calculate metrics for an event (only "sold" items count toward revenue/profit)
  const calculateEventMetrics = (event) => {
    const linkedSales = history.filter(h => h.eventId === event.id);
    const soldItems = linkedSales.filter(h => h.status === 'sold');

    const grossRevenue = soldItems.reduce((sum, sale) => {
      const qty = sale.details?.qty || 1;
      return sum + (sale.unitPrice * qty);
    }, 0);
    const totalCOGS = soldItems.reduce((sum, sale) => {
      const qty = sale.details?.qty || 1;
      return sum + ((sale.costPerItem || 0) * qty);
    }, 0);
    const eventCosts = (parseFloat(event.boothFee) || 0) + (parseFloat(event.otherCosts) || 0);
    const netProfit = grossRevenue - eventCosts - totalCOGS;
    const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;
    const itemsSold = soldItems.reduce((sum, s) => sum + (s.details?.qty || 1), 0);

    return { grossRevenue, totalCOGS, eventCosts, netProfit, profitMargin, itemsSold, salesCount: soldItems.length, linkedSales };
  };

  // CRUD operations
  const handleAddEvent = () => {
    if (!newEvent.name || !newEvent.date) return;
    const updated = [
      ...events,
      {
        id: generateUniqueId(),
        name: newEvent.name,
        date: newEvent.date,
        location: newEvent.location,
        boothFee: parseFloat(newEvent.boothFee) || 0,
        otherCosts: parseFloat(newEvent.otherCosts) || 0,
        notes: newEvent.notes
      }
    ];
    saveToDisk({ ...library, events: updated });
    setNewEvent({ name: '', date: '', location: '', boothFee: '', otherCosts: '', notes: '' });
  };

  const handleDeleteEvent = (id) => {
    if (window.confirm("Delete this event? Sales linked to it will be unlinked.")) {
      // Unlink all sales from this event
      const updatedHistory = history.map(h => h.eventId === id ? { ...h, eventId: undefined } : h);
      saveToDisk({ ...library, events: events.filter(e => e.id !== id) }, updatedHistory);
    }
  };

  const startEdit = (event) => {
    setEditingId(event.id);
    setEditData({ ...event });
  };

  const saveEdit = () => {
    const updated = events.map(e => e.id === editingId ? {
      ...editData,
      boothFee: parseFloat(editData.boothFee) || 0,
      otherCosts: parseFloat(editData.otherCosts) || 0
    } : e);
    saveToDisk({ ...library, events: updated });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  // Link/unlink sales
  const unlinkSale = (saleId) => {
    const updatedHistory = history.map(h => h.id === saleId ? { ...h, eventId: undefined } : h);
    saveToDisk(library, updatedHistory);
  };

  const linkSaleToEvent = (saleId, eventId) => {
    const updatedHistory = history.map(h => h.id === saleId ? { ...h, eventId } : h);
    saveToDisk(library, updatedHistory);
  };

  // Get unlinked sales for linking
  const unlinkedSales = history.filter(h => !h.eventId);

  // Totals across all events
  const totals = events.reduce((acc, event) => {
    const metrics = calculateEventMetrics(event);
    return {
      revenue: acc.revenue + metrics.grossRevenue,
      costs: acc.costs + metrics.eventCosts,
      profit: acc.profit + metrics.netProfit,
      items: acc.items + metrics.itemsSold
    };
  }, { revenue: 0, costs: 0, profit: 0, items: 0 });

  // Split events into upcoming and past
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events
    .filter(e => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Soonest first

  const pastEvents = events
    .filter(e => new Date(e.date) < today)
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Most recent first

  // Render a single event card
  const renderEventCard = (event) => {
    const metrics = calculateEventMetrics(event);
    const isExpanded = expandedEventId === event.id;
    const isEditing = editingId === event.id;

    return (
      <div key={event.id} className="border border-slate-100 rounded-2xl overflow-hidden">
        {/* Event Header Row */}
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-all"
          onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
        >
          <div className="flex items-center gap-4">
            {isExpanded ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="font-black text-slate-800 bg-slate-100 px-2 py-1 rounded"
                />
              ) : (
                <div className="font-black text-slate-800">{event.name}</div>
              )}
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Calendar size={12} /> {new Date(event.date).toLocaleDateString()}
                {event.location && (
                  <>
                    <span className="mx-1">•</span>
                    <MapPin size={12} /> {event.location}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-slate-400 uppercase">Revenue</div>
              <div className="font-black text-blue-600">${metrics.grossRevenue.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 uppercase">Profit</div>
              <div className={`font-black ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${metrics.netProfit.toFixed(2)}
              </div>
            </div>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              {isEditing ? (
                <>
                  <button onClick={saveEdit} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Check size={16} /></button>
                  <button onClick={cancelEdit} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={16} /></button>
                </>
              ) : (
                <>
                  <button onClick={() => startEdit(event)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><Edit2 size={16} /></button>
                  <button onClick={() => handleDeleteEvent(event.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-4">
            {/* Edit fields */}
            {isEditing && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-white rounded-xl">
                <input type="date" value={editData.date} onChange={(e) => setEditData({ ...editData, date: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
                <input type="text" placeholder="Location" value={editData.location || ''} onChange={(e) => setEditData({ ...editData, location: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
                <input type="number" placeholder="Booth Fee" value={editData.boothFee} onChange={(e) => setEditData({ ...editData, boothFee: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
                <input type="number" placeholder="Other Costs" value={editData.otherCosts} onChange={(e) => setEditData({ ...editData, otherCosts: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
              </div>
            )}

            {/* Costs Breakdown */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-xl text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Booth Fee</div>
                <div className="font-black text-slate-700">${(event.boothFee || 0).toFixed(2)}</div>
              </div>
              <div className="bg-white p-3 rounded-xl text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Other Costs</div>
                <div className="font-black text-slate-700">${(event.otherCosts || 0).toFixed(2)}</div>
              </div>
              <div className="bg-white p-3 rounded-xl text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Items Sold</div>
                <div className="font-black text-slate-700">{metrics.itemsSold}</div>
              </div>
            </div>

            {/* Notes */}
            {event.notes && (
              <div className="text-sm text-slate-500 italic">"{event.notes}"</div>
            )}

            {/* Linked Sales */}
            <div className="space-y-2">
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Linked Sales ({metrics.salesCount})</div>
              {metrics.linkedSales.length === 0 ? (
                <p className="text-sm text-slate-400">No sales linked to this event yet.</p>
              ) : (
                <div className="space-y-2">
                  {metrics.linkedSales.map(sale => (
                    <div key={sale.id} className="flex justify-between items-center bg-white p-3 rounded-xl">
                      <div>
                        <div className="font-bold text-slate-800">{sale.name}</div>
                        <div className="text-xs text-slate-400">{sale.quoteNo} • Qty: {sale.details?.qty || 1}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-black text-blue-600">${(sale.unitPrice * (sale.details?.qty || 1)).toFixed(2)}</div>
                        </div>
                        <button
                          onClick={() => unlinkSale(sale.id)}
                          className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded"
                        >
                          Unlink
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Link New Sale */}
              {unlinkedSales.length > 0 && (
                <div className="pt-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        linkSaleToEvent(parseInt(e.target.value), event.id);
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                    defaultValue=""
                  >
                    <option value="">+ Link a sale to this event...</option>
                    {unlinkedSales.map(sale => (
                      <option key={sale.id} value={sale.id}>
                        {sale.quoteNo} - {sale.name} (${sale.unitPrice.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-3">
            <Calendar className="text-blue-600" size={28} /> Events
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Track sales and profit by event or venue</p>
        </div>
      </div>

      {/* VIEW TOGGLE */}
      <div className="flex gap-2">
        {['list', 'compare'].map(view => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
              activeView === view
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {view === 'list' ? 'Events' : 'Compare'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">

        {/* LIST VIEW */}
        {activeView === 'list' && (
          <>
            <Accordion title="Add New Event">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Tooltip text="Name of the event or venue (e.g., Downtown Craft Fair)">
                      <input
                        type="text"
                        placeholder="Event Name"
                        value={newEvent.name}
                        onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm"
                      />
                    </Tooltip>
                  </div>
                  <div>
                    <Tooltip text="Date of the event">
                      <input
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm"
                      />
                    </Tooltip>
                  </div>
                </div>
                <div>
                  <Tooltip text="Location or address of the event">
                    <input
                      type="text"
                      placeholder="Location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm"
                    />
                  </Tooltip>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 px-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <span className="text-slate-400 font-bold">$</span>
                    <Tooltip text="Cost for booth or table rental">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Booth Fee"
                        value={newEvent.boothFee}
                        onChange={(e) => setNewEvent({ ...newEvent, boothFee: e.target.value })}
                        className="w-full py-4 bg-transparent outline-none font-bold text-sm"
                      />
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-2 px-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <span className="text-slate-400 font-bold">$</span>
                    <Tooltip text="Other costs like travel, parking, supplies">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Other Costs"
                        value={newEvent.otherCosts}
                        onChange={(e) => setNewEvent({ ...newEvent, otherCosts: e.target.value })}
                        className="w-full py-4 bg-transparent outline-none font-bold text-sm"
                      />
                    </Tooltip>
                  </div>
                </div>
                <div>
                  <Tooltip text="Notes about this event">
                    <input
                      type="text"
                      placeholder="Notes (optional)"
                      value={newEvent.notes}
                      onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm"
                    />
                  </Tooltip>
                </div>
                <button
                  onClick={handleAddEvent}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                  Add Event
                </button>
              </div>
            </Accordion>

            {/* SUMMARY STATS */}
            {events.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                <div className="bg-slate-50 p-4 rounded-2xl text-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Events</span>
                  <span className="text-2xl font-black text-slate-800">{events.length}</span>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl text-center">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-1">Revenue</span>
                  <span className="text-2xl font-black text-blue-600">${totals.revenue.toFixed(2)}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl text-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Costs</span>
                  <span className="text-2xl font-black text-slate-800">${totals.costs.toFixed(2)}</span>
                </div>
                <div className={`p-4 rounded-2xl text-center ${totals.profit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${totals.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>Net Profit</span>
                  <span className={`text-2xl font-black ${totals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>${totals.profit.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* EVENT LIST */}
            {events.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-8">No events yet. Add your first event above.</p>
            ) : (
              <>
                {/* UPCOMING EVENTS */}
                {upcomingEvents.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={14} /> Upcoming Events
                    </div>
                    {upcomingEvents.map(event => renderEventCard(event))}
                  </div>
                )}

                {/* PAST EVENTS SEPARATOR */}
                {pastEvents.length > 0 && (
                  <div className="space-y-3">
                    {upcomingEvents.length > 0 && (
                      <div className="border-t border-slate-200 my-8"></div>
                    )}
                    <div className="text-lg font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      Past Events
                    </div>
                    {pastEvents.map(event => renderEventCard(event))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* COMPARE VIEW */}
        {activeView === 'compare' && (
          <div className="space-y-6">
            <div className="text-sm text-slate-600">Select events to compare:</div>
            <div className="flex flex-wrap gap-2">
              {events.map(event => (
                <button
                  key={event.id}
                  onClick={() => {
                    if (compareEventIds.includes(event.id)) {
                      setCompareEventIds(compareEventIds.filter(id => id !== event.id));
                    } else if (compareEventIds.length < 4) {
                      setCompareEventIds([...compareEventIds, event.id]);
                    }
                  }}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                    compareEventIds.includes(event.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {event.name}
                </button>
              ))}
            </div>

            {compareEventIds.length > 0 && (
              <button
                onClick={() => setCompareEventIds([])}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Clear selection
              </button>
            )}

            {compareEventIds.length >= 2 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-black text-slate-400 uppercase text-xs">Metric</th>
                      {compareEventIds.map(id => {
                        const event = events.find(e => e.id === id);
                        return (
                          <th key={id} className="text-right py-3 px-4 font-black text-slate-800">
                            {event?.name}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Date', getValue: (e) => new Date(e.date).toLocaleDateString() },
                      { label: 'Revenue', getValue: (e) => '$' + calculateEventMetrics(e).grossRevenue.toFixed(2), isMoney: true },
                      { label: 'Booth Fee', getValue: (e) => '$' + (e.boothFee || 0).toFixed(2) },
                      { label: 'Other Costs', getValue: (e) => '$' + (e.otherCosts || 0).toFixed(2) },
                      { label: 'COGS', getValue: (e) => '$' + calculateEventMetrics(e).totalCOGS.toFixed(2) },
                      { label: 'Net Profit', getValue: (e) => '$' + calculateEventMetrics(e).netProfit.toFixed(2), isProfit: true },
                      { label: 'Margin %', getValue: (e) => calculateEventMetrics(e).profitMargin.toFixed(1) + '%' },
                      { label: 'Items Sold', getValue: (e) => calculateEventMetrics(e).itemsSold.toString() },
                      { label: 'Unique Products', getValue: (e) => calculateEventMetrics(e).salesCount.toString() },
                    ].map(row => (
                      <tr key={row.label} className="border-b border-slate-100">
                        <td className="py-3 px-4 font-bold text-slate-600">{row.label}</td>
                        {compareEventIds.map(id => {
                          const event = events.find(e => e.id === id);
                          const value = event ? row.getValue(event) : '-';
                          const metrics = event ? calculateEventMetrics(event) : null;
                          return (
                            <td
                              key={id}
                              className={`text-right py-3 px-4 font-black ${
                                row.isProfit && metrics
                                  ? metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                                  : row.isMoney ? 'text-blue-600' : 'text-slate-800'
                              }`}
                            >
                              {value}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-slate-400 py-8">
                {events.length < 2
                  ? "Add at least 2 events to compare them."
                  : "Select at least 2 events to compare."}
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default EventsTab;
