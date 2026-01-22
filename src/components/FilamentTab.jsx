import React, { useState } from 'react';
import { Plus, Trash2, Cloud, Edit2, Check, X } from 'lucide-react';

const FilamentTab = ({ library, saveToDisk }) => {
  const [newFilament, setNewFilament] = useState({ name: '', price: '', grams: 1000, color: '#3b82f6' });
  
  // State to track which item is being edited
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleAdd = () => {
    if (!newFilament.name || !newFilament.price) return;
    const updatedFilaments = [
      ...library.filaments,
      { ...newFilament, id: Date.now(), price: parseFloat(newFilament.price) }
    ];
    saveToDisk({ ...library, filaments: updatedFilaments });
    setNewFilament({ name: '', price: '', grams: 1000, color: '#3b82f6' });
  };

  const startEdit = (f) => {
    setEditingId(f.id);
    setEditData({ ...f });
  };

  const saveEdit = () => {
    const updatedFilaments = library.filaments.map(f => 
      f.id === editingId ? { ...editData, price: parseFloat(editData.price) } : f
    );
    saveToDisk({ ...library, filaments: updatedFilaments });
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this filament?")) {
      const updatedFilaments = library.filaments.filter(f => f.id !== id);
      saveToDisk({ ...library, filaments: updatedFilaments });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">Material Library</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Manage stock and pricing</p>
        </div>
        <button onClick={() => saveToDisk(library)} className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-100 transition-all">
          <Cloud size={16} /> Sync Cloud
        </button>
      </div>

      {/* QUICK ADD FORM */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input placeholder="Material Name" value={newFilament.name} onChange={(e) => setNewFilament({...newFilament, name: e.target.value})} className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
          <input type="number" placeholder="Price ($)" value={newFilament.price} onChange={(e) => setNewFilament({...newFilament, price: e.target.value})} className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
          <input type="number" placeholder="Grams" value={newFilament.grams} onChange={(e) => setNewFilament({...newFilament, grams: e.target.value})} className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
          <button onClick={handleAdd} className="bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
            <Plus size={18} /> Add
          </button>
        </div>
      </div>

      {/* FILAMENT LIST */}
      <div className="grid grid-cols-1 gap-4">
        {library.filaments.map((f) => (
          <div key={f.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between">
            {editingId === f.id ? (
              /* EDIT MODE UI */
              <div className="flex flex-1 gap-4 items-center">
                <input className="flex-1 px-4 py-2 bg-slate-50 rounded-xl border font-bold outline-none focus:ring-2 focus:ring-blue-500" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                <input type="number" className="w-24 px-4 py-2 bg-slate-50 rounded-xl border font-bold outline-none focus:ring-2 focus:ring-blue-500" value={editData.price} onChange={e => setEditData({...editData, price: e.target.value})} />
                <input type="number" className="w-24 px-4 py-2 bg-slate-50 rounded-xl border font-bold outline-none focus:ring-2 focus:ring-blue-500" value={editData.grams} onChange={e => setEditData({...editData, grams: e.target.value})} />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"><Check size={18}/></button>
                  <button onClick={() => setEditingId(null)} className="p-3 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300"><X size={18}/></button>
                </div>
              </div>
            ) : (
              /* VIEW MODE UI */
              <>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl shadow-inner border-2 border-white" style={{ backgroundColor: f.color || '#3b82f6' }} />
                  <div>
                    <h3 className="font-black text-slate-800 uppercase text-sm">{f.name}</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      ${f.price} / {f.grams}g — <span className="text-blue-500">${(f.price / f.grams).toFixed(4)}/g</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(f)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(f.id)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={18} />
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