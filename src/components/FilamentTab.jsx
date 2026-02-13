import React, { useState } from 'react';
import {
  Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronUp,
  RefreshCw, AlertCircle, Copy, DollarSign, CreditCard, ExternalLink, History
} from 'lucide-react';

import generateUniqueId from '../utils/idGenerator';
import Tooltip from './Tooltip';
import Accordion from './Accordion';

// Calculate months between two dates
const monthsBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  // Add partial month if we're past the start day
  const dayDiff = end.getDate() - start.getDate();
  return Math.max(0, months + (dayDiff >= 0 ? 1 : 0));
};

const FilamentTab = ({ library, saveToDisk }) => {
  const [newFilament, setNewFilament] = useState({ name: '', colorName: '', price: '', grams: 1000, color: '#3b82f6' });
  const [newConsumable, setNewConsumable] = useState({ name: '', qty: '', totalCost: '' });
  const [newSubscription, setNewSubscription] = useState({ name: '', monthlyCost: '', cycle: 'monthly', url: '' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [editingSubId, setEditingSubId] = useState(null);
  const [editSubData, setEditSubData] = useState({});
  const [expandedSubId, setExpandedSubId] = useState(null);
  const [newPriceEntry, setNewPriceEntry] = useState({ price: '', startDate: '' });
  const [showPriceChangeForm, setShowPriceChangeForm] = useState(null); // subId or null

  const handleAdd = () => {
    if (!newFilament.name || !newFilament.price) return;
    const updatedFilaments = [
      ...library.filaments,
      { ...newFilament, id: generateUniqueId(), price: parseFloat(newFilament.price), grams: parseFloat(newFilament.grams) }
    ];
    saveToDisk({ ...library, filaments: updatedFilaments });
    setNewFilament({ name: '', colorName: '', price: '', grams: 1000, color: '#3b82f6' });
  };

  const handleDuplicate = (f) => {
    const duplicated = { ...f, id: generateUniqueId(), name: `${f.name} (Copy)` };
    saveToDisk({ ...library, filaments: [...library.filaments, duplicated] });
    setEditingId(duplicated.id);
    setEditData(duplicated);
  };

  const saveEdit = () => {
    const updated = library.filaments.map(f => f.id === editingId ? { ...editData, price: parseFloat(editData.price), grams: parseFloat(editData.grams) } : f);
    saveToDisk({ ...library, filaments: updated });
    setEditingId(null);
  };

  const handleRefill = (id) => {
    const amount = window.prompt("Enter new weight (grams):", "1000");
    if (amount) {
      const updated = library.filaments.map(f => f.id === id ? { ...f, grams: parseFloat(amount) } : f);
      saveToDisk({ ...library, filaments: updated });
    }
  };

  const deleteConsumable = (id) => {
    if (window.confirm("Remove this consumable?")) {
      saveToDisk({ ...library, inventory: library.inventory.filter(i => i.id !== id) });
    }
  };

  const handleAddConsumable = () => {
    if (!newConsumable.name || !newConsumable.qty) return;
    const qty = parseInt(newConsumable.qty);
    const totalCost = parseFloat(newConsumable.totalCost) || 0;
    const unitCost = qty > 0 ? totalCost / qty : 0;
    const updatedInventory = [
      ...(library.inventory || []),
      {
        name: newConsumable.name,
        id: generateUniqueId(),
        qty: qty,
        unitCost: unitCost,
        lowStockThreshold: 10
      }
    ];
    saveToDisk({ ...library, inventory: updatedInventory });
    setNewConsumable({ name: '', qty: '', totalCost: '' });
  };

  const handleAddSubscription = () => {
    if (!newSubscription.name || !newSubscription.monthlyCost) return;
    const updatedSubscriptions = [
      ...(library.subscriptions || []),
      {
        id: generateUniqueId(),
        name: newSubscription.name,
        monthlyCost: parseFloat(newSubscription.monthlyCost),
        cycle: newSubscription.cycle,
        url: newSubscription.url || ''
      }
    ];
    saveToDisk({ ...library, subscriptions: updatedSubscriptions });
    setNewSubscription({ name: '', monthlyCost: '', cycle: 'monthly', url: '' });
  };

  const deleteSubscription = (id) => {
    if (window.confirm("Remove this subscription?")) {
      saveToDisk({ ...library, subscriptions: (library.subscriptions || []).filter(s => s.id !== id) });
    }
  };

  const saveSubscription = () => {
    const updated = (library.subscriptions || []).map(s =>
      s.id === editingSubId ? { ...editSubData, monthlyCost: parseFloat(editSubData.monthlyCost) } : s
    );
    saveToDisk({ ...library, subscriptions: updated });
    setEditingSubId(null);
  };

  // Initialize price tracking for a subscription
  const startPriceTracking = (subId) => {
    const sub = (library.subscriptions || []).find(s => s.id === subId);
    if (!sub) return;

    const startDate = window.prompt("When did this subscription start? (YYYY-MM-DD)", new Date().toISOString().split('T')[0]);
    if (!startDate) return;

    const updated = (library.subscriptions || []).map(s =>
      s.id === subId ? {
        ...s,
        priceHistory: [{
          id: generateUniqueId(),
          price: s.monthlyCost,
          startDate: startDate,
          endDate: null
        }]
      } : s
    );
    saveToDisk({ ...library, subscriptions: updated });
    setExpandedSubId(subId);
  };

  // Add a new price period (closes the previous one)
  const addPricePeriod = (subId) => {
    if (!newPriceEntry.price || !newPriceEntry.startDate) return;

    const updated = (library.subscriptions || []).map(s => {
      if (s.id !== subId) return s;

      const history = [...(s.priceHistory || [])];
      // Close the previous period
      if (history.length > 0) {
        const lastIndex = history.length - 1;
        const prevEndDate = new Date(newPriceEntry.startDate);
        prevEndDate.setDate(prevEndDate.getDate() - 1);
        history[lastIndex] = { ...history[lastIndex], endDate: prevEndDate.toISOString().split('T')[0] };
      }
      // Add new period
      history.push({
        id: generateUniqueId(),
        price: parseFloat(newPriceEntry.price),
        startDate: newPriceEntry.startDate,
        endDate: null
      });

      return { ...s, priceHistory: history, monthlyCost: parseFloat(newPriceEntry.price) };
    });

    saveToDisk({ ...library, subscriptions: updated });
    setNewPriceEntry({ price: '', startDate: '' });
  };

  // Delete a price period
  const deletePricePeriod = (subId, periodId) => {
    const updated = (library.subscriptions || []).map(s => {
      if (s.id !== subId) return s;

      const history = (s.priceHistory || []).filter(p => p.id !== periodId);
      // If we deleted the last one and there's a previous, re-open it
      if (history.length > 0) {
        history[history.length - 1] = { ...history[history.length - 1], endDate: null };
      }

      return { ...s, priceHistory: history };
    });
    saveToDisk({ ...library, subscriptions: updated });
  };

  const totalMonthlyCost = (library.subscriptions || []).reduce((sum, s) => {
    return sum + (s.cycle === 'yearly' ? s.monthlyCost / 12 : s.monthlyCost);
  }, 0);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-3">
            <DollarSign className="text-blue-600" size={28} /> Cost Management
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Materials, consumables & subscriptions</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">
        <Accordion title="Filament Inventory">
          {/* ADD NEW SPOOL */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
              <Plus size={12} /> Add New Spool
            </div>
            <div className="flex gap-3 items-center">
              <div className="w-[30%]">
                <Tooltip text="The brand or type of filament (e.g., Polymaker PLA, Hatchbox PETG).">
                  <input placeholder="Brand (e.g. Polymaker)" value={newFilament.name} onChange={(e) => setNewFilament({...newFilament, name: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
                </Tooltip>
              </div>
              <div className="w-[30%]">
                <Tooltip text="The specific color of the filament (e.g., Galaxy Black, Azure Blue).">
                  <input placeholder="Color Name" value={newFilament.colorName} onChange={(e) => setNewFilament({...newFilament, colorName: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
                </Tooltip>
              </div>
              <div className="w-[20%] flex items-center gap-2 px-4 bg-white border border-slate-200 rounded-2xl">
                <span className="text-slate-400 font-bold">$</span>
                <Tooltip text="The cost of the entire spool of filament in your local currency.">
                  <input type="number" placeholder="Price" value={newFilament.price} onChange={(e) => setNewFilament({...newFilament, price: e.target.value})} className="input-nested w-full py-4 bg-transparent outline-none font-bold text-sm" />
                </Tooltip>
              </div>
              <div className="w-[20%] flex items-center gap-2 px-4 bg-white border border-slate-200 rounded-2xl">
                <span className="text-slate-400 font-bold">g</span>
                <Tooltip text="The total weight of the filament spool in grams (e.g., 1000g, 750g).">
                  <input type="number" placeholder="Weight" value={newFilament.grams} onChange={(e) => setNewFilament({...newFilament, grams: e.target.value})} className="input-nested w-full py-4 bg-transparent outline-none font-bold text-sm" />
                </Tooltip>
              </div>
            </div>
            <button onClick={handleAdd} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">
              Register Spool
            </button>
          </div>

          <hr className="border-slate-200 mb-6" />

          {/* FILAMENT LIST */}
          <div className="grid grid-cols-1 gap-4">
            {library.filaments.map((f) => (
              <div key={f.id} className={`p-6 rounded-[2rem] border transition-all flex items-center justify-between ${f.grams < 100 ? 'border-red-100 bg-red-50/20' : 'bg-slate-50/50 border-slate-100'}`}>
                {editingId === f.id ? (
                  /* EDIT MODE */
                  <div className="flex flex-1 gap-4 items-center flex-wrap">
                    <Tooltip text="The brand or type of filament.">
                      <input className="flex-1 min-w-[150px] px-4 py-3 bg-white rounded-xl border font-bold text-sm outline-none" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                    </Tooltip>
                    <Tooltip text="The specific color of the filament.">
                      <input className="flex-1 min-w-[150px] px-4 py-3 bg-white rounded-xl border font-bold text-sm outline-none" value={editData.colorName} onChange={e => setEditData({...editData, colorName: e.target.value})} />
                    </Tooltip>
                    <Tooltip text="The visual color representation of the filament.">
                      <input type="color" className="w-12 h-12 border-none bg-transparent cursor-pointer rounded-xl" value={editData.color} onChange={e => setEditData({...editData, color: e.target.value})} />
                    </Tooltip>
                    <Tooltip text="The cost of the entire spool of filament in your local currency.">
                      <input type="number" className="w-24 px-4 py-3 bg-white rounded-xl border font-bold text-sm" value={editData.price} onChange={e => setEditData({...editData, price: e.target.value})} />
                    </Tooltip>
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"><Check size={16}/></button>
                      <button onClick={() => setEditingId(null)} className="p-3 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300 transition-all"><X size={16}/></button>
                    </div>
                  </div>
                ) : (
                  /* VIEW MODE */
                  <>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl shadow-inner border-4 border-white flex-shrink-0 relative" style={{ backgroundColor: f.color || '#3b82f6' }}>
                        {f.grams < 100 && <AlertCircle className="absolute -top-2 -right-2 text-red-500 bg-white rounded-full" size={16} />}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 uppercase text-xs leading-none">
                          {f.name} — <span className="text-blue-600">{f.colorName || 'No Color Name'}</span>
                        </h3>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mt-1.5 ${f.grams < 100 ? 'text-red-500' : 'text-slate-400'}`}>
                          ${f.price} / {f.grams.toFixed(0)}g Remaining
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleDuplicate(f)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all"><Copy size={16} /></button>
                      <button onClick={() => handleRefill(f.id)} className="p-3 text-slate-400 hover:text-green-600 hover:bg-white rounded-xl transition-all"><RefreshCw size={16} /></button>
                      <button onClick={() => setEditingId(f.id) || setEditData(f)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all"><Edit2 size={16} /></button>
                      <button onClick={() => library.filaments.length > 1 && saveToDisk({...library, filaments: library.filaments.filter(x => x.id !== f.id)})} className="p-3 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all"><Trash2 size={16} /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Accordion>

        <Accordion title="Consumables & Shipping">
          {/* ADD NEW CONSUMABLE */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
              <Plus size={12} /> Add New Item
            </div>
            <div className="flex gap-3 items-center">
              <div className="w-[50%]">
                <Tooltip text="Name of the item (e.g., 6mm Magnets, Small Box, Bubble Wrap Roll).">
                  <input placeholder="Item Name (e.g. 6mm Magnets)" value={newConsumable.name} onChange={(e) => setNewConsumable({...newConsumable, name: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
                </Tooltip>
              </div>
              <div className="w-[25%] flex items-center gap-2 px-4 bg-white border border-slate-200 rounded-2xl">
                <span className="text-slate-400 font-bold">#</span>
                <Tooltip text="Current quantity in stock.">
                  <input type="number" placeholder="Qty" value={newConsumable.qty} onChange={(e) => setNewConsumable({...newConsumable, qty: e.target.value})} className="input-nested w-full py-4 bg-transparent outline-none font-bold text-sm" />
                </Tooltip>
              </div>
              <div className="w-[25%] flex items-center gap-2 px-4 bg-white border border-slate-200 rounded-2xl">
                <span className="text-slate-400 font-bold">$</span>
                <Tooltip text="Total cost for the entire order (unit cost will be calculated automatically).">
                  <input type="number" step="0.01" placeholder="Total Cost" value={newConsumable.totalCost} onChange={(e) => setNewConsumable({...newConsumable, totalCost: e.target.value})} className="input-nested w-full py-4 bg-transparent outline-none font-bold text-sm" />
                </Tooltip>
              </div>
            </div>
            <button onClick={handleAddConsumable} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">
              Add Item
            </button>
          </div>

          <hr className="border-slate-200 mb-6" />

          {/* CONSUMABLES LIST */}
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-400 uppercase font-black">
                <th className="pb-4">Item Name</th>
                <th className="pb-4 text-center">Unit Cost</th>
                <th className="pb-4 text-center">Stock</th>
                <th className="pb-4 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {(library.inventory || []).map(item => (
                <tr key={item.id} className={`border-b border-slate-100 last:border-b-0 ${item.qty < (item.lowStockThreshold || 10) ? 'bg-red-50/50' : ''}`}>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      {item.qty < (item.lowStockThreshold || 10) && <AlertCircle className="text-red-500" size={14} />}
                      <Tooltip text="The name of this consumable or shipping item.">
                        <input className="bg-transparent font-black uppercase text-sm outline-none w-full" value={item.name} onChange={(e) => saveToDisk({...library, inventory: library.inventory.map(x => x.id === item.id ? {...x, name: e.target.value} : x)})}/>
                      </Tooltip>
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="w-32 inline-block">
                      <Tooltip text="Cost per unit.">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-slate-400 text-sm">$</span>
                          <input type="number" step="0.01" className="w-24 p-2 bg-white rounded-lg border text-sm font-bold text-center" value={item.unitCost || 0} onChange={(e) => saveToDisk({...library, inventory: library.inventory.map(x => x.id === item.id ? {...x, unitCost: parseFloat(e.target.value)} : x)})}/>
                        </div>
                      </Tooltip>
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="w-20 inline-block">
                      <Tooltip text="The current quantity of this item available in your inventory.">
                        <input type="number" className={`w-full p-2 bg-white rounded-lg border text-xs font-bold text-center ${item.qty < (item.lowStockThreshold || 10) ? 'border-red-200 text-red-600' : ''}`} value={item.qty} onChange={(e) => saveToDisk({...library, inventory: library.inventory.map(x => x.id === item.id ? {...x, qty: parseInt(e.target.value)} : x)})}/>
                      </Tooltip>
                    </div>
                  </td>
                  <td className="text-center">
                    <button onClick={() => deleteConsumable(item.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                      <Trash2 size={16}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(library.inventory || []).length === 0 && (
            <p className="text-center text-slate-400 text-sm py-8">No consumables added yet. Add items like magnets, boxes, or bubble wrap above.</p>
          )}
        </Accordion>

        <Accordion title="Subscriptions">
          {/* ADD NEW SUBSCRIPTION */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
              <Plus size={12} /> Add Subscription
            </div>
            <div className="flex gap-3 items-center">
              <div className="w-[40%]">
                <Tooltip text="Name of the subscription (e.g., Patreon - MakersMuse, Fusion 360, Cura Pro).">
                  <input placeholder="Subscription Name" value={newSubscription.name} onChange={(e) => setNewSubscription({...newSubscription, name: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
                </Tooltip>
              </div>
              <div className="w-[20%] flex items-center gap-2 px-4 bg-white border border-slate-200 rounded-2xl">
                <span className="text-slate-400 font-bold">$</span>
                <Tooltip text="Cost per billing cycle.">
                  <input type="number" step="0.01" placeholder="Cost" value={newSubscription.monthlyCost} onChange={(e) => setNewSubscription({...newSubscription, monthlyCost: e.target.value})} className="input-nested w-full py-4 bg-transparent outline-none font-bold text-sm" />
                </Tooltip>
              </div>
              <div className="w-[20%]">
                <Tooltip text="How often you're billed.">
                  <select value={newSubscription.cycle} onChange={(e) => setNewSubscription({...newSubscription, cycle: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm">
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </Tooltip>
              </div>
              <div className="w-[20%]">
                <Tooltip text="Optional link to manage the subscription.">
                  <input placeholder="URL (optional)" value={newSubscription.url} onChange={(e) => setNewSubscription({...newSubscription, url: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
                </Tooltip>
              </div>
            </div>
            <button onClick={handleAddSubscription} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">
              Add Subscription
            </button>
          </div>

          <hr className="border-slate-200 mb-6" />

          {/* SUBSCRIPTIONS LIST */}
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-400 uppercase font-black">
                <th className="pb-4">Subscription</th>
                <th className="pb-4 text-center">Cycle</th>
                <th className="pb-4 text-center">Cost</th>
                <th className="pb-4 text-center">Monthly</th>
                <th className="pb-4 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {(library.subscriptions || []).map(sub => {
                const isExpanded = expandedSubId === sub.id;
                const hasHistory = sub.priceHistory && sub.priceHistory.length > 0;

                return (
                  <React.Fragment key={sub.id}>
                    <tr className={`border-b border-slate-100 ${isExpanded ? 'bg-slate-50/50' : ''}`}>
                      {editingSubId === sub.id ? (
                        <>
                          <td className="py-3">
                            <input
                              className="w-full px-3 py-2 bg-white rounded-lg border font-bold text-sm outline-none"
                              value={editSubData.name}
                              onChange={e => setEditSubData({...editSubData, name: e.target.value})}
                              placeholder="Name"
                            />
                            <input
                              className="w-full px-3 py-2 mt-1 bg-white rounded-lg border font-medium text-xs outline-none text-slate-500"
                              value={editSubData.url || ''}
                              onChange={e => setEditSubData({...editSubData, url: e.target.value})}
                              placeholder="URL (optional)"
                            />
                          </td>
                          <td className="text-center">
                            <select
                              className="px-2 py-2 bg-white rounded-lg border font-bold text-xs"
                              value={editSubData.cycle}
                              onChange={e => setEditSubData({...editSubData, cycle: e.target.value})}
                            >
                              <option value="monthly">Monthly</option>
                              <option value="yearly">Yearly</option>
                            </select>
                          </td>
                          <td className="text-center">
                            <input
                              type="number"
                              step="0.01"
                              className="w-20 px-2 py-2 bg-white rounded-lg border font-bold text-sm text-center"
                              value={editSubData.monthlyCost}
                              onChange={e => setEditSubData({...editSubData, monthlyCost: e.target.value})}
                            />
                          </td>
                          <td></td>
                          <td className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={saveSubscription} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition">
                                <Check size={16}/>
                              </button>
                              <button onClick={() => setEditingSubId(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition">
                                <X size={16}/>
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setExpandedSubId(isExpanded ? null : sub.id)}
                                className="p-1 text-slate-400 hover:text-blue-500 transition"
                              >
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                              <CreditCard className="text-blue-500" size={16} />
                              {sub.url ? (
                                <a href={sub.url} target="_blank" rel="noopener noreferrer" className="font-black uppercase text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                  {sub.name}
                                  <ExternalLink size={12} />
                                </a>
                              ) : (
                                <span className="font-black uppercase text-sm">{sub.name}</span>
                              )}
                            </div>
                          </td>
                          <td className="text-center">
                            <span className="text-xs font-bold text-slate-500 uppercase">{sub.cycle}</span>
                          </td>
                          <td className="text-center">
                            <span className="text-sm font-bold text-slate-700">${sub.monthlyCost.toFixed(2)}</span>
                          </td>
                          <td className="text-center">
                            <span className="text-sm font-bold text-blue-600">
                              ${(sub.cycle === 'yearly' ? sub.monthlyCost / 12 : sub.monthlyCost).toFixed(2)}
                            </span>
                          </td>
                          <td className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => { setEditingSubId(sub.id); setEditSubData(sub); }} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition">
                                <Edit2 size={16}/>
                              </button>
                              <button onClick={() => deleteSubscription(sub.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                                <Trash2 size={16}/>
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>

                    {/* Expanded Price History */}
                    {isExpanded && (
                      <tr className="bg-slate-50/80">
                        <td colSpan="5" className="px-6 py-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                Price History
                              </span>
                            </div>

                            {hasHistory ? (
                              <div className="space-y-2">
                                {sub.priceHistory.map((period, idx) => (
                                  <div key={period.id} className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-200">
                                    <span className="text-sm font-bold text-blue-600 w-20">
                                      ${period.price.toFixed(2)}
                                    </span>
                                    <span className="text-xs text-slate-500 flex-1">
                                      {period.startDate}
                                      <span className="mx-2">→</span>
                                      {period.endDate || 'Current'}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400">
                                      {monthsBetween(period.startDate, period.endDate)} mo
                                    </span>
                                    {idx === sub.priceHistory.length - 1 && (
                                      <button
                                        onClick={() => deletePricePeriod(sub.id, period.id)}
                                        className="p-1 text-slate-400 hover:text-red-500 transition"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    )}
                                  </div>
                                ))}

                                {/* Add Price Change */}
                                <div className="mt-3 pt-3 border-t border-slate-200">
                                  {showPriceChangeForm === sub.id ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase">New Price:</span>
                                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-3">
                                        <span className="text-slate-400">$</span>
                                        <input
                                          type="number"
                                          step="0.01"
                                          placeholder="0.00"
                                          value={newPriceEntry.price}
                                          onChange={e => setNewPriceEntry({...newPriceEntry, price: e.target.value})}
                                          className="input-nested w-24 py-2 bg-transparent outline-none text-sm font-bold"
                                        />
                                      </div>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase">Starting:</span>
                                      <input
                                        type="date"
                                        value={newPriceEntry.startDate}
                                        onChange={e => setNewPriceEntry({...newPriceEntry, startDate: e.target.value})}
                                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-sm outline-none"
                                      />
                                      <button
                                        onClick={() => { addPricePeriod(sub.id); setShowPriceChangeForm(null); }}
                                        disabled={!newPriceEntry.price || !newPriceEntry.startDate}
                                        className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                      >
                                        Add
                                      </button>
                                      <button
                                        onClick={() => { setShowPriceChangeForm(null); setNewPriceEntry({ price: '', startDate: '' }); }}
                                        className="px-2 py-1 text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase transition"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setShowPriceChangeForm(sub.id)}
                                      className="text-[10px] font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1 transition"
                                    >
                                      <Plus size={12} /> Price Changed?
                                    </button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-sm text-slate-400 mb-2">No price history tracked yet.</p>
                                <button
                                  onClick={() => startPriceTracking(sub.id)}
                                  className="px-4 py-2 bg-blue-600 text-white text-[10px] font-bold uppercase rounded-lg hover:bg-blue-700 transition"
                                >
                                  Start Tracking
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {(library.subscriptions || []).length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-8">No subscriptions added yet. Track your Patreon, software, or service costs here.</p>
          ) : (
            <div className="mt-6 p-4 bg-blue-50 rounded-2xl flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-widest text-blue-600">Total Monthly Cost</span>
              <span className="text-xl font-black text-blue-600">${totalMonthlyCost.toFixed(2)}/mo</span>
            </div>
          )}
        </Accordion>
      </div>
    </div>
  );
};

export default FilamentTab;