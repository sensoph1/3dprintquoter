import React from 'react';
import { Plus, Printer as PrinterIcon, Trash2, Zap, Hourglass } from 'lucide-react';

const PrinterTab = ({ library, saveToDisk }) => {
  const addPrinter = () => {
    const newPrinter = { 
      id: Date.now(), 
      name: 'New Printer', 
      watts: 350, 
      cost: 500, 
      lifespan: 10000 
    };
    saveToDisk({ ...library, printers: [...library.printers, newPrinter] });
  };

  const updatePrinter = (id, field, value) => {
    const newPrinters = library.printers.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    );
    saveToDisk({ ...library, printers: newPrinters });
  };

  return (
    <div className="bg-white rounded-[2rem] border p-8 shadow-sm animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-black text-xl uppercase tracking-tighter text-slate-800">Printer Fleet</h2>
        <button onClick={addPrinter} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-[10px] flex items-center gap-2 hover:bg-blue-700 transition">
          <Plus size={16}/> ADD PRINTER
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {library.printers.map(p => (
          <div key={p.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
            <div className="bg-white p-4 rounded-2xl shadow-sm border text-blue-600">
              <PrinterIcon size={24} />
            </div>
            <div className="flex-grow">
              <input className="font-black uppercase w-full bg-transparent border-b-2 border-transparent focus:border-blue-500 outline-none pb-1" value={p.name} onChange={(e) => updatePrinter(p.id, 'name', e.target.value)}/>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1 mb-1"><Zap size={10}/> Watts</label>
                <input type="number" className="w-full bg-white p-2 rounded-lg border text-sm font-bold" value={p.watts} onChange={(e) => updatePrinter(p.id, 'watts', parseInt(e.target.value))}/>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1 mb-1"><Hourglass size={10}/> Life (Hrs)</label>
                <input type="number" className="w-full bg-white p-2 rounded-lg border text-sm font-bold" value={p.lifespan} onChange={(e) => updatePrinter(p.id, 'lifespan', parseInt(e.target.value))}/>
              </div>
              <div className="flex items-end">
                <button onClick={() => saveToDisk({...library, printers: library.printers.filter(x => x.id !== p.id)})} className="p-2 text-slate-300 hover:text-red-500 transition"><Trash2 size={20}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrinterTab;