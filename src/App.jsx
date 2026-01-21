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

// --- VERSION 13 SEED DATA ---
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
  shopHourlyRate: 15.00, // Global Per Print Hour Multiplier
  shopName: "PRO PRINT STUDIO"
};

const DEFAULT_HISTORY = [];

const PrintingApp = () => {
  // --- 1. STATE ---
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
  
  const unitMaterialCost = (job.materials || []).reduce((total, entry) => {
    const filament = library.filaments.find(f => f.id === entry.filamentId) || library.filaments[0];
    const costPerGram = filament.price / filament.grams;
    return total + (costPerGram * (entry.grams || 0));
  }, 0);

  const electricityCost = (activePrinter.watts / 1000) * library.kwhRate * job.hours;
  const depreciationCost = (activePrinter.cost / activePrinter.lifespan) * job.hours;
  const unitOpCost = electricityCost + depreciationCost;
  const unitLaborCost = library.laborRate * job.laborHours;
  
  const unitInternalCost = unitMaterialCost + unitOpCost + unitLaborCost + Number(job.extraCosts);
  const roundToFive = (num) => Math.ceil(num / 5) * 5;

  const effectiveMultiplier = job.hourlyRateOverride > 0 ? job.hourlyRateOverride : library.shopHourlyRate;

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

  const totalJobPrice = pricing[selectedStrategy] * job.qty;
  const totalJobProfit = totalJobPrice - (unitInternalCost * job.qty);

  // --- 4. LOGGING ---
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
    }

    saveToDisk({ ...library, nextQuoteNo: library.nextQuoteNo + 1, printedParts: newParts }, [newEntry, ...history]);
    setStatus('Logged Successfully');
    setTimeout(() => setStatus(''), 2000);
  };

  // --- 5. RENDER HELPERS ---
  const TabButton = ({ id, icon: Icon, label }) => (
    <button onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-4 py-4 font-black text-[10px] tracking-widest uppercase transition-all border-b-2 ${activeTab === id ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
      <Icon size={14} /> {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">
      <header className="bg-white border-b sticky top-0 z-50 overflow-x-auto no-scrollbar shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center min-w-[1000px]">
          <div className="py-4 flex items-center gap-3 pr-6">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md shadow-blue-200"><Layers size={20} /></div>
            <h1 className="font-black tracking-tighter text-lg uppercase">{library.shopName}</h1>
          </div>
          <nav className="flex whitespace-nowrap">
            <TabButton id="calculator" icon={Calculator} label="Calculator" />
            <TabButton id="history" icon={History} label="History" />
            <TabButton id="printed-inv" icon={HardDrive} label="Printed Parts" />
            <TabButton id="printers" icon={Printer} label="Printers" />
            <TabButton id="filament-inv" icon={FlaskConical} label="Filament" />
            <TabButton id="settings" icon={Settings} label="Settings" />
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {activeTab === 'calculator' && <CalculatorTab job={job} setJob={setJob} library={library} />}
          {activeTab === 'history' && <LedgerTab history={history} setJob={setJob} setActiveTab={setActiveTab} />}
          {activeTab === 'printed-inv' && <InventoryTab library={library} saveToDisk={saveToDisk} view="printed" />}
          {activeTab === 'filament-inv' && <FilamentTab library={library} saveToDisk={saveToDisk} />}
          {activeTab === 'printers' && <PrinterTab library={library} saveToDisk={saveToDisk} />}
          {activeTab === 'settings' && <SettingsTab library={library} saveToDisk={saveToDisk} history={history} />}
        </div>

        {/* PRICE SIDEBAR */}
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
                    </div>
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
                     <div className="text-[10px] font-black uppercase opacity-60 text-blue-200">Profit</div>
                     <div className="text-lg font-bold text-white">+${totalJobProfit.toFixed(2)}</div>
                  </div>
               </div>
            </div>

            <button onClick={handleSaveHistory} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-[10px] tracking-[0.2em] uppercase mt-8 hover:bg-slate-800 transition active:scale-95">LOG PRODUCTION</button>
            {status && <div className="mt-4 text-center text-[10px] font-black animate-bounce bg-blue-500/50 py-2 rounded-full uppercase tracking-widest">{status}</div>}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrintingApp;