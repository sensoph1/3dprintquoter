import React from 'react';
import { Minus, Plus, Trash2, Box } from 'lucide-react';

const InventoryTab = ({ library, saveToDisk }) => {
  const updatePartQty = (id, delta) => {
    const newParts = library.printedParts.map(p =>
      p.id === id ? { ...p, qty: Math.max(0, p.qty + delta) } : p
    );
    saveToDisk({ ...library, printedParts: newParts });
  };

  const deletePart = (id) => {
    if (window.confirm("Remove this item from inventory?")) {
      saveToDisk({ ...library, printedParts: library.printedParts.filter(p => p.id !== id) });
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-3">
            <Box className="text-blue-600" size={28} /> Inventory
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Finished products ready for sale</p>
        </div>
      </div>

      {/* FINISHED PRODUCTS */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-400 uppercase font-black">
                <th className="pb-4">Part Name</th>
                <th className="pb-4">Category</th>
                <th className="pb-4 text-center">Profit Margin</th>
                <th className="pb-4 text-center">Hourly Rate</th>
                <th className="pb-4 text-center">Material Cost</th>
                <th className="pb-4 text-center">Stock</th>
                <th className="pb-4 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {library.printedParts.map(part => (
                <tr key={part.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="py-4">
                    <div className="font-black text-slate-800 uppercase tracking-tight">{part.name}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{part.color}</div>
                  </td>
                  <td className="py-4">
                    <div className="text-sm font-bold text-slate-500">{part.category || '—'}</div>
                  </td>
                  <td className="text-center">
                    <div className="text-lg font-black text-blue-600">${(part.priceByProfitMargin || part.unitPrice || 0).toFixed(2)}</div>
                  </td>
                  <td className="text-center">
                    <div className="text-lg font-black text-slate-600">${(part.priceByHourlyRate || 0).toFixed(2)}</div>
                  </td>
                  <td className="text-center">
                    <div className="text-lg font-black text-slate-600">${(part.priceByMaterialMultiplier || 0).toFixed(2)}</div>
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-2 bg-white p-2 rounded-xl border shadow-sm">
                      <div className="w-10 text-center font-black text-xl">{part.qty}</div>
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => updatePartQty(part.id, 1)} className="p-1 bg-slate-100 rounded hover:bg-blue-50 transition"><Plus size={12}/></button>
                        <button onClick={() => updatePartQty(part.id, -1)} className="p-1 bg-slate-100 rounded hover:bg-red-50 transition"><Minus size={12}/></button>
                      </div>
                    </div>
                  </td>
                  <td className="text-center">
                    <button onClick={() => deletePart(part.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                      <Trash2 size={16}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  );
};

export default InventoryTab;