import React from 'react';
import { Package, Clock, Plus, Trash2, Settings2, Wrench, Info } from 'lucide-react';

const CalculatorTab = ({ job, setJob, library }) => {
  
  const totalGrams = (job.materials || []).reduce((sum, m) => sum + (parseFloat(m.grams) || 0), 0);

  const handleMaterialChange = (index, field, value) => {
    const updatedMaterials = [...job.materials];
    updatedMaterials[index] = { 
      ...updatedMaterials[index], 
      [field]: field === 'filamentId' ? parseInt(value) : parseFloat(value) || 0 
    };
    setJob({ ...job, materials: updatedMaterials });
  };

  const addMaterial = () => {
    setJob({ 
      ...job, 
      materials: [...job.materials, { filamentId: library.filaments[0]?.id || 1, grams: 0 }] 
    });
  };

  const removeMaterial = (index) => {
    const updated = job.materials.filter((_, i) => i !== index);
    setJob({ ...job, materials: updated });
  };

  const InputLabel = ({ text, icon: Icon }) => (
    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1 mb-2 flex items-center gap-2">
      {Icon && <Icon size={12} />} {text}
    </label>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-10">
        
        {/* SECTION A: PROJECT IDENTITY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <InputLabel text="Project / Part Name" icon={Info} />
            <input type="text" value={job.name} onChange={(e) => setJob({...job, name: e.target.value})} placeholder="e.g. Industrial Housing" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
          </div>
          <div className="space-y-2">
            <InputLabel text="Quantity" />
            <input type="number" value={job.qty} onChange={(e) => setJob({...job, qty: parseInt(e.target.value) || 1})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
          </div>
        </div>

        <hr className="border-slate-50" />

        {/* SECTION B: MATERIALS */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <InputLabel text="Material Consumption" icon={Package} />
            <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
              Total: {totalGrams}g
            </div>
          </div>
          <div className="space-y-3">
            {job.materials.map((m, index) => {
              const selectedFilament = library.filaments.find(f => f.id === m.filamentId) || library.filaments[0];
              return (
                <div key={index} className="flex flex-col md:flex-row gap-3 p-3 bg-slate-50 rounded-[2rem] items-center border border-slate-100">
                  <div className="w-10 h-10 rounded-2xl shadow-inner border-4 border-white flex-shrink-0" style={{ backgroundColor: selectedFilament?.color || '#3b82f6' }} />
                  <select value={m.filamentId} onChange={(e) => handleMaterialChange(index, 'filamentId', e.target.value)} className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none appearance-none">
                    {library.filaments.map(f => <option key={f.id} value={f.id}>{f.name} — {f.colorName}</option>)}
                  </select>
                  <div className="flex items-center gap-2 w-full md:w-32 bg-white px-3 py-1 rounded-xl border border-slate-200">
                    <input type="number" value={m.grams} onChange={(e) => handleMaterialChange(index, 'grams', e.target.value)} className="w-full py-2 bg-transparent font-bold text-sm outline-none text-right" />
                    <span className="text-[10px] font-black text-slate-300 uppercase">g</span>
                  </div>
                  {job.materials.length > 1 ? (
                    <button onClick={() => removeMaterial(index)} className="p-3 text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>
                  ) : (
                    <button onClick={addMaterial} className="p-3 text-blue-400 hover:text-blue-600"><Plus size={18} /></button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <hr className="border-slate-50" />

        {/* SECTION C: SLICER & PRINT SPECS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <InputLabel text="Slicer Settings" icon={Settings2} />
            <div className="grid grid-cols-2 gap-3">
              {['infill', 'walls', 'layerHeight', 'supports'].map((field) => (
                <div key={field} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">{field}</span>
                  <input type="text" value={job[field] || ''} onChange={e => setJob({...job, [field]: e.target.value})} className="w-full bg-transparent font-bold text-sm outline-none" placeholder="--" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <InputLabel text="Time & Labor" icon={Clock} />
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest block mb-1 italic">Print Time (Hrs)</span>
                  <input type="number" value={job.hours} onChange={e => setJob({...job, hours: parseFloat(e.target.value) || 0})} className="w-full bg-transparent font-black text-blue-600 text-lg outline-none" />
                </div>
                <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Labor (Hrs)</span>
                  <input type="number" value={job.laborHours} onChange={e => setJob({...job, laborHours: parseFloat(e.target.value) || 0})} className="w-full bg-transparent font-bold text-lg outline-none" />
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Hardware / Extra Costs ($)</span>
                <input type="number" value={job.extraCosts} onChange={e => setJob({...job, extraCosts: parseFloat(e.target.value) || 0})} className="w-full bg-transparent font-bold text-sm outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION D: PRINTER */}
        <div className="pt-4">
          <InputLabel text="Assigned Hardware" icon={Wrench} />
          <select value={job.selectedPrinterId} onChange={(e) => setJob({...job, selectedPrinterId: parseInt(e.target.value)})} className="w-full px-6 py-4 bg-slate-900 text-white rounded-2xl outline-none font-bold text-sm appearance-none cursor-pointer hover:bg-slate-800 transition-colors">
            {library.printers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};

export default CalculatorTab;