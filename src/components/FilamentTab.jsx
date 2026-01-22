import React, { useState } from 'react';
import { Plus, Trash2, Cloud, Edit2, Check, X, RefreshCw, AlertCircle, Copy, Palette } from 'lucide-react';

const FilamentTab = ({ library, saveToDisk }) => {
  const [newFilament, setNewFilament] = useState({ name: '', colorName: 'Basic', price: '', grams: 1000, color: '#3b82f6' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleAdd = () => {
    if (!newFilament.name || !newFilament.price) return;
    const updatedFilaments = [
      ...library.filaments,
      { 
        ...newFilament, 
        id: Date.now(), 
        price: parseFloat(newFilament.price), 
        grams: parseFloat(newFilament.grams) 
      }
    ];
    saveToDisk({ ...library, filaments: updatedFilaments });
    setNewFilament({ name: '', colorName: 'Basic', price: '', grams: 1000, color: '#3b82f6' });
  };

  const handleDuplicate = (f) => {
    const duplicatedSpool = {
      ...f,
      id: Date.now(),
      name: `${f.name} (Copy)`
    };
    const updatedFilaments = [...library.filaments, duplicatedSpool];
    saveToDisk({ ...library, filaments: updatedFilaments });
    setEditingId(duplicatedSpool.id);
    setEditData(duplicatedSpool);
  };

  const startEdit = (f) => {
    setEditingId(f.id);
    setEditData({ ...f });
  };

  const saveEdit = () => {
    const updatedFilaments = library.filaments.map(f => 
      f.id === editingId ? { ...editData, price: parseFloat(editData.price), grams: parseFloat(editData.grams) } : f
    );
    saveToDisk({ ...library, filaments: updatedFilaments });
    setEditingId(null);
  };

  const handleRefill = (id) => {
    const amount = window.prompt("Enter new weight in grams (e.g. 1000):", "1000");
    if (amount) {
      const updatedFilaments = library.filaments.map(f => 
        f.id === id ? { ...f, grams: parseFloat(amount) } : f
      );
      saveToDisk({ ...library, filaments: updatedFilaments });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this material permanently?")) {
      const updatedFilaments = library.filaments.filter(f => f.id !== id);
      saveToDisk({ ...library, filaments: updatedFilaments });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">Material Inventory</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Live stock levels & color tracking</p>
        </div>
        <button onClick={() => saveToDisk(library)} className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-100 transition-all">
          <Cloud size={16} /> Sync Database
        </button>
      </div>

      {/* QUICK ADD FORM */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input placeholder="Brand/Type" value={newFilament.name} onChange={(e) => setNewFilament({...newFilament, name: e.target.value})} className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
          <input placeholder="Color Name" value={newFilament.colorName} onChange={(e) => setNewFilament({...newFilament, colorName: e.target.value})} className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
          <input type="number" placeholder="Price ($)" value={newFilament.price} onChange={(e) => setNewFilament({...newFilament, price: e.target.value})} className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
          <input type="number" placeholder="Grams" value={newFilament.grams} onChange={(e) => setNewFilament({...newFilament, grams: e.target.value})} className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
          <button onClick={handleAdd} className="bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
            <Plus size={18} /> Add
          </button>
        </div>
      </div>

      {/* FILAMENT LIST */}
      <div className="grid grid-cols-1 gap-4">
        {library.filaments.map((f) => (
          <div key={f.id} className={`bg-white p-6 rounded-[2rem] border transition-all flex items-center justify-between ${f.grams < 100 ? 'border-red-200 bg-red-50/30' : 'border-slate-100'}`}>
            {editingId === f.id ? (
              <div className="flex flex-1 gap-4 items-center">
                <input className="flex-1 px-4 py-2 bg-white rounded-xl border font-bold text-sm" placeholder="Brand" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                <input className="flex-1 px-4 py-2 bg-white rounded-xl border font-bold text-sm" placeholder="Color Name" value={editData.colorName} onChange={e => setEditData({...editData, colorName: e.target.value})} />
                <input type="color" className="w-10 h-10 border-none bg-transparent cursor-pointer" value={editData.color} onChange={e => setEditData({...editData, color: e.target.value})} />
                <input type="number" className="w-20 px-4 py-2 bg-white rounded-xl border font-bold" value={editData.price} onChange={e => setEditData({...editData, price: e.target.value})} />
                <div className="flex gap-1">
                  <button onClick={saveEdit} className="p-3 bg-blue-600 text-white rounded-xl"><Check size={18}/></button>
                  <button onClick={() => setEditingId(null)} className="p-3 bg-slate-200 text-slate-600 rounded-xl"><X size={18}/></button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl shadow-inner border-4 border-white relative" style={{ backgroundColor: f.color || '#3b82f6' }}>
                    {f.grams < 100 && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 animate-bounce">
                        <AlertCircle size={12} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 uppercase text-sm flex items-center gap-2 leading-tight">
                      {f.name} — <span className="text-blue-600">{f.colorName || 'Default'}</span>
                    </h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                      ${f.price} / <span className={f.grams < 100 ? 'text-red-500 font-black' : ''}>{f.grams.toFixed(0)}g left</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDuplicate(f)} title="Duplicate Spool" className="p-3 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                    <Copy size={16} />
                  </button>
                  <button onClick={() => handleRefill(f.id)} title="Refill Spool" className="p-3 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all">
                    <RefreshCw size={16} />
                  </button>
                  <button onClick={() => startEdit(f)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(f.id)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilamentTab;