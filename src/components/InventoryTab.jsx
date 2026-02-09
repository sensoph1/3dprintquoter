import React from 'react';
import { Minus, Plus, Trash2, Box, AlertTriangle, Download } from 'lucide-react';
import { formatPrintedPartsCSV, formatConsumablesCSV, downloadCSV } from '../utils/csvExport';

const InventoryTab = ({ library, saveToDisk }) => {
  const printedParts = library.printedParts || [];

  const updatePartQty = (id, delta) => {
    const newParts = printedParts.map(p =>
      p.id === id ? { ...p, qty: Math.max(0, p.qty + delta) } : p
    );
    saveToDisk({ ...library, printedParts: newParts });
  };

  const deletePart = (id) => {
    if (window.confirm("Remove this item from inventory?")) {
      saveToDisk({ ...library, printedParts: printedParts.filter(p => p.id !== id) });
    }
  };

  const categoryThresholds = library.categoryThresholds || {};

  const getThreshold = (part) => {
    if (part.category && categoryThresholds[part.category] !== undefined) {
      return categoryThresholds[part.category];
    }
    return 3; // default
  };

  const isLowStock = (part) => part.qty <= getThreshold(part);

  const isCritical = (part) => part.qty === 0;

  const lowStockParts = printedParts.filter(p => isLowStock(p));
  const lowStockConsumables = (library.inventory || []).filter(i => i.qty < (i.lowStockThreshold || 10));
  const totalLowStock = lowStockParts.length + lowStockConsumables.length;

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const csv = formatPrintedPartsCSV(printedParts);
              downloadCSV(`parts-inventory-${new Date().toISOString().slice(0, 10)}.csv`, csv);
            }}
            disabled={printedParts.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={14} /> Parts CSV
          </button>
          <button
            onClick={() => {
              const csv = formatConsumablesCSV(library.inventory || []);
              downloadCSV(`consumables-inventory-${new Date().toISOString().slice(0, 10)}.csv`, csv);
            }}
            disabled={(library.inventory || []).length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={14} /> Consumables CSV
          </button>
        </div>
      </div>

      {/* LOW STOCK ALERT BANNER */}
      {totalLowStock > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <div className="font-black text-amber-800 text-sm uppercase tracking-wide">Low Stock Alert</div>
            <div className="text-sm text-amber-700 mt-1 space-y-0.5">
              {lowStockParts.map(p => (
                <div key={p.id}>
                  <span className={`font-bold ${isCritical(p) ? 'text-red-600' : ''}`}>
                    {p.name}
                  </span>
                  {' — '}
                  {isCritical(p) ? 'Out of stock' : `${p.qty} left (low at ${getThreshold(p)})`}
                </div>
              ))}
              {lowStockConsumables.map(i => (
                <div key={i.id}>
                  <span className={`font-bold ${i.qty === 0 ? 'text-red-600' : ''}`}>
                    {i.name}
                  </span>
                  {' — '}
                  {i.qty === 0 ? 'Out of stock' : `${i.qty} left (threshold: ${i.lowStockThreshold || 10})`}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FINISHED PRODUCTS */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-400 uppercase font-black">
                <th className="pb-4">Part Name</th>
                <th className="pb-4">Category</th>
                <th className="pb-4 text-center whitespace-nowrap">Margin</th>
                <th className="pb-4 text-center whitespace-nowrap">Hourly</th>
                <th className="pb-4 text-center whitespace-nowrap">Material</th>
                <th className="pb-4 text-center whitespace-nowrap">Stock</th>
                <th className="pb-4 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {printedParts.map(part => {
                const low = isLowStock(part);
                const critical = isCritical(part);
                const rowClass = critical
                  ? 'bg-red-50/60'
                  : low
                    ? 'bg-amber-50/50'
                    : '';

                return (
                  <tr key={part.id} className={`border-b border-slate-100 last:border-b-0 ${rowClass}`}>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        {critical && <AlertTriangle className="text-red-500" size={14} />}
                        {low && !critical && <AlertTriangle className="text-amber-500" size={14} />}
                        <div>
                          <div className="font-black text-slate-800 uppercase tracking-tight">{part.name}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{part.color}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="text-sm font-bold text-slate-500">{part.category || '—'}</div>
                    </td>
                    <td className="text-center">
                      <div className="text-sm font-black text-blue-600">${(part.priceByProfitMargin || part.unitPrice || 0).toFixed(2)}</div>
                    </td>
                    <td className="text-center">
                      <div className="text-sm font-black text-slate-600">${(part.priceByHourlyRate || 0).toFixed(2)}</div>
                    </td>
                    <td className="text-center">
                      <div className="text-sm font-black text-slate-600">${(part.priceByMaterialMultiplier || 0).toFixed(2)}</div>
                    </td>
                    <td>
                      <div className={`inline-flex items-center gap-1 bg-white px-1.5 py-1 rounded-lg border ${critical ? 'border-red-200' : low ? 'border-amber-200' : 'border-slate-200'}`}>
                        <div className={`w-8 text-center font-black text-sm ${critical ? 'text-red-600' : low ? 'text-amber-600' : ''}`}>{part.qty}</div>
                        <div className="flex flex-col gap-px">
                          <button onClick={() => updatePartQty(part.id, 1)} className="p-0.5 bg-slate-100 rounded hover:bg-blue-50 transition"><Plus size={10}/></button>
                          <button onClick={() => updatePartQty(part.id, -1)} className="p-0.5 bg-slate-100 rounded hover:bg-red-50 transition"><Minus size={10}/></button>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">
                      <button onClick={() => deletePart(part.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
    </div>
  );
};

export default InventoryTab;
