import React from 'react';
import ComboBox from './ComboBox';

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
      <div>
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
        </div>

        <hr className="my-8 border-slate-100" />

        {job.materials.map((mat, index) => (
          <div key={index} className="grid grid-cols-2 gap-x-8 gap-y-6 mb-4">
            <div>
              <label>Select Filament</label>
              <ComboBox
                items={library.filaments}
                value={mat.filamentId}
                onChange={(value) => updateMat(index, 'filamentId', value)}
                placeholder="Search for a filament..."
              />
            </div>
            <div className="flex items-end">
              <div className="flex-grow">
                <label>Usage (Grams)</label>
                <input type="number" className="w-full shadow-sm" value={mat.grams} onChange={(e) => updateMat(index, 'grams', parseFloat(e.target.value) || 0)} />
              </div>
              {job.materials.length > 1 && (
                <button
                  onClick={() => {
                    const newMats = [...job.materials];
                    newMats.splice(index, 1);
                    setJob({ ...job, materials: newMats });
                  }}
                  className="ml-2 mb-1 px-3 py-2 text-red-500 hover:bg-red-100 rounded-lg"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
        <div>
          <button
            onClick={() => {
              const newMats = [...job.materials, { filamentId: library.filaments[0].id, grams: 0 }];
              setJob({ ...job, materials: newMats });
            }}
            className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-all"
          >
            + Add another filament
          </button>
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
        <div>
          <label>Hourly Rate Override ($)</label>
          <input type="number" className="w-full shadow-sm" value={job.overrideShopHourlyRate} onChange={(e) => update('overrideShopHourlyRate', parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label>Material Cost Multiplier</label>
          <input type="number" className="w-full shadow-sm" value={job.materialCostMultiplier} onChange={(e) => update('materialCostMultiplier', parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label>Profit Margin (%)</label>
          <input type="number" className="w-full shadow-sm" value={job.profitMargin} onChange={(e) => update('profitMargin', parseFloat(e.target.value) || 0)} />
        </div>
      </div>
    </div>
  );
};

export default CalculatorTab;