import React, { useState, useEffect } from 'react';
import { Trash2, Save, Package, Plus, Copy, Globe, Hash, Clock, Percent, Calculator, Download, Check, TrendingUp, Database, FlaskConical } from 'lucide-react';

const PrintingApp = () => {
  // --- 1. STATE ---
  const [status, setStatus] = useState('');
  const [history, setHistory] = useState([]);
  const [showFilamentManager, setShowFilamentManager] = useState(false);
  const [activeId, setActiveId] = useState(null); 
  const [selectedStrategy, setSelectedStrategy] = useState('markup');

  const [printers] = useState([{ id: 1, name: 'Bambu P1S', watts: 1300, printerPrice: 650, lifespan: 12000, active: true }]);
  
  // Project State
  const [job, setJob] = useState({
    name: '', qty: 1, hours: 0, modelGrams: 0, wasteGrams: 0, extraCosts: 0, laborHours: 0, notes: '',
    desiredMargin: 50, hourlyRateOverride: 10.00, materialMarkup: 2.0, quoteNo: '',
    selectedFilamentId: null
  });

  // Global Settings (Now just the Filament Library)
  const [library, setLibrary] = useState({
    filaments: [
      { id: 1, name: 'Standard PLA', price: 20, grams: 1000, desc: 'Generic PLA' }
    ],
    nextQuoteNo: 1001,
    kwhRate: 0.14,
    laborRate: 15
  });

  // --- 2. PERSISTENCE ---
  useEffect(() => {
    const savedLibrary = localStorage.getItem('pro3d_library');
    if (savedLibrary) setLibrary(JSON.parse(savedLibrary));
    const savedHistory = localStorage.getItem('pro3d_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const saveLibrary = (newLib) => {
    setLibrary(newLib);
    localStorage.setItem('pro3d_library', JSON.stringify(newLib));
  };

  // --- 3. CALCULATION ENGINE ---
  const activePrinter = printers[0];
  const activeFilament = library.filaments.find(f => f.id === job.selectedFilamentId) || library.filaments[0];
  
  const costPerGram = activeFilament.price / activeFilament.grams;
  const totalGrams = Number(job.modelGrams) + Number(job.wasteGrams);
  
  const baseMaterialCost = costPerGram * totalGrams;
  const baseOpCost = ((activePrinter.printerPrice / activePrinter.lifespan) + ((activePrinter.watts / 1000) * library.kwhRate)) * job.hours;
  const baseLaborCost = library.laborRate * job.laborHours;
  
  const totalBatchInternalCost = baseMaterialCost + baseOpCost + baseLaborCost + Number(job.extraCosts);
  const unitInternalCost = totalBatchInternalCost / (job.qty || 1);
  
  // Strategies
  // 1. Markup Strategy (Uses the live material markup and hourly override)
  const priceMarkup = ((baseMaterialCost * job.materialMarkup) + (job.hourlyRateOverride * job.hours) + (baseLaborCost * job.materialMarkup) + (Number(job.extraCosts) * job.materialMarkup)) / (job.qty || 1);
  
  // 2. Margin Strategy
  const priceMargin = (totalBatchInternalCost / (1 - (job.desiredMargin / 100))) / (job.qty || 1);
  
  // 3. Hourly Rate Strategy (Flat rate + Materials marked up)
  const priceHourly = ((job.hourlyRateOverride * job.hours) + (baseMaterialCost * job.materialMarkup) + Number(job.extraCosts)) / (job.qty || 1);

  const getFinalPrice = () => {
    if (selectedStrategy === 'markup') return priceMarkup;
    if (selectedStrategy === 'margin') return priceMargin;
    return priceHourly;
  };

  // --- 4. HANDLERS ---
  const addFilament = () => {
    const newFil = { id: Date.now(), name: 'New Filament', price: 25, grams: 1000, desc: '' };
    saveLibrary({ ...library, filaments: [...library.filaments, newFil] });
  };

  const updateFilament = (id, key, val) => {
    const updated = library.filaments.map(f => f.id === id ? { ...f, [key]: val } : f);
    saveLibrary({ ...library, filaments: updated });
  };

  const handleSaveOrUpdate = (mode) => {
    const finalPrice = getFinalPrice();
    const entryData = {
      date: new Date().toLocaleDateString(),
      name: job.name || "Untitled Item",
      unitPrice: finalPrice.toFixed(2),
      unitCost: unitInternalCost.toFixed(2),
      qty: job.qty,
      hours: job.hours,
      grams: totalGrams,
      notes: job.notes,
      details: { ...job, strategy: selectedStrategy, filamentName: activeFilament.name }
    };

    let updatedHistory = [...history];
    if (mode === 'update' && activeId) {
      const index = updatedHistory.findIndex(item => item.id === activeId);
      if (index !== -1) {
        updatedHistory[index] = { ...entryData, id: activeId, quoteNo: job.quoteNo };
        setStatus('Updated');
      }
    } else {
      const newQuoteNo = `Q-${library.nextQuoteNo}`;
      const newEntry = { ...entryData, id: Date.now(), quoteNo: newQuoteNo };
      updatedHistory = [newEntry, ...updatedHistory];
      saveLibrary({ ...library, nextQuoteNo: library.nextQuoteNo + 1 });
      setActiveId(newEntry.id);
      setJob(prev => ({ ...prev, quoteNo: newQuoteNo }));
      setStatus(`Saved ${newQuoteNo}`);
    }
    setHistory(updatedHistory);
    localStorage.setItem('pro3d_history', JSON.stringify(updatedHistory));
    setTimeout(() => setStatus(''), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        <div className="lg:col-span-3 space-y-6">
          {/* FILAMENT LIBRARY PANEL */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black flex items-center gap-2 uppercase tracking-tight"><Database className="text-indigo-500" size={18}/> Filament Library</h2>
              <button onClick={() => setShowFilamentManager(!showFilamentManager)} className="text-[10px] font-black px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full">
                {showFilamentManager ? 'CLOSE MANAGER' : 'MANAGE STOCK'}
              </button>
            </div>

            {showFilamentManager && (
              <div className="grid grid-cols-1 gap-3 mb-6 animate-in fade-in slide-in-from-top-2">
                {library.filaments.map(f => (
                  <div key={f.id} className="grid grid-cols-12 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 items-center">
                    <div className="col-span-4"><input className="w-full bg-transparent font-bold text-sm outline-none" value={f.name} onChange={(e)=>updateFilament(f.id, 'name', e.target.value)} placeholder="Filament Name"/></div>
                    <div className="col-span-2 flex items-center gap-1 text-xs font-mono">$<input type="number" className="w-full bg-transparent border-b" value={f.price} onChange={(e)=>updateFilament(f.id, 'price', e.target.value)}/></div>
                    <div className="col-span-2 flex items-center gap-1 text-xs font-mono"><input type="number" className="w-full bg-transparent border-b" value={f.grams} onChange={(e)=>updateFilament(f.id, 'grams', e.target.value)}/>g</div>
                    <div className="col-span-3"><input className="w-full bg-transparent text-[10px] italic outline-none" value={f.desc} onChange={(e)=>updateFilament(f.id, 'desc', e.target.value)} placeholder="Notes (brand, temp...)"/></div>
                    <div className="col-span-1 text-right">
                      <button onClick={() => saveLibrary({...library, filaments: library.filaments.filter(x=>x.id !== f.id)})} className="text-red-300 hover:text-red-500"><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
                <button onClick={addFilament} className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-bold hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-500 transition">+ ADD NEW FILAMENT TYPE</button>
              </div>
            )}

            <div className="flex gap-4 items-center p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
               <FlaskConical className="text-indigo-500" size={24}/>
               <div className="flex-grow">
                 <label className="text-[10px] font-black text-indigo-400 uppercase block">Active Filament for this Project</label>
                 <select 
                   value={job.selectedFilamentId || ''} 
                   onChange={(e) => setJob({...job, selectedFilamentId: parseInt(e.target.value)})}
                   className="w-full bg-transparent font-bold text-lg outline-none cursor-pointer"
                 >
                   {library.filaments.map(f => <option key={f.id} value={f.id}>{f.name} (${f.price} / {f.grams}g)</option>)}
                 </select>
               </div>
            </div>
          </div>

          {/* PROJECT DETAILS */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold flex items-center gap-2"><Package className="text-blue-600"/> Item Details</h2>
               <button onClick={() => {setActiveId(null); setJob({...job, name:'', qty:1, hours:0, modelGrams:0, wasteGrams:0, extraCosts:0, laborHours:0, notes:'', quoteNo:''})}} className="text-xs font-black px-4 py-2 bg-slate-900 text-white rounded-lg">NEW QUOTE</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex gap-2">
                  {job.quoteNo && <div className="p-3 bg-slate-100 rounded-xl font-mono text-xs font-bold text-slate-500 self-center">{job.quoteNo}</div>}
                  <input type="text" value={job.name} onChange={(e) => setJob({...job, name: e.target.value})} className="flex-grow p-3 border rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Item Name..."/>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[{l:'Qty', k:'qty'}, {l:'Hours', k:'hours'}, {l:'Model (g)', k:'modelGrams'}, {l:'Waste (g)', k:'wasteGrams'}, {l:'Misc $', k:'extraCosts'}, {l:'Labor (h)', k:'laborHours'}].map(i => (
                    <div key={i.k}>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{i.l}</label>
                      <input type="number" value={job[i.k]} onChange={(e) => setJob({...job, [i.k]: parseFloat(e.target.value) || 0})} className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
                    </div>
                  ))}
                </div>
              </div>

              {/* PROJECT MODIFIERS (PREVIOUSLY GLOBAL SETTINGS) */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-5">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1"><TrendingUp size={14}/> Project Modifiers</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Material Markup (x)</label>
                    <input type="number" step="0.1" value={job.materialMarkup} onChange={(e) => setJob({...job, materialMarkup: parseFloat(e.target.value) || 0})} className="w-full p-2 border rounded-lg text-sm font-bold bg-white"/>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Hourly Rate ($/hr)</label>
                    <input type="number" value={job.hourlyRateOverride} onChange={(e) => setJob({...job, hourlyRateOverride: parseFloat(e.target.value) || 0})} className="w-full p-2 border rounded-lg text-sm font-bold bg-white"/>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block uppercase mb-2">Desired Margin (Option 2): {job.desiredMargin}%</label>
                  <input type="range" min="5" max="95" value={job.desiredMargin} onChange={(e) => setJob({...job, desiredMargin: e.target.value})} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR PRICE PICKER */}
        <div className="lg:col-span-1">
          <div className="bg-blue-700 text-white p-6 rounded-3xl shadow-2xl sticky top-8 space-y-4">
            <div className="flex justify-between items-end mb-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest opacity-70">Price Select</h3>
              <div className="text-right">
                <span className="text-[9px] font-bold uppercase opacity-60 block leading-none">Cost/Item</span>
                <span className="text-lg font-black">${unitInternalCost.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Buttons for Options */}
            {[
              { id: 'markup', label: 'Markup Price', val: priceMarkup },
              { id: 'margin', label: `${job.desiredMargin}% Margin`, val: priceMargin },
              { id: 'hourly', label: 'Hourly Price', val: priceHourly }
            ].map(opt => (
              <button key={opt.id} onClick={() => setSelectedStrategy(opt.id)} className={`w-full p-4 rounded-2xl border-2 text-left transition ${selectedStrategy === opt.id ? 'bg-white text-blue-700 border-white shadow-xl scale-[1.02]' : 'bg-blue-600/50 border-blue-500 hover:border-blue-300'}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-black uppercase">{opt.label}</span>
                  {selectedStrategy === opt.id && <Check size={14}/>}
                </div>
                <div className="text-2xl font-black">${opt.val.toFixed(2)}</div>
                <div className={`text-[9px] font-bold mt-1 ${selectedStrategy === opt.id ? 'text-blue-400' : 'text-blue-300'}`}>Profit: +${(opt.val - unitInternalCost).toFixed(2)}</div>
              </button>
            ))}

            <button onClick={() => handleSaveOrUpdate(activeId ? 'update' : 'new')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-slate-800 transition active:scale-95 uppercase tracking-widest text-xs">
              {activeId ? 'Update Quote' : 'Save Quote'}
            </button>
            {status && <div className="text-center text-[10px] font-black animate-pulse bg-white/20 py-1.5 rounded-full uppercase">{status}</div>}
          </div>
        </div>

        {/* HISTORY */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border shadow-sm">
           <div className="flex justify-between items-center mb-4">
             <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-[.2em]">Production History</h3>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
               <thead className="text-[10px] text-slate-400 uppercase font-bold border-b">
                 <tr>
                   <th className="p-3">Quote</th>
                   <th className="p-3">Name & Filament</th>
                   <th className="p-3">Stats</th>
                   <th className="p-3">Unit Cost</th>
                   <th className="p-3">Unit Price</th>
                   <th className="p-3 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {history.map(item => (
                   <tr key={item.id} className={`border-b last:border-0 hover:bg-slate-50 transition-colors ${activeId === item.id ? 'bg-blue-50/50 ring-1 ring-inset ring-blue-200' : ''}`}>
                     <td className="p-3 font-mono font-bold text-slate-400 text-xs">{item.quoteNo}</td>
                     <td className="p-3">
                        <div className="font-bold text-slate-800 uppercase tracking-tighter">{item.name}</div>
                        <div className="text-[9px] text-slate-400 italic">{item.details.filamentName}</div>
                     </td>
                     <td className="p-3">
                       <span className="text-[10px] font-bold text-slate-500">{item.hours}h | {item.grams}g</span>
                     </td>
                     <td className="p-3 font-mono text-slate-400 text-xs">${item.unitCost}</td>
                     <td className="p-3 font-black text-blue-700 text-lg">${item.unitPrice}</td>
                     <td className="p-3 text-right">
                        <button onClick={() => {setActiveId(item.id); setJob(item.details); setSelectedStrategy(item.details.strategy || 'markup'); window.scrollTo({top:0, behavior:'smooth'})}} className="p-2 text-blue-500 hover:bg-white rounded transition shadow-sm border border-transparent hover:border-blue-100"><Download size={16}/></button>
                        <button onClick={() => setHistory(history.filter(h=>h.id!==item.id))} className="p-2 text-red-200 hover:text-red-500"><Trash2 size={16}/></button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PrintingApp;