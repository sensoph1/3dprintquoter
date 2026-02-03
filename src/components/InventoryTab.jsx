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
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-400 uppercase font-black">
                <th className="pb-4">Part Name</th>
                <th className="pb-4">Quoted Price</th>
                <th className="pb-4 text-center">Stock</th>
              </tr>
            </thead>
            <tbody>
              {library.printedParts.map(part => (
                <tr key={part.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="py-4">
                    <div className="font-black text-slate-800 uppercase tracking-tight">{part.name}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{part.color}</div>
                  </td>
                  <td>
                    <div className="text-lg font-black text-blue-600">${part.unitPrice}</div>
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-4 bg-white p-2 rounded-2xl border shadow-sm">
                      <button onClick={() => updatePartQty(part.id, -1)} className="p-2 bg-slate-100 rounded-lg hover:bg-red-50 transition"><Minus size={16}/></button>
                      <div className="w-12 text-center font-black text-xl">{part.qty}</div>
                      <button onClick={() => updatePartQty(part.id, 1)} className="p-2 bg-slate-100 rounded-lg hover:bg-blue-50 transition"><Plus size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SECTION B: SHOP INVENTORY */}
      {(view === 'shop' || !view) && (
        <div className="bg-white rounded-[2rem] border p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Package className="text-blue-600" />
            <h2 className="font-black text-lg uppercase tracking-tight">Consumables & Shipping</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-400 uppercase font-black">
                <th className="pb-4">Item Name</th>
                <th className="pb-4 text-center">Stock</th>
              </tr>
            </thead>
            <tbody>
              {library.inventory.map(item => (
                <tr key={item.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="py-4">
                    <Tooltip text="The name of this consumable or shipping item.">
                      <input className="bg-transparent font-black uppercase text-sm outline-none w-full" value={item.name} onChange={(e) => saveToDisk({...library, inventory: library.inventory.map(x => x.id === item.id ? {...x, name: e.target.value} : x)})}/>
                    </Tooltip>
                  </td>
                  <td className="text-center">
                    <div className="w-20 inline-block">
                      <Tooltip text="The current quantity of this item available in your inventory.">
                        <input type="number" className="w-full p-2 bg-white rounded-lg border text-xs font-bold text-center" value={item.qty} onChange={(e) => saveToDisk({...library, inventory: library.inventory.map(x => x.id === item.id ? {...x, qty: parseInt(e.target.value)} : x)})}/>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InventoryTab;