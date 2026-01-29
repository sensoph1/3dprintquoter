import React, { useState } from 'react';
import { 
  Plus, Trash2, Cloud, Edit2, Check, X, 
  Cpu, Zap, Gauge, Settings, HardDrive 
} from 'lucide-react';
import Tooltip from './Tooltip';

const PrinterTab = ({ library, saveToDisk }) => {
  const [newPrinter, setNewPrinter] = useState({ name: '', watts: 300, cost: 0 });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleAdd = () => {
    if (!newPrinter.name) return;
    const updatedPrinters = [
      ...library.printers,
      { ...newPrinter, id: Date.now(), watts: parseFloat(newPrinter.watts), cost: parseFloat(newPrinter.cost) }
    ];
    saveToDisk({ ...library, printers: updatedPrinters });
    setNewPrinter({ name: '', watts: 300, cost: 0 });
  };

  const saveEdit = () => {
    const updated = library.printers.map(p => 
      p.id === editingId ? { ...editData, watts: parseFloat(editData.watts), cost: parseFloat(editData.cost) } : p
    );
    saveToDisk({ ...library, printers: updated });
    setEditingId(null);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-10">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-3">
              <Cpu className="text-blue-600" size={28} /> Hardware Fleet
            </h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Manage active machines & power consumption</p>
          </div>
          <button onClick={() => saveToDisk(library)} className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-all">
            <Cloud size={16} /> Sync Fleet
          </button>
        </div>

        {/* ADD NEW PRINTER */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
            <Plus size={12} /> Add Machine
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Tooltip text="A descriptive name for your 3D printer (e.g., Voron 2.4, Ender 3 Pro).">
              <input 
                placeholder="Printer Name (e.g. Voron 2.4)" 
                value={newPrinter.name} 
                onChange={(e) => setNewPrinter({...newPrinter, name: e.target.value})} 
                className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm col-span-1 md:col-span-2" 
              />
            </Tooltip>
            <div className="flex items-center gap-2 px-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <Zap size={14} className="text-slate-400" />
              <Tooltip text="The maximum power your printer draws in Watts. This is used to calculate energy costs.">
                <input 
                  type="number" 
                  placeholder="Peak Power Consumption (Watts)" 
                  value={newPrinter.watts} 
                  onChange={(e) => setNewPrinter({...newPrinter, watts: e.target.value})} 
                  className="w-full py-4 bg-transparent outline-none font-bold text-sm" 
                />
              </Tooltip>
            </div>
            <button onClick={handleAdd} className="bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">
              Deploy Machine
            </button>
          </div>
        </div>

        <hr className="border-slate-50" />

        {/* PRINTER LIST */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full mb-2">
            <HardDrive size={12} /> Active Hardware
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {library.printers.map((p) => (
              <div key={p.id} className="p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100 transition-all flex items-center justify-between">
                {editingId === p.id ? (
                  /* EDIT MODE */
                  <div className="flex flex-1 gap-3 items-center">
                    <Tooltip text="The name of your 3D printer.">
                      <input className="flex-1 px-4 py-3 bg-white rounded-xl border font-bold text-sm outline-none" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                    </Tooltip>
                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200">
                      <Zap size={12} className="text-slate-300" />
                      <Tooltip text="The maximum power your printer draws in Watts.">
                        <input type="number" className="w-20 py-2 bg-transparent font-bold text-sm" value={editData.watts} onChange={e => setEditData({...editData, watts: e.target.value})} placeholder="Peak Power" />
                      </Tooltip>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={saveEdit} className="p-3 bg-blue-600 text-white rounded-xl"><Check size={16}/></button>
                      <button onClick={() => setEditingId(null)} className="p-3 bg-slate-200 text-slate-600 rounded-xl"><X size={16}/></button>
                    </div>
                  </div>
                ) : (
                  /* VIEW MODE */
                  <>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-blue-600">
                        <Gauge size={24} />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 uppercase text-xs leading-none">
                          {p.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                            <Zap size={10} /> {p.watts} Peak W Consumption
                          </p>
                          <span className="w-1 h-1 bg-slate-200 rounded-full" />
                          <p className="text-[10px] font-bold uppercase tracking-widest text-green-500">Online</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingId(p.id); setEditData(p); }} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all"><Edit2 size={16} /></button>
                      <button onClick={() => library.printers.length > 1 && saveToDisk({...library, printers: library.printers.filter(x => x.id !== p.id)})} className="p-3 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all"><Trash2 size={16} /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrinterTab;