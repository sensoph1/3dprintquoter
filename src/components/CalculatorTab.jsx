import React from 'react';
import ComboBox from './ComboBox';
import Tooltip from './Tooltip';

const CalculatorTab = ({ job, setJob, library, stats, showAdvanced, setShowAdvanced }) => {
  const update = (field, val) => setJob({ ...job, [field]: val });
  
  const updateMat = (index, field, val) => {
    const newMats = [...job.materials];
    newMats[index][field] = val;
    setJob({ ...job, materials: newMats });
  };

  return (
    <div className="space-y-8">
      {/* Advanced Mode Toggle */}
      <div className="flex items-center space-x-2">
        <input 
          type="checkbox" 
          id="advancedModeToggle" 
          checked={showAdvanced} 
          onChange={(e) => setShowAdvanced(e.target.checked)}
          className="toggle toggle-primary" // Assuming you have some CSS for 'toggle toggle-primary'
        />
        <label htmlFor="advancedModeToggle" className="text-sm font-medium text-gray-700">Advanced Mode</label>
      </div>
      {/* SECTION 1: CORE PROJECT DETAILS */}
      <div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          <div className="col-span-2">
            <Tooltip text="A descriptive name for your project or print job.">
              <label>Project Name</label>
            </Tooltip>
            <input type="text" className="w-full shadow-sm" value={job.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Prototype_V1" />
          </div>
          
          <div>
            <Tooltip text="The estimated time your 3D printer will be actively printing this job, in hours.">
              <label>Print Time (Hours)</label>
            </Tooltip>
            <input type="number" className="w-full shadow-sm" value={job.hours} onChange={(e) => update('hours', parseFloat(e.target.value) || 0)} />
          </div>
          
          <div>
            <Tooltip text="The total number of identical items you plan to produce in this print job.">
              <label>Quantity to Produce</label>
            </Tooltip>
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

        <hr className="my-8 border-slate-100" />

        {showAdvanced && (
          <div className="p-4 sm:p-6 bg-blue-50 rounded-[2rem] border border-blue-100 shadow-inner space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Advanced Cost Breakdown</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 text-blue-800 font-bold">
              <Tooltip text="Calculated as: Filament Used (g) * Filament Cost/g">
                <div className="p-2 bg-white/50 rounded-lg">
                  <p className="text-[9px] uppercase font-bold text-blue-500">Raw Material Cost</p>
                  <p className="text-lg sm:text-xl">${stats.matCost.toFixed(2)}</p>
                </div>
              </Tooltip>
              <Tooltip text="Calculated as: (Print Time in Hours * (Printer Wattage / 1000)) * kWh Rate">
                <div className="p-2 bg-white/50 rounded-lg">
                  <p className="text-[9px] uppercase font-bold text-blue-500">Total Energy Cost</p>
                  <p className="text-lg sm:text-xl">${stats.energy.toFixed(2)}</p>
                </div>
              </Tooltip>
              <Tooltip text="Calculated as: (Printer Cost / Printer Lifespan in Hours) * Print Time in Hours">
                <div className="p-2 bg-white/50 rounded-lg">
                  <p className="text-[9px] uppercase font-bold text-blue-500">Total Depreciation Cost</p>
                  <p className="text-lg sm:text-xl">${stats.depreciationCost.toFixed(2)}</p>
                </div>
              </Tooltip>
              <Tooltip text="Calculated as: Printer Cost / Printer Lifespan in Hours">
                <div className="p-2 bg-white/50 rounded-lg">
                  <p className="text-[9px] uppercase font-bold text-blue-500">Hourly Amortization</p>
                  <p className="text-lg sm:text-xl">${stats.hourlyAmortization.toFixed(2)}</p>
                </div>
              </Tooltip>
              <Tooltip text="Calculated as: Material Cost + Energy Cost + Labor Cost + Extra Costs + Depreciation Cost">
                <div className="p-2 bg-white/50 rounded-lg">
                  <p className="text-[9px] uppercase font-bold text-blue-500">Total Base Cost</p>
                  <p className="text-lg sm:text-xl">${stats.baseCost.toFixed(2)}</p>
                </div>
              </Tooltip>
              <Tooltip text="Calculated as: Total Base Cost / Quantity">
                <div className="p-2 bg-white/50 rounded-lg">
                  <p className="text-[9px] uppercase font-bold text-blue-500">Cost Per Item</p>
                  <p className="text-lg sm:text-xl">${stats.costPerItem.toFixed(2)}</p>
                </div>
              </Tooltip>
              <Tooltip text="Calculated as: (Material Cost * Material Cost Multiplier) / Quantity">
                <div className="p-2 bg-white/50 rounded-lg">
                  <p className="text-[9px] uppercase font-bold text-blue-500">Material Cost Per Item</p>
                  <p className="text-lg sm:text-xl">${stats.materialCostPerItemAdvanced.toFixed(2)}</p>
                </div>
              </Tooltip>
            </div>
          </div>
        )}

      {/* SECTION 2: TECHNICAL SPECS & NOTES */}
      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
        <div className="mb-4 px-1">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Technical Specs & Notes</h4>
        </div>
        
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div>
            <Tooltip text="The density of the internal structure of your 3D print. Higher infill percentages use more material but result in stronger parts.">
              <label>Infill %</label>
            </Tooltip>
            <select value={job.infill} onChange={(e) => update('infill', e.target.value)} className="w-full border-none shadow-sm">
              <option>10%</option><option>15%</option><option>20%</option><option>40%</option><option>100%</option>
            </select>
          </div>
          <div>
            <Tooltip text="The number of perimeters or outer layers of your 3D print. More walls generally lead to stronger prints.">
              <label>Wall Count</label>
            </Tooltip>
            <select value={job.walls} onChange={(e) => update('walls', e.target.value)} className="w-full border-none shadow-sm">
              <option>2</option><option>3</option><option>4</option><option>6</option>
            </select>
          </div>
          <div>
            <Tooltip text="The height of each individual layer your 3D printer lays down. Smaller layer heights result in finer detail but longer print times.">
              <label>Layer Height</label>
            </Tooltip>
            <select value={job.layerHeight} onChange={(e) => update('layerHeight', e.target.value)} className="w-full border-none shadow-sm">
              <option>0.12mm</option><option>0.16mm</option><option>0.2mm</option><option>0.28mm</option>
            </select>
          </div>
        </div>

        <div>
          <Tooltip text="Any specific instructions or details for this production job, such as unique client requirements, support settings, or special print temperatures.">
            <label>Production Notes</label>
          </Tooltip>
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
          <Tooltip text="The estimated time, in minutes, spent on pre- or post-processing for this specific print job (e.g., model preparation, support removal, assembly).">
            <label>Labor (Minutes)</label>
          </Tooltip>
          <input type="number" className="w-full shadow-sm" value={job.laborMinutes} onChange={(e) => update('laborMinutes', parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <Tooltip text="The 3D printer that will be used for this print job. Select from your configured hardware list.">
            <label>Printer</label>
          </Tooltip>
          <select className="w-full shadow-sm" value={job.selectedPrinterId} onChange={(e) => update('selectedPrinterId', parseInt(e.target.value))}>
            {library.printers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <Tooltip text="Any additional costs associated with this job not covered by material, energy, labor, or machine time (e.g., magnets, special components, packaging).">
            <label>Extra ($)</label>
          </Tooltip>
          <input type="number" className="w-full shadow-sm" value={job.extraCosts} onChange={(e) => update('extraCosts', parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <Tooltip text="Override the global shop hourly rate from settings for this specific job. This rate is factored into the 'Hourly Rate' pricing strategy.">
            <label>Hourly Rate Override ($)</label>
          </Tooltip>
          <input type="number" className="w-full shadow-sm" value={job.overrideShopHourlyRate} onChange={(e) => update('overrideShopHourlyRate', parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <Tooltip text="A multiplier applied to the material cost to determine the final price using the 'Material Cost' pricing strategy. Useful for covering material waste, handling, or desired markup.">
            <label>Material Cost Multiplier</label>
          </Tooltip>
          <input type="number" className="w-full shadow-sm" value={job.materialCostMultiplier} onChange={(e) => update('materialCostMultiplier', parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <Tooltip text="Your desired profit margin as a percentage for this specific job. This is used in the 'Profit Margin' pricing strategy.">
            <label>Profit Margin (%)</label>
          </Tooltip>
          <input type="number" className="w-full shadow-sm" value={job.profitMargin} onChange={(e) => update('profitMargin', parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <Tooltip text="Override the global price rounding setting for this specific job. Prices will be rounded up to the nearest value entered here (e.g., 1 for nearest dollar, 5 for nearest five dollars).">
            <label>Rounding Override ($)</label>
          </Tooltip>
          <input type="number" className="w-full shadow-sm" value={job.rounding} onChange={(e) => update('rounding', parseFloat(e.target.value) || 0)} />
        </div>
      </div>
    </div>
  );
};

export default CalculatorTab;