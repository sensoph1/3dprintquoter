import React, { useState } from 'react';
import { 
  Plus, Trash2, Cloud, Edit2, Check, X, 
  RefreshCw, AlertCircle, Copy, FlaskConical, Palette 
} from 'lucide-react';

const FilamentTab = ({ library, saveToDisk }) => {
  const [newFilament, setNewFilament] = useState({ name: '', colorName: '', price: '', grams: 1000, color: '#3b82f6' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleAdd = () => {
    if (!newFilament.name || !newFilament.price) return;
    const updatedFilaments = [
      ...library.filaments,
      { ...newFilament, id: Date.now(), price: parseFloat(newFilament.price), grams: parseFloat(newFilament.grams) }
    ];
    saveToDisk({ ...library, filaments: updatedFilaments });
    setNewFilament({ name: '', colorName: '', price: '', grams: 1000, color: '#3b82f6' });
  };

  const handleDuplicate = (f) => {
    const duplicated = { ...f, id: Date.now(), name: `${f.name} (Copy)` };
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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-10">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-3">
              <FlaskConical className="text-blue-600" size={28} /> Material Ledger
            </h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Live stock tracking & procurement</p>
          </div>
          <button onClick={() => saveToDisk(library)} className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-all">
            <Cloud size={16} /> Sync Cloud
          </button>
        </div>

        {/* QUICK ADD SECTION (Now inside the sheet) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
            <Plus size={12} /> Add New Spool
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input placeholder="Brand (e.g. Polymaker)" value={newFilament.name} onChange={(e) => setNewFilament({...newFilament, name: e.target.value})} className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
            <input placeholder="Color Name" value={newFilament.colorName} onChange={(e) => setNewFilament({...newFilament, colorName: e.target.value})} className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
            <div className="flex items-center gap-2 px-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <span className="text-slate-400 font-bold">$</span>
              <input type="number" placeholder="Price" value={newFilament.price} onChange={(e) => setNewFilament({...newFilament, price: e.target.value})} className="w-full py-4 bg-transparent outline-none font-bold text-sm" />
            </div>
            <div className="flex items-center gap-2 px-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <span className="text-slate-400 font-bold">g</span>
              <input type="number" placeholder="Weight" value={newFilament.grams} onChange={(e) => setNewFilament({...newFilament, grams: e.target.value})} className="w-full py-4 bg-transparent outline-none font-bold text-sm" />
            </div>
            <button onClick={handleAdd} className="bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">
              Register Spool
            </button>
          </div>
        </div>

        <hr className="border-slate-50" />

        {/* INVENTORY LIST */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full mb-2">
            <Palette size={12} /> Current Inventory
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {library.filaments.map((f) => (
              <div key={f.id} className={`p-5 rounded-[2rem] border transition-all flex items-center justify-between ${f.grams < 100 ? 'border-red-100 bg-red-50/20' : 'bg-slate-50/50 border-slate-100'}`}>
                {editingId === f.id ? (
                  /* EDIT MODE */
                  <div className="flex flex-1 gap-3 items-center">
                    <input className="flex-1 px-4 py-3 bg-white rounded-xl border font-bold text-sm outline-none" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                    <input className="flex-1 px-4 py-3 bg-white rounded-xl border font-bold text-sm outline-none" value={editData.colorName} onChange={e => setEditData({...editData, colorName: e.target.value})} />
                    <input type="color" className="w-10 h-10 border-none bg-transparent cursor-pointer" value={editData.color} onChange={e => setEditData({...editData, color: e.target.value})} />
                    <input type="number" className="w-20 px-4 py-3 bg-white rounded-xl border font-bold text-sm" value={editData.price} onChange={e => setEditData({...editData, price: e.target.value})} />
                    <div className="flex gap-1">
                      <button onClick={saveEdit} className="p-3 bg-blue-600 text-white rounded-xl"><Check size={16}/></button>
                      <button onClick={() => setEditingId(null)} className="p-3 bg-slate-200 text-slate-600 rounded-xl"><X size={16}/></button>
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
        </div>
      </div>
    </div>
  );
};

export default FilamentTab;