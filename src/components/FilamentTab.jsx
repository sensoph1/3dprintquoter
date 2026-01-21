import React from 'react';
import { Plus, FlaskConical, Trash2, Weight, DollarSign } from 'lucide-react';

const FilamentTab = ({ library, saveToDisk }) => {
  const addFilament = () => {
    const newFilament = { 
      id: Date.now(), 
      name: 'New Material', 
      price: 25.00, 
      grams: 1000, 
      color: '#64748b' 
    };
    saveToDisk({ ...library, filaments: [...library.filaments, newFilament] });
  };

  const updateFilament = (id, field, value) => {
    const newFilaments = library.filaments.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    );
    saveToDisk({ ...library, filaments: newFilaments });
  };

  const removeFilament = (id) => {
    const newFilaments = library.filaments.filter(f => f.id !== id);
    saveToDisk({ ...library, filaments: newFilaments });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
      <div className="bg-white rounded-[2rem] border p-8 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
              <FlaskConical size={20} />
            </div>
            <h2 className="font-black text-xl uppercase tracking-tighter text-slate-800">Material Library</h2>
          </div>
          <button 
            onClick={addFilament} 
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            <Plus size={16}/> ADD MATERIAL
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {library.filaments.map(f => (
            <div key={f.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-blue-200 transition-colors group">
              <div className="flex items-center gap-4 mb-4">
                <input 
                  type="color" 
                  value={f.color} 
                  onChange={(e) => updateFilament(f.id, 'color', e.target.value)}
                  className="w-8 h-8 rounded-full border-none cursor-pointer bg-transparent"
                />
                <input 
                  className="font-black uppercase text-lg w-full bg-transparent border-b-2 border-transparent focus:border-blue-500 outline-none pb-1" 
                  value={f.name} 
                  onChange={(e) => updateFilament(f.id, 'name', e.target.value)}
                  placeholder="Material Name"
                />
                <button 
                  onClick={() => removeFilament(f.id)}
                  className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-2xl border border-slate-100">
                  <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1 mb-1">
                    <DollarSign size={10}/> Spool Cost
                  </label>
                  <div className="flex items-center">
                    <span className="text-slate-400 font-bold mr-1">$</span>
                    <input 
                      type="number" 
                      className="w-full bg-transparent font-bold text-slate-700 outline-none" 
                      value={f.price} 
                      onChange={(e) => updateFilament(f.id, 'price', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-slate-100">
                  <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1 mb-1">
                    <Weight size={10}/> Total Grams
                  </label>
                  <div className="flex items-center">
                    <input 
                      type="number" 
                      className="w-full bg-transparent font-bold text-slate-700 outline-none text-right mr-1" 
                      value={f.grams} 
                      onChange={(e) => updateFilament(f.id, 'grams', parseFloat(e.target.value) || 0)}
                    />
                    <span className="text-slate-400 font-bold">g</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 px-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                Cost per gram: ${(f.price / (f.grams || 1)).toFixed(4)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilamentTab;