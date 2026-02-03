import React, { useState } from 'react';
import {
  Plus, Trash2, Edit2, Check, X,
  RefreshCw, AlertCircle, Copy, FlaskConical
} from 'lucide-react';

import generateUniqueId from '../utils/idGenerator';
import Tooltip from './Tooltip';
import Accordion from './Accordion';

const FilamentTab = ({ library, saveToDisk }) => {
  const [newFilament, setNewFilament] = useState({ name: '', colorName: '', price: '', grams: 1000, color: '#3b82f6' });
  const [newConsumable, setNewConsumable] = useState({ name: '', qty: '', totalCost: '' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-10">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-3">
              <FlaskConical className="text-blue-600" size={28} /> Materials
            </h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Live stock tracking & procurement</p>
          </div>
        </div>

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
              <div className="w-[20%] flex items-center gap-2 px-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-slate-400 font-bold">$</span>
                <Tooltip text="The cost of the entire spool of filament in your local currency.">
                  <input type="number" placeholder="Price" value={newFilament.price} onChange={(e) => setNewFilament({...newFilament, price: e.target.value})} className="w-full py-4 bg-transparent outline-none font-bold text-sm" />
                </Tooltip>
              </div>
              <div className="w-[20%] flex items-center gap-2 px-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-slate-400 font-bold">g</span>
                <Tooltip text="The total weight of the filament spool in grams (e.g., 1000g, 750g).">
                  <input type="number" placeholder="Weight" value={newFilament.grams} onChange={(e) => setNewFilament({...newFilament, grams: e.target.value})} className="w-full py-4 bg-transparent outline-none font-bold text-sm" />
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
              <div className="w-[25%] flex items-center gap-2 px-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-slate-400 font-bold">#</span>
                <Tooltip text="Current quantity in stock.">
                  <input type="number" placeholder="Qty" value={newConsumable.qty} onChange={(e) => setNewConsumable({...newConsumable, qty: e.target.value})} className="w-full py-4 bg-transparent outline-none font-bold text-sm" />
                </Tooltip>
              </div>
              <div className="w-[25%] flex items-center gap-2 px-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-slate-400 font-bold">$</span>
                <Tooltip text="Total cost for the entire order (unit cost will be calculated automatically).">
                  <input type="number" step="0.01" placeholder="Total Cost" value={newConsumable.totalCost} onChange={(e) => setNewConsumable({...newConsumable, totalCost: e.target.value})} className="w-full py-4 bg-transparent outline-none font-bold text-sm" />
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
      </div>
    </div>
  );
};

export default FilamentTab;