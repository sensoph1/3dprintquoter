import React from 'react';
import { Minus, Plus, Trash2, Package, Tag } from 'lucide-react';
import Tooltip from './Tooltip';

const InventoryTab = ({ library, saveToDisk, view }) => {
  const updatePartQty = (id, delta) => {
    const newParts = library.printedParts.map(p => 
      p.id === id ? { ...p, qty: Math.max(0, p.qty + delta) } : p
    );
    saveToDisk({ ...library, printedParts: newParts });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
      
      {/* SECTION A: PRINTED INVENTORY */}
      {(view === 'printed' || !view) && (
        <div className="bg-white rounded-[2rem] border p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <Tag className="text-blue-600" />
            <h2 className="font-black text-xl uppercase tracking-tighter">Finished Products</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {library.printedParts.map(part => (
              <div key={part.id} className="flex flex-col md:flex-row items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="flex-grow">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{part.color}</div>
                  <div className="text-xl font-black text-slate-800 uppercase tracking-tight">{part.name}</div>
                  <Tooltip text="The calculated sale price per unit for this finished product.">
                    <div className="text-[10px] font-bold text-blue-600 uppercase mt-1">Value: ${part.unitPrice} / unit</div>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border shadow-sm">
                  <button onClick={() => updatePartQty(part.id, -1)} className="p-2 bg-slate-100 rounded-lg hover:bg-red-50 transition"><Minus size={16}/></button>
                  <div className="w-12 text-center font-black text-xl">{part.qty}</div>
                  <button onClick={() => updatePartQty(part.id, 1)} className="p-2 bg-slate-100 rounded-lg hover:bg-blue-50 transition"><Plus size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION B: SHOP INVENTORY */}
      {(view === 'shop' || !view) && (
        <div className="bg-white rounded-[2rem] border p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Package className="text-blue-600" />
            <h2 className="font-black text-lg uppercase tracking-tight">Consumables & Shipping</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {library.inventory.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Tooltip text="The name of this consumable or shipping item.">
                  <input className="bg-transparent font-black uppercase text-sm outline-none flex-grow" value={item.name} onChange={(e) => saveToDisk({...library, inventory: library.inventory.map(x => x.id === item.id ? {...x, name: e.target.value} : x)})}/>
                </Tooltip>
                <div className="w-20">
                  <Tooltip text="The current quantity of this item available in your inventory.">
                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">In Stock</label>
                  </Tooltip>
                  <input type="number" className="w-full p-2 bg-white rounded-lg border text-xs font-bold" value={item.qty} onChange={(e) => saveToDisk({...library, inventory: library.inventory.map(x => x.id === item.id ? {...x, qty: parseInt(e.target.value)} : x)})}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTab;