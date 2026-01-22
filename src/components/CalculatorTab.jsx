import React from 'react';

const CalculatorTab = ({ job, setJob, library }) => {
  const update = (field, val) => setJob({ ...job, [field]: val });
  
  const updateMat = (index, field, val) => {
    const newMats = [...job.materials];
    newMats[index][field] = val;
    setJob({ ...job, materials: newMats });
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: CORE PROJECT DETAILS */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        <div className="col-span-2">
          <label>Project Name</label>
          <input type="text" className="w-full shadow-sm" value={job.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Prototype_V1" />
        </div>
        
        <div>
          <label>Print Time (Hours)</label>
          <input type="number" className="w-full shadow-sm" value={job.hours} onChange={(e) => update('hours', parseFloat(e.target.value) || 0)} />
        </div>
        
        <div>
          <label>Quantity to Produce</label>
          <input type="number" className="w-full shadow-sm" value={job.qty} onChange={(e) => update('qty', parseInt(e.target.value) || 1)} />
        </div>

        <div>
          <label>Select Filament</label>
          <select className="w-full shadow-sm" value={job.materials[0].filamentId} onChange={(e) => updateMat(0, 'filamentId', e.target.value)}>
            {library.filaments.map(f => (
              <option key={f.id} value={f.id}>{f.name} ({f.colorName})</option>
            ))}
          </select>
        </div>

        <div>
          <label>Usage (Grams)</label>
          <input type="number" className="w-full shadow-sm" value={job.materials[0].grams} onChange={(e) => updateMat(0, 'grams', parseFloat(e.target.value) || 0)} />
        </div>
      </div>

      {/* SECTION 2: TECHNICAL SPECS & NOTES */}
      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
        <div className="mb-4 px-1">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Technical Specs & Notes</h4>
        </div>
        
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div><label>Infill %</label>
            <select value={job.infill} onChange={(e) => update('infill', e.target.value)} className="w-full border-none shadow-sm">
              <option>10%</option><option>15%</option><option>20%</option><option>40%</option><option>100%</option>
            </select>
          </div>
          <div><label>Wall Count</label>
            <select value={job.walls} onChange={(e) => update('walls', e.target.value)} className="w-full border-none shadow-sm">
              <option>2</option><option>3</option><option>4</option><option>6</option>
            </select>
          </div>
          <div><label>Layer Height</label>
            <select value={job.layerHeight} onChange={(e) => update('layerHeight', e.target.value)} className="w-full border-none shadow-sm">
              <option>0.12mm</option><option>0.16mm</option><option>0.2mm</option><option>0.28mm</option>
            </select>
          </div>
        </div>

        <div>
          <label>Production Notes</label>
          <textarea 
            className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            rows="3"
            placeholder="Support settings, nozzle temp, or client notes..."
            value={job.notes || ""}
            onChange={(e) => update('notes', e.target.value)}
          />
        </div>
      </div>

      {/* SECTION 3: HARDWARE & EXTRAS */}
      <div className="grid grid-cols-3 gap-8">
        <div>
          <label>Labor (Minutes)</label>
          <input type="number" className="w-full shadow-sm" value={job.laborMinutes} onChange={(e) => update('laborMinutes', parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label>Printer</label>
          <select className="w-full shadow-sm" value={job.selectedPrinterId} onChange={(e) => update('selectedPrinterId', parseInt(e.target.value))}>
            {library.printers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label>Extra ($)</label>
          <input type="number" className="w-full shadow-sm" value={job.extraCosts} onChange={(e) => update('extraCosts', parseFloat(e.target.value) || 0)} />
        </div>
      </div>
    </div>
  );
};

export default CalculatorTab;