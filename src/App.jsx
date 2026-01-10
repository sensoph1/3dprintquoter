import React, { useState, useEffect } from 'react';
import { Trash2, Save, Package, Plus, Copy, Globe, Hash, Clock, Percent, Calculator, Download, Check, TrendingUp, Database, FlaskConical, Printer, FileText } from 'lucide-react';

const PrintingApp = () => {
  // --- 1. STATE ---
  const [status, setStatus] = useState('');
  const [history, setHistory] = useState([]);
  const [showFilamentManager, setShowFilamentManager] = useState(false);
  const [activeId, setActiveId] = useState(null); 
  const [selectedStrategy, setSelectedStrategy] = useState('markup');

  const [printers] = useState([{ id: 1, name: 'Bambu P1S', watts: 1300, printerPrice: 650, lifespan: 12000, active: true }]);
  
  const [job, setJob] = useState({
    name: '', qty: 1, hours: 0, modelGrams: 0, wasteGrams: 0, extraCosts: 0, laborHours: 0, notes: '',
    desiredMargin: 50, hourlyRateOverride: 10.00, materialMarkup: 2.0, quoteNo: '',
    selectedFilamentId: null
  });

  const [library, setLibrary] = useState({
    filaments: [{ id: 1, name: 'Standard PLA', price: 20, grams: 1000, desc: 'Generic PLA' }],
    nextQuoteNo: 1001,
    kwhRate: 0.14,
    laborRate: 15,
    shopName: "My 3D Printing Shop"
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

  const roundToFive = (num) => Math.ceil(num / 5) * 5;

  // --- 3. CALCULATION ENGINE ---
  const activePrinter = printers[0];
  const activeFilament = library.filaments.find(f => f.id === job.selectedFilamentId) || library.filaments[0];
  const totalGrams = Number(job.modelGrams) + Number(job.wasteGrams);
  const baseMaterialCost = (activeFilament.price / activeFilament.grams) * totalGrams;
  const baseOpCost = ((activePrinter.printerPrice / activePrinter.lifespan) + ((activePrinter.watts / 1000) * library.kwhRate)) * job.hours;
  const baseLaborCost = library.laborRate * job.laborHours;
  const totalBatchInternalCost = baseMaterialCost + baseOpCost + baseLaborCost + Number(job.extraCosts);
  const unitInternalCost = totalBatchInternalCost / (job.qty || 1);
  
  const priceMarkup = roundToFive(((baseMaterialCost * job.materialMarkup) + (job.hourlyRateOverride * job.hours) + (baseLaborCost * job.materialMarkup) + (Number(job.extraCosts) * job.materialMarkup)) / (job.qty || 1));
  const priceMargin = roundToFive((totalBatchInternalCost / (1 - (job.desiredMargin / 100))) / (job.qty || 1));
  const priceHourly = roundToFive(((job.hourlyRateOverride * job.hours) + (baseMaterialCost * job.materialMarkup) + Number(job.extraCosts)) / (job.qty || 1));

  const getFinalPrice = () => {
    if (selectedStrategy === 'markup') return priceMarkup;
    if (selectedStrategy === 'margin') return priceMargin;
    return priceHourly;
  };

  // --- 4. PRINT QUOTE GENERATOR ---
  const handlePrint = (quoteData = null) => {
    const currentPrice = quoteData ? Number(quoteData.unitPrice) : getFinalPrice();
    const currentQty = quoteData ? quoteData.qty : job.qty;
    const userQty = prompt(`Quote Quantity for "${quoteData?.name || job.name}":`, currentQty);
    if (userQty === null) return;
    const finalQty = parseInt(userQty) || 1;

    const data = quoteData || {
      quoteNo: job.quoteNo || "DRAFT",
      name: job.name || "Custom 3D Print",
      unitPrice: currentPrice,
      qty: finalQty,
      filament: activeFilament.name,
      date: new Date().toLocaleDateString(),
      notes: job.notes
    };

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Quote ${data.quoteNo}</title>
          <style>
            body { font-family: -apple-system, sans-serif; padding: 50px; color: #1a1a1a; line-height: 1.5; }
            .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
            .shop-name { font-size: 28px; font-weight: 900; color: #1e40af; text-transform: uppercase; letter-spacing: -1px; }
            .details-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            .details-table th { background: #f1f5f9; text-align: left; padding: 15px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #475569; }
            .details-table td { padding: 15px; border-bottom: 1px solid #e2e8f0; }
            .total-box { background: #1e293b; color: white; padding: 25px; border-radius: 12px; display: inline-block; float: right; min-width: 250px; text-align: right; }
            .total-amount { font-size: 32px; font-weight: 900; }
            .notes-section { margin-top: 50px; clear: both; padding-top: 20px; border-top: 1px dashed #cbd5e1; }
          </style>
        </head>
        <body>
          <div class="header">
            <div><div class="shop-name">${library.shopName}</div><div>Service Quote</div></div>
            <div style="text-align: right;"><div style="font-weight: bold;"># ${data.quoteNo}</div><div>${data.date}</div></div>
          </div>
          <table class="details-table">
            <thead>
              <tr><th>Item Description</th><th>Specs</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong style="font-size: 16px;">${data.name}</strong></td>
                <td>${data.filament}</td>
                <td>${data.qty}</td>
                <td>$${Number(data.unitPrice).toFixed(2)}</td>
                <td>$${(data.qty * data.unitPrice).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div class="total-box">
            <div style="font-size: 12px; opacity: 0.7;">TOTAL ESTIMATE</div>
            <div class="total-amount">$${(data.qty * data.unitPrice).toFixed(2)}</div>
          </div>
          ${data.notes ? `<div class="notes-section"><strong>Client Notes:</strong><br/>${data.notes}</div>` : ''}
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSaveOrUpdate = (mode) => {
    const finalPrice = getFinalPrice();
    const entryData = {
      date: new Date().toLocaleDateString(),
      name: job.name || "Untitled Item",
      unitPrice: finalPrice,
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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT PANEL */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center">
             <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="p-3 bg-blue-600 text-white rounded-2xl"><Package size={24}/></div>
                <input 
                  className="bg-transparent font-black text-2xl outline-none w-full border-b-2 border-transparent focus:border-blue-100 uppercase tracking-tighter" 
                  value={library.shopName} 
                  onChange={(e) => saveLibrary({...library, shopName: e.target.value})}
                  placeholder="Shop Name"
                />
             </div>
             <div className="flex gap-4 w-full md:w-auto items-center bg-slate-50 p-2 rounded-2xl border">
                <FlaskConical className="ml-2 text-blue-500" size={20}/>
                <select value={job.selectedFilamentId || ''} onChange={(e) => setJob({...job, selectedFilamentId: parseInt(e.target.value)})} className="bg-transparent font-bold text-sm outline-none cursor-pointer p-2">
                   {library.filaments.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <button onClick={() => setShowFilamentManager(!showFilamentManager)} className="p-2 text-slate-400 hover:text-blue-500 transition"><Database size={18}/></button>
             </div>
          </div>

          {showFilamentManager && (
            <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-xl animate-in fade-in zoom-in-95">
               <h3 className="font-black text-[10px] uppercase tracking-widest text-blue-400 mb-4">Filament Database</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {library.filaments.map(f => (
                    <div key={f.id} className="flex gap-3 bg-slate-50 p-3 rounded-2xl border items-center">
                       <input className="font-bold flex-grow bg-transparent text-sm" value={f.name} onChange={(e)=>saveLibrary({...library, filaments: library.filaments.map(x=>x.id===f.id?{...x, name:e.target.value}:x)})}/>
                       <div className="text-xs font-mono">$<input type="number" className="w-12 bg-transparent border-b" value={f.price} onChange={(e)=>saveLibrary({...library, filaments: library.filaments.map(x=>x.id===f.id?{...x, price:e.target.value}:x)})}/></div>
                       <button onClick={() => saveLibrary({...library, filaments: library.filaments.filter(x=>x.id!==f.id)})} className="text-red-200 hover:text-red-500 transition"><Trash2 size={16}/></button>
                    </div>
                  ))}
                  <button onClick={() => saveLibrary({...library, filaments: [...library.filaments, {id:Date.now(), name:'New Resin/PLA', price:25, grams:1000}]})} className="py-3 border-2 border-dashed rounded-2xl text-[10px] font-black text-slate-300 hover:text-blue-400 hover:border-blue-200 transition">+ ADD MATERIAL</button>
               </div>
            </div>
          )}

          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <div className="flex gap-3">
                    {job.quoteNo && <div className="p-4 bg-slate-100 rounded-2xl font-mono text-xs font-black text-slate-400 flex items-center">{job.quoteNo}</div>}
                    <input type="text" value={job.name} onChange={(e) => setJob({...job, name: e.target.value})} className="flex-grow p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl font-black text-xl outline-none" placeholder="Project Name..."/>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[{l:'Qty', k:'qty'}, {l:'Hours', k:'hours'}, {l:'Model (g)', k:'modelGrams'}, {l:'Waste (g)', k:'wasteGrams'}, {l:'Misc $', k:'extraCosts'}, {l:'Labor (h)', k:'laborHours'}].map(i => (
                      <div key={i.k}><label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">{i.l}</label>
                      <input type="number" value={job[i.k]} onChange={(e) => setJob({...job, [i.k]: parseFloat(e.target.value) || 0})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-sm outline-none focus:ring-1 focus:ring-blue-300"/></div>
                    ))}
                  </div>
               </div>

               {/* RE-INSERTED MARGIN SLIDER PANEL */}
               <div className="bg-slate-900 rounded-[2rem] p-8 text-white space-y-6">
                  <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Project Multipliers</h4>
                  <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-[9px] opacity-50 block mb-2 uppercase">Mat. Markup (x)</label>
                        <input type="number" step="0.1" className="w-full bg-white/10 p-3 rounded-xl font-bold border border-white/10 outline-none focus:border-blue-500" value={job.materialMarkup} onChange={(e)=>setJob({...job, materialMarkup:e.target.value})}/>
                      </div>
                      <div>
                        <label className="text-[9px] opacity-50 block mb-2 uppercase">Hourly Rate ($)</label>
                        <input type="number" className="w-full bg-white/10 p-3 rounded-xl font-bold border border-white/10 outline-none focus:border-blue-500" value={job.hourlyRateOverride} onChange={(e)=>setJob({...job, hourlyRateOverride:e.target.value})}/>
                      </div>
                  </div>
                  
                  {/* RESTORED SLIDER */}
                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[9px] opacity-50 uppercase font-black tracking-widest">Target Margin %</label>
                      <span className="text-blue-400 font-black text-lg">{job.desiredMargin}%</span>
                    </div>
                    <input 
                      type="range" min="5" max="95" 
                      value={job.desiredMargin} 
                      onChange={(e) => setJob({...job, desiredMargin: e.target.value})} 
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  <textarea className="w-full bg-white/5 p-4 rounded-2xl text-xs h-20 outline-none border border-white/5 focus:border-blue-900 transition mt-2" placeholder="Project or Client notes..." value={job.notes} onChange={(e)=>setJob({...job, notes:e.target.value})}/>
               </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-1">
          <div className="bg-blue-600 p-8 rounded-[3rem] shadow-2xl sticky top-8 space-y-6 text-white border-b-[12px] border-blue-800">
             <div className="flex justify-between items-end border-b border-blue-400 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 underline underline-offset-4 decoration-blue-300">Quoting</span>
                <span className="text-right"><div className="text-[8px] uppercase font-bold opacity-50">Unit Cost</div><div className="font-black">$${unitInternalCost.toFixed(2)}</div></span>
             </div>

             {['markup', 'margin', 'hourly'].map(id => {
               const val = id === 'markup' ? priceMarkup : id === 'margin' ? priceMargin : priceHourly;
               return (
                 <button key={id} onClick={() => setSelectedStrategy(id)} className={`w-full p-5 rounded-3xl border-2 text-left transition-all ${selectedStrategy === id ? 'bg-white text-blue-600 border-white shadow-xl scale-[1.03]' : 'bg-blue-500/50 border-blue-400 hover:border-white'}`}>
                   <div className="text-[9px] font-black uppercase mb-1 opacity-70 tracking-tighter">
                     {id === 'margin' ? `${job.desiredMargin}% Margin` : id === 'markup' ? 'Standard Markup' : 'Time + Mat'}
                   </div>
                   <div className="text-3xl font-black">${val}</div>
                 </button>
               );
             })}

             <div className="pt-6 space-y-3">
                <button onClick={() => handleSaveOrUpdate(activeId ? 'update' : 'new')} className="w-full py-5 bg-slate-900 rounded-3xl font-black text-xs tracking-[0.2em] hover:bg-slate-800 transition shadow-xl">
                  {activeId ? 'UPDATE RECORD' : 'SAVE TO HISTORY'}
                </button>
                <button onClick={() => handlePrint()} className="w-full py-4 bg-white/10 rounded-3xl font-black text-[10px] flex items-center justify-center gap-3 hover:bg-white/20 transition">
                  <Printer size={16}/> GENERATE QUOTE PDF
                </button>
             </div>
             {status && <div className="text-center text-[10px] font-black animate-pulse bg-white/20 py-2 rounded-full uppercase tracking-widest">{status}</div>}
          </div>
        </div>

        {/* LEDGER */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] border p-8 shadow-sm">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">Production History</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="text-[9px] font-black text-slate-300 uppercase border-b-2 border-slate-50">
                   <th className="p-4">ID</th><th className="p-4">Project</th><th className="p-4">Specs</th><th className="p-4">Unit Cost</th><th className="p-4">Unit Price</th><th className="p-4 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="text-sm">
                 {history.map(item => (
                   <tr key={item.id} className={`border-b border-slate-50 last:border-0 hover:bg-blue-50/20 transition ${activeId === item.id ? 'bg-blue-50/50' : ''}`}>
                     <td className="p-4 font-mono font-bold text-slate-300 text-xs">{item.quoteNo}</td>
                     <td className="p-4 font-black uppercase text-slate-700 tracking-tighter">{item.name}</td>
                     <td className="p-4 font-bold text-slate-400 text-xs truncate max-w-[200px]">{item.hours}h | {item.grams}g | {item.details.filamentName}</td>
                     <td className="p-4 font-mono text-slate-200 text-xs">${item.unitCost}</td>
                     <td className="p-4 font-black text-blue-600 text-2xl">${item.unitPrice}</td>
                     <td className="p-4 text-right space-x-2">
                        <button onClick={() => {setActiveId(item.id); setJob(item.details); setSelectedStrategy(item.details.strategy || 'markup'); window.scrollTo({top:0, behavior:'smooth'})}} className="p-2 text-blue-400 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-blue-100 transition"><Download size={18}/></button>
                        <button onClick={() => handlePrint({ ...item, filament: item.details.filamentName })} className="p-2 text-slate-300 hover:text-slate-600 transition"><Printer size={18}/></button>
                        <button onClick={() => setHistory(history.filter(h=>h.id!==item.id))} className="p-2 text-red-100 hover:text-red-400 transition"><Trash2 size={18}/></button>
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

