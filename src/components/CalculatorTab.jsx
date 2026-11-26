import React, { useState } from 'react';
import { Calculator, FileText } from 'lucide-react';
import ComboBox from './ComboBox';
import Tooltip from './Tooltip';

const CalculatorTab = ({ job, setJob, library, stats, requests = [] }) => {
  const [costView, setCostView] = useState('total');
  const update = (field, val) => setJob({ ...job, [field]: val });
  
  const updateMat = (index, field, val) => {
    const newMats = [...job.materials];
    newMats[index][field] = val;
    setJob({ ...job, materials: newMats });
  };

  const updateExtra = (index, field, val) => {
    const newExtras = [...(job.extras || [])];
    newExtras[index] = { ...newExtras[index], [field]: val };
    setJob({ ...job, extras: newExtras });
  };

  const inventoryItems = library.inventory || [];
  const jobExtras = job.extras || [];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-3">
            <Calculator className="text-blue-600" size={28} /> Job Calculator
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Configure print job details & pricing</p>
        </div>
      </div>

      {/* SECTION 1: CORE PROJECT DETAILS */}
      <div>
        {/* Project Name - full width */}
        <div className="mb-6">
          <Tooltip text="A descriptive name for your project or print job.">
            <label>Project Name</label>
          </Tooltip>
          <input type="text" className="w-full shadow-sm" value={job.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Prototype_V1" />
        </div>

        {/* Category, Print Time, Quantity - same line */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
          <div>
            <Tooltip text="A category to organize your projects.">
              <label>Category</label>
            </Tooltip>
            <select className="w-full shadow-sm" value={job.category || ''} onChange={(e) => update('category', e.target.value)}>
              <option value="">Select a category...</option>
              {(library.categories || []).map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <Tooltip text="The estimated time your 3D printer will be actively printing this job, in hours.">
              <label>Print Time (Hours)</label>
            </Tooltip>
            <input type="number" className="w-full shadow-sm" value={job.hours} onChange={(e) => update('hours', parseFloat(e.target.value) || 0)} />
          </div>

          <div>
            <Tooltip text="The total number of identical items you plan to produce in this print job.">
              <label>Quantity</label>
            </Tooltip>
            <input type="number" className="w-full shadow-sm" value={job.qty} onChange={(e) => update('qty', parseInt(e.target.value) || 1)} />
          </div>
        </div>

        <hr className="my-8 border-slate-100" />

        {job.materials.map((mat, index) => (
          <div key={index} className="grid grid-cols-2 gap-x-6 gap-y-4 mb-4">
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

      {/* SECTION 2: HARDWARE & EXTRAS */}
      <div className="space-y-6">
        {/* Printer & Labor */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Tooltip text="The 3D printer that will be used for this print job. Select from your configured hardware list.">
              <label>Printer</label>
            </Tooltip>
            <select className="w-full shadow-sm" value={job.selectedPrinterId} onChange={(e) => update('selectedPrinterId', parseInt(e.target.value))}>
              {library.printers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <Tooltip text="The estimated time, in minutes, spent on pre- or post-processing for this specific print job (e.g., model preparation, support removal, assembly).">
              <label>Labor (Minutes)</label>
            </Tooltip>
            <input type="number" className="w-full shadow-sm" value={job.laborMinutes} onChange={(e) => update('laborMinutes', parseFloat(e.target.value) || 0)} />
          </div>
        </div>

        {/* Extra Items from Cost Management Inventory */}
        <div>
          {jobExtras.map((extra, index) => {
            const selectedItem = inventoryItems.find(i => String(i.id) === String(extra.itemId));
            const lineCost = selectedItem ? (parseFloat(extra.qty) || 0) * (parseFloat(selectedItem.unitCost) || 0) : 0;
            return (
              <div key={index} className="grid grid-cols-2 gap-x-6 gap-y-4 mb-4">
                <div>
                  <Tooltip text="Select an item from your Cost Management (Consumables & Shipping) inventory.">
                    <label>Select Extra Item</label>
                  </Tooltip>
                  <ComboBox
                    items={inventoryItems}
                    value={extra.itemId}
                    onChange={(value) => updateExtra(index, 'itemId', value)}
                    placeholder="Search for an inventory item..."
                    formatLabel={(item) => `${item.name} ($${(parseFloat(item.unitCost) || 0).toFixed(2)})`}
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex-grow">
                    <Tooltip text="Total quantity of this inventory item used for this job.">
                      <label>
                        Quantity {selectedItem ? <span className="text-blue-600">(${lineCost.toFixed(2)})</span> : ''}
                      </label>
                    </Tooltip>
                    <input
                      type="number"
                      min="0"
                      className="w-full shadow-sm"
                      value={extra.qty}
                      onChange={(e) => updateExtra(index, 'qty', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <button
                    onClick={() => {
                      const newExtras = [...jobExtras];
                      newExtras.splice(index, 1);
                      setJob({ ...job, extras: newExtras });
                    }}
                    className="ml-2 mb-1 px-3 py-2 text-red-500 hover:bg-red-100 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
          <div>
            <button
              onClick={() => {
                if (inventoryItems.length === 0) return;
                const newExtras = [...jobExtras, { itemId: inventoryItems[0].id, qty: 1 }];
                setJob({ ...job, extras: newExtras });
              }}
              disabled={inventoryItems.length === 0}
              className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {inventoryItems.length === 0
                ? 'No items in Cost Management inventory'
                : jobExtras.length > 0
                  ? '+ Add another extra item'
                  : '+ Add extra item from inventory'}
            </button>
          </div>
          {job.extraCosts > 0 && (
            <div className="mt-4">
              <Tooltip text="Manual extra cost carried over from an earlier estimate.">
                <label>Legacy Extra ($)</label>
              </Tooltip>
              <input type="number" className="w-full shadow-sm" value={job.extraCosts} onChange={(e) => update('extraCosts', parseFloat(e.target.value) || 0)} />
            </div>
          )}
        </div>

        {/* Hourly Rate, Material Multiplier, Profit Margin, Rounding - same line */}
        <div className="grid grid-cols-4 gap-6">
          <div>
            <Tooltip text="Override the global print hour multiplier from settings for this specific job. Used in the time-based pricing strategy.">
              <label>Print Hour<br />Multiplier ($)</label>
            </Tooltip>
            <input type="number" className="w-full shadow-sm" value={job.overrideShopHourlyRate} onChange={(e) => update('overrideShopHourlyRate', parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <Tooltip text="A multiplier applied to the material cost to determine the final price using the 'Material Cost' pricing strategy. Useful for covering material waste, handling, or desired markup.">
              <label>Material<br />Multiplier</label>
            </Tooltip>
            <input type="number" className="w-full shadow-sm" value={job.materialCostMultiplier} onChange={(e) => update('materialCostMultiplier', parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <Tooltip text="Your desired profit margin as a percentage for this specific job. This is used in the 'Profit Margin' pricing strategy.">
              <label>Profit<br />Margin (%)</label>
            </Tooltip>
            <input type="number" className="w-full shadow-sm" value={job.profitMargin} onChange={(e) => update('profitMargin', parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <Tooltip text="Override the global price rounding setting for this specific job. Prices will be rounded up to the nearest value entered here (e.g., 1 for nearest dollar, 5 for nearest five dollars).">
              <label>Rounding<br />Up ($)</label>
            </Tooltip>
            <input type="number" className="w-full shadow-sm" value={job.rounding} onChange={(e) => update('rounding', parseFloat(e.target.value) || 0)} />
          </div>
        </div>
      </div>

      {/* SECTION 3: TECHNICAL SPECS & NOTES */}
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

        {requests.length > 0 && (
          <div className="mb-6">
            <Tooltip text="Link this job to a customer quote request. Status will be updated to 'quoted' when saved.">
              <label className="flex items-center gap-2">
                <FileText size={14} className="text-blue-500" />
                Link to Request
              </label>
            </Tooltip>
            <select
              className="w-full border-none shadow-sm"
              value={job.requestId || ''}
              onChange={(e) => update('requestId', e.target.value || null)}
            >
              <option value="">No linked request</option>
              {requests.filter(r => r.status === 'new' || r.id === job.requestId).map(request => (
                <option key={request.id} value={request.id}>
                  {request.customer_name} - {request.description.substring(0, 50)}{request.description.length > 50 ? '...' : ''} ({request.status})
                </option>
              ))}
            </select>
          </div>
        )}

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

      {/* COST BREAKDOWN */}
      {(() => {
        const qty = Math.max(1, parseFloat(job.qty) || 1);
        const isPerItem = costView === 'perItem';
        const divisor = isPerItem ? qty : 1;
        return (
          <div className="p-6 sm:p-8 bg-blue-50 rounded-[2rem] border border-blue-100 shadow-inner">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Cost Breakdown</h4>
              <div className="inline-flex bg-white/80 p-1 rounded-full border border-blue-100 shadow-sm">
                <button
                  type="button"
                  onClick={() => setCostView('total')}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                    !isPerItem ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-600 hover:bg-blue-100/60'
                  }`}
                >
                  Total Cost
                </button>
                <button
                  type="button"
                  onClick={() => setCostView('perItem')}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                    isPerItem ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-600 hover:bg-blue-100/60'
                  }`}
                >
                  Cost Per Item
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <Tooltip text={isPerItem ? "Calculated as: (Filament Used (g) * Filament Cost/g) / Quantity" : "Calculated as: Filament Used (g) * Filament Cost/g"}>
                <div className="flex justify-between items-center bg-white/60 rounded-xl py-4 px-6">
                  <span className="text-[11px] uppercase font-bold text-blue-600 tracking-wide">Filament</span>
                  <span className="text-xl font-black text-blue-800">${(stats.matCost / divisor).toFixed(2)}</span>
                </div>
              </Tooltip>
              <Tooltip text={isPerItem ? "Calculated as: ((Print Time in Hours * (Printer Wattage / 1000)) * kWh Rate) / Quantity" : "Calculated as: (Print Time in Hours * (Printer Wattage / 1000)) * kWh Rate"}>
                <div className="flex justify-between items-center bg-white/60 rounded-xl py-4 px-6">
                  <span className="text-[11px] uppercase font-bold text-blue-600 tracking-wide">Energy Cost</span>
                  <span className="text-xl font-black text-blue-800">${(stats.energy / divisor).toFixed(2)}</span>
                </div>
              </Tooltip>
              <Tooltip text={isPerItem ? "Calculated as: ((Printer Cost / Printer Lifespan in Hours) * Print Time in Hours) / Quantity" : "Calculated as: (Printer Cost / Printer Lifespan in Hours) * Print Time in Hours"}>
                <div className="flex justify-between items-center bg-white/60 rounded-xl py-4 px-6">
                  <span className="text-[11px] uppercase font-bold text-blue-600 tracking-wide">Depreciation</span>
                  <span className="text-xl font-black text-blue-800">${(stats.depreciationCost / divisor).toFixed(2)}</span>
                </div>
              </Tooltip>
              <Tooltip text={isPerItem ? "Calculated as: Sum of (Extra Item Quantity * Unit Cost) / Quantity" : "Calculated as: Sum of (Extra Item Quantity * Unit Cost) from Cost Management inventory"}>
                <div className="flex justify-between items-center bg-white/60 rounded-xl py-4 px-6">
                  <span className="text-[11px] uppercase font-bold text-blue-600 tracking-wide">Extra Costs</span>
                  <span className="text-xl font-black text-blue-800">${((stats.extraCosts || 0) / divisor).toFixed(2)}</span>
                </div>
              </Tooltip>
              {isPerItem ? (
                <>
                  <Tooltip text="Calculated as: Total Base Cost / Quantity">
                    <div className="flex justify-between items-center bg-white/60 rounded-xl py-4 px-6">
                      <span className="text-[11px] uppercase font-bold text-blue-600 tracking-wide">Cost Per Item</span>
                      <span className="text-xl font-black text-blue-800">${stats.costPerItem.toFixed(2)}</span>
                    </div>
                  </Tooltip>
                  <Tooltip text="Calculated as: Filament + Energy Cost + Labor Cost + Extra Costs + Depreciation Cost">
                    <div className="flex justify-between items-center bg-white/60 rounded-xl py-4 px-6">
                      <span className="text-[11px] uppercase font-bold text-blue-600 tracking-wide">Total Item Cost</span>
                      <span className="text-xl font-black text-blue-800">${stats.baseCost.toFixed(2)}</span>
                    </div>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip text="Calculated as: Material Cost + Energy Cost + Labor Cost + Extra Costs + Depreciation Cost">
                    <div className="flex justify-between items-center bg-white/60 rounded-xl py-4 px-6">
                      <span className="text-[11px] uppercase font-bold text-blue-600 tracking-wide">Base Cost</span>
                      <span className="text-xl font-black text-blue-800">${stats.baseCost.toFixed(2)}</span>
                    </div>
                  </Tooltip>
                  <Tooltip text="Calculated as: Total Base Cost / Quantity">
                    <div className="flex justify-between items-center bg-white/60 rounded-xl py-4 px-6">
                      <span className="text-[11px] uppercase font-bold text-blue-600 tracking-wide">Cost Per Item</span>
                      <span className="text-xl font-black text-blue-800">${stats.costPerItem.toFixed(2)}</span>
                    </div>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default CalculatorTab;