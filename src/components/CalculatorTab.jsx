import React from 'react';
import { Clock, Weight, Percent, Settings2, Plus, Trash2, Layers, Info } from 'lucide-react';

const CalculatorTab = ({ job, setJob, library }) => {
  const handleChange = (field, value) => {
    setJob({ ...job, [field]: value });
  };

  const addMaterialRow = () => {
    const newMaterials = [...(job.materials || []), { filamentId: library.filaments[0].id, grams: 0 }];
    handleChange('materials', newMaterials);
  };

  const updateMaterialRow = (index, field, value) => {
    const newMaterials = job.materials.map((m, i) => 
      i === index ? { ...m, [field]: value } : m
    );
    handleChange('materials', newMaterials);
  };

  const removeMaterialRow = (index) => {
    const newMaterials = job.materials.filter((_, i) => i !== index);
    handleChange('materials', newMaterials);
  };

  const totalWeight = (job.materials || []).reduce((sum, m) => sum + (Number(m.grams) || 0), 0);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      
      {/* 1. PART IDENTITY */}
      <div className="bg-white rounded-[2rem] border p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-2">Part Name</label>
            <input 
              className="text-2xl font-black uppercase w-full bg-slate-50 p-6 rounded-3xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all"
              placeholder="e.g. TURBO FAN HOUSING"
              value={job.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-2">Print Quantity</label>
            <input 
              type="number" 
              className="text-2xl font-black w-full bg-slate-50 p-6 rounded-3xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all"
              value={job.qty}
              onChange={(e) => handleChange('qty', parseInt(e.target.value) || 1)}
            />
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC MATERIALS SECTION */}
      <div className="bg-white rounded-[2rem] border p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Weight size={14}/> Material Consumption
            </label>
            <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full">
              {totalWeight}g TOTAL
            </span>
          </div>
          <button 
            onClick={addMaterialRow}
            className="flex items-center gap-1 text-[10px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition shadow-sm"
          >
            <Plus size={14}/> ADD FILAMENT
          </button>
        </div>

        <div className="space-y-4">
          {job.materials?.map((mat, index) => (
            <div key={index} className="flex gap-3 items-end p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
              <div className="flex-grow">
                <span className="text-[9px] font-black text-slate-400 ml-2 uppercase">Filament Type</span>
                <select 
                  className="w-full p-3 bg-white rounded-xl border font-bold uppercase text-xs outline-none focus:border-blue-500 shadow-sm"
                  value={mat.filamentId}
                  onChange={(e) => updateMaterialRow(index, 'filamentId', parseInt(e.target.value))}
                >
                  {library.filaments.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div className="w-32">
                <span className="text-[9px] font-black text-slate-400 ml-2 uppercase">Grams Used</span>
                <input 
                  type="number" 
                  className="w-full p-3 bg-white rounded-xl border font-bold text-center shadow-sm"
                  value={mat.grams}
                  onChange={(e) => updateMaterialRow(index, 'grams', parseFloat(e.target.value) || 0)}
                />
              </div>
              {job.materials.length > 1 && (
                <button 
                  onClick={() => removeMaterialRow(index)}
                  className="p-3 text-slate-300 hover:text-red-500 transition mb-0.5"
                >
                  <Trash2 size={20}/>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. HARDWARE & TIME STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[2rem] border p-8 shadow-sm space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><Settings2 size={14}/> Machine</label>
          <select 
            className="w-full p-4 bg-slate-50 rounded-2xl border font-bold uppercase text-sm outline-none focus:border-blue-500"
            value={job.selectedPrinterId}
            onChange={(e) => handleChange('selectedPrinterId', parseInt(e.target.value))}
          >
            {library.printers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-[2rem] border p-8 shadow-sm space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><Clock size={14}/> Production Time</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[9px] font-black text-slate-400 ml-1 uppercase">Print Hours</span>
              <input type="number" className="w-full p-3 bg-slate-50 rounded-xl border font-bold" value={job.hours} onChange={(e) => handleChange('hours', parseFloat(e.target.value) || 0)}/>
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-400 ml-1 uppercase">Labor (Mins)</span>
              <input type="number" className="w-full p-3 bg-slate-50 rounded-xl border font-bold" value={job.laborHours * 60} onChange={(e) => handleChange('laborHours', (parseFloat(e.target.value) / 60) || 0)}/>
            </div>
          </div>
        </div>
      </div>

      {/* 4. PRICING STRATEGY OVERRIDES (Now with Direct Inputs) */}
      <div className="bg-white rounded-[2rem] border p-8 shadow-sm space-y-8">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Percent size={14}/> Strategy Adjustments
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase text-slate-500 ml-2">Material Markup (x)</span> 
            <div className="relative">
              <input 
                type="number" 
                step="0.1"
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-black text-blue-600 transition-all"
                value={job.materialMarkup} 
                onChange={(e) => handleChange('materialMarkup', parseFloat(e.target.value) || 0)}
              />
              <span className="absolute right-4 top-4 text-[10px] font-bold text-slate-300 uppercase">Multiplier</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase text-slate-500 ml-2">Desired Margin (%)</span> 
            <div className="relative">
              <input 
                type="number" 
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-black text-blue-600 transition-all"
                value={job.desiredMargin} 
                onChange={(e) => handleChange('desiredMargin', parseInt(e.target.value) || 0)}
              />
              <span className="absolute right-4 top-4 text-[10px] font-bold text-slate-300 uppercase">%</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase text-slate-500 ml-2">Print Hour Multiplier</span> 
            <div className="relative">
              <input 
                type="number" 
                placeholder={library.shopHourlyRate}
                className={`w-full p-4 rounded-2xl border-2 outline-none font-black transition-all ${
                  job.hourlyRateOverride > 0 ? 'bg-white border-blue-500 text-blue-600' : 'bg-slate-50 border-transparent text-slate-400'
                }`}
                value={job.hourlyRateOverride || ''} 
                onChange={(e) => handleChange('hourlyRateOverride', parseFloat(e.target.value) || 0)}
              />
              {job.hourlyRateOverride > 0 && (
                <button 
                  onClick={() => handleChange('hourlyRateOverride', 0)}
                  className="absolute right-4 top-4 text-[8px] font-black text-red-500 uppercase bg-red-50 px-2 py-1 rounded-md border border-red-100"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorTab;