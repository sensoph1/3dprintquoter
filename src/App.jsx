import React, { useState, useEffect } from 'react';
import { 
  Calculator, History, FlaskConical, Printer, 
  Settings, Layers, HardDrive, Package 
} from 'lucide-react';

// Import split components
import CalculatorTab from './components/CalculatorTab';
import InventoryTab from './components/InventoryTab';
import LedgerTab from './components/LedgerTab';
import FilamentTab from './components/FilamentTab';
import PrinterTab from './components/PrinterTab';
import SettingsTab from './components/SettingsTab';

// --- 0. SEED DATA (v13) ---
const DEFAULT_LIBRARY = {
  filaments: [
    { id: 1, name: 'Bambu Matte PLA', price: 24.99, grams: 1000, color: '#3b82f6' },
    { id: 2, name: 'Prusament PETG', price: 29.99, grams: 1000, color: '#ef4444' }
  ],
  printers: [
    { id: 1, name: 'Bambu Lab X1C', watts: 350, cost: 1200, lifespan: 15000 },
    { id: 2, name: 'Prusa MK4', watts: 200, cost: 800, lifespan: 20000 }
  ],
  inventory: [],
  printedParts: [],
  nextQuoteNo: 5001,
  kwhRate: 0.14,
  laborRate: 25,
  shopHourlyRate: 15.00, // Standard Per Print Hour Multiplier
  shopName: "PRO PRINT STUDIO"
};

const DEFAULT_HISTORY = [];

const PrintingApp = () => {
  // --- 1. STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('calculator');
  const [status, setStatus] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState('markup');

  const [library, setLibrary] = useState(() => {
    const saved = localStorage.getItem('pro3d_library_v13');
    return saved ? JSON.parse(saved) : DEFAULT_LIBRARY;
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('pro3d_history_v13');
    return saved ? JSON.parse(saved) : DEFAULT_HISTORY;
  });

  const [job, setJob] = useState({
    name: '', 
    qty: 1, 
    hours: 0, 
    materials: [{ filamentId: 1, grams: 0 }], 
    extraCosts: 0, 
    laborHours: 0,
    desiredMargin: 50, 
    materialMarkup: 2.5,
    hourlyRateOverride: 0, 
    selectedPrinterId: 1
  });

  // --- 2. PERSISTENCE ---
  const saveToDisk = (newLib, newHis = null) => {
    if (newLib) {
      setLibrary(newLib);
      localStorage.setItem('pro3d_library_v13', JSON.stringify(newLib));
    }
    if (newHis) {
      setHistory(newHis);
      localStorage.setItem('pro3d_history_v13', JSON.stringify(newHis));
    }
  };

  // --- 3. MATH ENGINE (UNIT-BASED) ---
  const activePrinter = library.printers.find(p => p.id === job.selectedPrinterId) || library.printers[0];
  
  // A. Material Cost per Unit
  const unitMaterialCost = (job.materials || []).reduce((total, entry) => {
    const filament = library.filaments.find(f => f.id === entry.filamentId) || library.filaments[0];
    const costPerGram = filament.price / filament.grams;
    return total + (costPerGram * (entry.grams || 0));
  }, 0);

  // B. Production Costs per Unit
  const electricityCost = (activePrinter.watts / 1000) * library.kwhRate * job.hours;
  const depreciationCost = (activePrinter.cost / activePrinter.lifespan) * job.hours;
  const unitOpCost = electricityCost + depreciationCost;
  const unitLaborCost = library.laborRate * job.laborHours;
  
  // C. Total Internal Cost per Unit
  const unitInternalCost = unitMaterialCost + unitOpCost + unitLaborCost + Number(job.extraCosts);
  
  const roundToFive = (num) => Math.ceil(num / 5) * 5;

  // D. Effective Multiplier
  const effectiveMultiplier = job.hourlyRateOverride > 0 ? job.hourlyRateOverride : library.shopHourlyRate;

  // E. Final Unit Pricing
  const pricing = {
    markup: roundToFive(
      (unitMaterialCost * job.materialMarkup) + 
      (effectiveMultiplier * job.hours) + 
      (unitLaborCost * 1.2) + 
      Number(job.extraCosts)
    ),
    margin: roundToFive(unitInternalCost / (1 - (job.desiredMargin / 100))),
    hourly: roundToFive(
      ((effectiveMultiplier * 1.5) * job.hours) + 
      (unitMaterialCost * 1.1) + 
      Number(job.extraCosts)
    )
  };

<<<<<<< HEAD
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
=======
  const totalJobPrice = pricing[selectedStrategy] * job.qty;
  const totalJobProfit = totalJobPrice - (unitInternalCost * job.qty);

  // --- 4. HANDLERS ---
  const handleSaveHistory = () => {
    const finalUnitPrice = pricing[selectedStrategy];
    const newEntry = {
      id: Date.now(),
      quoteNo: `Q-${library.nextQuoteNo}`,
      date: new Date().toLocaleDateString(),
      name: job.name || "Untitled Part",
      unitPrice: finalUnitPrice,
      details: { ...job, strategy: selectedStrategy, totalJobPrice }
    };
    
    const existingPartIdx = library.printedParts.findIndex(p => p.name.toLowerCase() === (job.name || "").toLowerCase());
    let newParts = [...library.printedParts];
    
    if (existingPartIdx > -1) {
      newParts[existingPartIdx].qty += Number(job.qty);
      newParts[existingPartIdx].unitPrice = finalUnitPrice;
    } else if (job.name) {
      newParts.push({ id: Date.now(), name: job.name, qty: Number(job.qty), unitPrice: finalUnitPrice, color: 'Multi-Mat' });
>>>>>>> 906aeaa (heavy changes and split the file into parts)
    }

    saveToDisk({ ...library, nextQuoteNo: library.nextQuoteNo + 1, printedParts: newParts }, [newEntry, ...history]);
    setStatus('Logged to Inventory');
    setTimeout(() => setStatus(''), 2000);
  };

  // --- 5. UI COMPONENTS ---
  const TabButton = ({ id, icon: Icon, label }) => (
    <button onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-4 py-4 font-black text-[10px] tracking-widest uppercase transition-all border-b-2 ${activeTab === id ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
      <Icon size={14} /> {label}
    </button>
  );

  return (
<<<<<<< HEAD
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
=======
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">
      <header className="bg-white border-b sticky top-0 z-50 overflow-x-auto no-scrollbar shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center min-w-[1000px]">
          <div className="py-4 flex items-center gap-3 pr-6">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md shadow-blue-200"><Layers size={20} /></div>
            <h1 className="font-black tracking-tighter text-lg uppercase">{library.shopName}</h1>
>>>>>>> 906aeaa (heavy changes and split the file into parts)
          </div>
          <nav className="flex whitespace-nowrap">
            <TabButton id="calculator" icon={Calculator} label="Calculator" />
            <TabButton id="history" icon={History} label="Print History" />
            <TabButton id="printed-inv" icon={HardDrive} label="Printed Inventory" />
            <TabButton id="printers" icon={Printer} label="Printers" />
            <TabButton id="filament-inv" icon={FlaskConical} label="Filament Inventory" />
            <TabButton id="shop-inv" icon={Package} label="Shop Inventory" />
            <TabButton id="settings" icon={Settings} label="Settings" />
          </nav>
        </div>
      </header>

<<<<<<< HEAD
          {showFilamentManager && (
            <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-xl animate-in fade-in zoom-in-95">
               <h3 className="font-black text-[10px] uppercase tracking-widest text-blue-400 mb-4">Filament Database</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {library.filaments.map(f => (
                    <div key={f.id} className="flex gap-3 bg-slate-50 p-3 rounded-2xl border items-center">
                       <input className="font-bold flex-grow bg-transparent text-sm" value={f.name} onChange={(e)=>saveLibrary({...library, filaments: library.filaments.map(x=>x.id===f.id?{...x, name:e.target.value}:x)})}/>
                       <div className="text-xs font-mono">$<input type="number" className="w-12 bg-transparent border-b" value={f.price} onChange={(e)=>saveLibrary({...library, filaments: library.filaments.map(x=>x.id===f.id?{...x, price:e.target.value}:x)})}/></div>
                       <button onClick={() => saveLibrary({...library, filaments: library.filaments.filter(x=>x.id!==f.id)})} className="text-red-200 hover:text-red-500 transition"><Trash2 size={16}/></button>
=======
      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {activeTab === 'calculator' && <CalculatorTab job={job} setJob={setJob} library={library} />}
          {activeTab === 'history' && <LedgerTab history={history} setJob={setJob} setActiveTab={setActiveTab} />}
          {activeTab === 'printed-inv' && <InventoryTab library={library} saveToDisk={saveToDisk} view="printed" />}
          {activeTab === 'shop-inv' && <InventoryTab library={library} saveToDisk={saveToDisk} view="shop" />}
          {activeTab === 'filament-inv' && <FilamentTab library={library} saveToDisk={saveToDisk} />}
          {activeTab === 'printers' && <PrinterTab library={library} saveToDisk={saveToDisk} />}
          {activeTab === 'settings' && <SettingsTab library={library} saveToDisk={saveToDisk} />}
        </div>

        <div className="lg:col-span-4">
          <div className="bg-blue-600 rounded-[3rem] p-8 text-white sticky top-28 shadow-2xl border-b-[12px] border-blue-800">
            <div className="flex justify-between items-center mb-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase opacity-60 tracking-widest">Price Per Part</span>
                <span className="text-[10px] font-bold opacity-40 italic">Unit Cost: ${unitInternalCost.toFixed(2)}</span>
              </div>
              <div className="bg-blue-500/50 px-3 py-1 rounded-full text-[10px] font-black uppercase">Qty: {job.qty}</div>
            </div>

            <div className="space-y-4">
              {['markup', 'margin', 'hourly'].map(id => (
                <button key={id} onClick={() => setSelectedStrategy(id)} 
                  className={`w-full p-6 rounded-[2rem] border-2 text-left transition-all ${
                    selectedStrategy === id ? 'bg-white text-blue-600 border-white scale-[1.05] shadow-xl' : 'bg-blue-500/40 border-blue-400 hover:bg-blue-500/60'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[9px] font-black uppercase opacity-70 mb-1">{id} Pricing</div>
                      <div className="text-4xl font-black">${pricing[id]}</div>
>>>>>>> 906aeaa (heavy changes and split the file into parts)
                    </div>
                    {selectedStrategy === id && <div className="bg-blue-100 p-1 rounded-full text-blue-600"><Layers size={14}/></div>}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-blue-400/30">
               <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[10px] font-black uppercase opacity-60">Job Total</div>
                    <div className="text-2xl font-black">${totalJobPrice.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                     <div className="text-[10px] font-black uppercase opacity-60 text-blue-200">Job Profit</div>
                     <div className="text-lg font-bold text-white">+${totalJobProfit.toFixed(2)}</div>
                  </div>
               </div>
            </div>

<<<<<<< HEAD
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
                        <button onClick={() => handlePrint({ ...item, filament: item.details.filamentName })} className="p-2 text-slate-300 hover😯:text-slate-600 transition"><Printer size={18}/></&& >
                        <button onClick={() => setHistory(history.😃😘(h=>h.id!==item.id))} className=":-2 text-red-100 hover:text-red-400 transition"><Trash2 size={18}/></button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>
=======
            <button onClick={handleSaveHistory} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-[10px] tracking-[0.2em] uppercase mt-8 hover:bg-slate-800 transition active:scale-95 shadow-xl">LOG PRODUCTION</button>
            {status && <div className="mt-4 text-center text-[10px] font-black animate-bounce bg-blue-500/50 py-2 rounded-full uppercase tracking-widest">{status}</div>}
          </div>
        </div>
      </main>
>>>>>>> 906aeaa (heavy changes and split the file into parts)
    </div>
  );
};

export default PrintingApp;

