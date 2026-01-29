import React, { useState } from 'react';
import { 
  Calculator, FlaskConical, Cpu, 
  Settings as SettingsIcon, History, 
  Box 
} from 'lucide-react';

import CalculatorTab from './components/CalculatorTab';
import FilamentTab from './components/FilamentTab';
import PrinterTab from './components/PrinterTab';
import SettingsTab from './components/SettingsTab';
import LedgerTab from './components/LedgerTab';
import InventoryTab from './components/InventoryTab';

import generateUniqueId from './utils/idGenerator';

const ensureNumber = (value, defaultValue = 0) => {
  const num = parseFloat(value);
  return isNaN(num) ? defaultValue : num;
};

const App = () => {
  const [activeTab, setActiveTab] = useState('calculator');

  const tabs = {
    calculator: { name: 'Calculator', icon: Calculator },
    filament: { name: 'Filament', icon: FlaskConical },
    printer: { name: 'Printer', icon: Cpu },
    inventory: { name: 'Inventory', icon: Box },
    ledger: { name: 'Ledger', icon: History },
    settings: { name: 'Settings', icon: SettingsIcon },
  };

  const [library, setLibrary] = useState(() => {
    const saved = localStorage.getItem('studio_db');
    return saved ? JSON.parse(saved) : {
      shopName: "Studio OS",
      shopHourlyRate: 2.00,
      laborRate: 20.00,
      kwhRate: 0.12,
      nextQuoteNo: 1001,
      filaments: [{ id: 1, name: "Matte PLA", colorName: "Black", price: 22, grams: 1000, color: "#3b82f6" }],
      printers: [{ id: 1, name: "Bambu Lab X1C", watts: 350, cost: 0, hoursOfLife: 0 }],
      printedParts: [],
      inventory: [],
      rounding: 1
    };
  });

  const getDefaultJob = (library) => ({
    name: "",
    qty: 1,
    hours: 0,
    laborMinutes: 0,
    extraCosts: 0,
    infill: "15%",
    walls: "3",
    layerHeight: "0.2mm",
    notes: "",
    materials: [{ filamentId: 1, grams: 0 }],
    selectedPrinterId: 1,
    overrideShopHourlyRate: ensureNumber(library.shopHourlyRate, 0),
    materialCostMultiplier: 2,
    profitMargin: 20,
    rounding: ensureNumber(library.rounding, 1)
  });

  const [job, setJob] = useState(() => getDefaultJob(library));

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('studio_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [editingJobId, setEditingJobId] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const matCost = job.materials.reduce((sum, m) => {
    const f = library.filaments.find(x => x.id === parseInt(m.filamentId)) || { price: 0, grams: 1 }; // Default filament if not found
    return sum + (ensureNumber(m.grams) * (ensureNumber(f.price) / Math.max(1, ensureNumber(f.grams))));
  }, 0);

  const selectedPrinter = library.printers.find(p => p.id === job.selectedPrinterId);
  const printer = selectedPrinter || { watts: 0, cost: 0, hoursOfLife: 1 }; // Default printer if not found, hoursOfLife defaults to 1 to prevent division by zero

  const energy = (ensureNumber(job.hours) * (ensureNumber(printer.watts) / 1000)) * ensureNumber(library.kwhRate);
  const labor = (ensureNumber(job.laborMinutes) / 60) * ensureNumber(library.laborRate);
  
  const depreciationCost = (ensureNumber(printer.cost) / Math.max(1, ensureNumber(printer.hoursOfLife))) * ensureNumber(job.hours);
  
  const baseCost = matCost + energy + labor + ensureNumber(job.extraCosts) + depreciationCost;

  const qty = Math.max(1, ensureNumber(job.qty));
  const rounding = Math.max(0.01, ensureNumber(job.rounding));
  const costPerItem = baseCost / qty;

  const unroundedPriceByProfitMargin = costPerItem / Math.max(0.01, (1 - (ensureNumber(job.profitMargin) / 100)));
  const unroundedPriceByHourlyRate = (ensureNumber(job.hours) * ensureNumber(job.overrideShopHourlyRate)) / qty;
  const unroundedPriceByMaterialMultiplier = (baseCost * 3) / qty;
  const materialCostPerItemAdvanced = (matCost * ensureNumber(job.materialCostMultiplier)) / qty;

  const stats = {
    baseCost, // This remains the total base cost for the job
    energy,
    depreciationCost,
    matCost,
    priceByProfitMargin: Math.ceil(unroundedPriceByProfitMargin / rounding) * rounding,
    priceByHourlyRate: Math.ceil(unroundedPriceByHourlyRate / rounding) * rounding,
    priceByMaterialMultiplier: Math.ceil(unroundedPriceByMaterialMultiplier / rounding) * rounding,
    costPerItem: costPerItem,
    materialCostPerItemAdvanced: materialCostPerItemAdvanced
  };

  const saveToDisk = (newLib, newHist = history) => {
    setLibrary(newLib);
    setHistory(newHist);
    localStorage.setItem('studio_db', JSON.stringify(newLib));
    localStorage.setItem('studio_history', JSON.stringify(newHist));
  };

    const handleLogProduction = () => {
    const newEntry = {
      id: generateUniqueId(),
      date: new Date().toLocaleDateString(),
      quoteNo: `Q-${library.nextQuoteNo}`,
      name: job.name || "Untitled Project",
      unitPrice: stats.priceByProfitMargin,
      costPerItem: stats.costPerItem,
      notes: job.notes, // Saving notes to ledger
      details: { ...job }
    };
    saveToDisk({ ...library, nextQuoteNo: library.nextQuoteNo + 1 }, [newEntry, ...history]);
    alert("Production logged with notes!");
  };

  const handleUpdateJob = () => {
    const newHistory = history.map(item => {
      if (item.id === editingJobId) {
        return {
          ...item,
          name: job.name,
          unitPrice: stats.priceByProfitMargin,
          costPerItem: stats.costPerItem,
          notes: job.notes,
          details: { ...job }
        };
      }
      return item;
    });
    saveToDisk(library, newHistory);
    setEditingJobId(null);
    setJob(getDefaultJob(library));
    alert("Job updated successfully!");
  };

  const handleCancelEdit = () => {
    setEditingJobId(null);
    setJob(getDefaultJob(library));
  };

  const handleJobLoad = (jobDetails, jobId = null) => {
    setJob(jobDetails);
    setEditingJobId(jobId);
    setActiveTab('calculator');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 font-sans">
      <header className="max-w-[1600px] mx-auto pt-6 pb-8 px-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-2.5 rounded-2xl text-white shadow-lg"><tabs.calculator.icon size={22} /></div>
          <h1 className="text-lg font-black uppercase tracking-tighter leading-none">
            {library.shopName} <br/>
            <span className="text-blue-600 text-[9px] tracking-[0.2em] font-black uppercase">Studio OS</span>
          </h1>
        </div>
        <nav className="bg-white p-1.5 rounded-full shadow-sm border border-slate-100 flex items-center">
          {Object.keys(tabs).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
              {tabs[tab].name}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-[1600px] mx-auto px-8">
        {activeTab === 'calculator' ? (
          <div className="studio-cockpit">
            <div className="left-workbench bg-white rounded-studio border border-slate-100 shadow-sm">
              <CalculatorTab 
                job={job} 
                setJob={setJob} 
                library={library} 
                stats={stats} 
                showAdvanced={showAdvanced} 
                setShowAdvanced={setShowAdvanced} 
              />
            </div>
            <div className="right-engine">
              <div className="bg-[#1e60ff] rounded-studio p-8 text-white shadow-2xl flex flex-col min-h-[700px]">
                <div className="mb-8 px-1">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Pricing Engine</h3>
                  <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Live Quote v2.4</p>
                </div>
                <div className="space-y-4 flex-grow">
                  <div className="bg-white rounded-[2rem] p-6 text-blue-600 shadow-xl border-b-4 border-blue-50">
                    <span className="text-[9px] font-black uppercase tracking-widest block mb-2 opacity-40">Profit Margin ({job.profitMargin}%)</span>
                    <h2 className="text-3xl font-black tabular-nums tracking-tighter">${stats.priceByProfitMargin.toFixed(2)}</h2>
                  </div>
                  <div className="bg-white/10 border border-white/20 rounded-[2rem] p-6">
                    <span className="text-[9px] font-black uppercase tracking-widest block mb-1 opacity-40">Hourly Rate (${job.overrideShopHourlyRate}/hr)</span>
                    <h2 className="text-3xl font-black tabular-nums">${stats.priceByHourlyRate.toFixed(2)}</h2>
                  </div>
                  <div className="bg-white/10 border border-white/20 rounded-[2rem] p-6">
                    <span className="text-[9px] font-black uppercase tracking-widest block mb-1 opacity-40">Material Cost (x{job.materialCostMultiplier})</span>
                    <h2 className="text-3xl font-black tabular-nums">${stats.priceByMaterialMultiplier.toFixed(2)}</h2>
                  </div>
                </div>
                <div className="mt-10 mb-8 border-t border-white/10 pt-8 px-1">
                  <div className="text-right">
                    <span className="text-[9px] font-black opacity-50 block mb-1">Cost Per Item</span>
                    <h3 className="text-xl font-black text-blue-200">${stats.costPerItem.toFixed(2)}</h3>
                  </div>
                </div>
                {editingJobId ? (
                  <div className="flex gap-4">
                    <button onClick={handleUpdateJob} className="w-full py-5 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl transition-all">
                      Save Changes
                    </button>
                    <button onClick={handleCancelEdit} className="w-full py-5 bg-slate-600 hover:bg-slate-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl transition-all">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={handleLogProduction} className="w-full py-5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl transition-all">
                    Log Production
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
             {activeTab === 'filament' && <FilamentTab library={library} saveToDisk={saveToDisk} />}
             {activeTab === 'printer' && <PrinterTab library={library} saveToDisk={saveToDisk} />}
             {activeTab === 'inventory' && <InventoryTab library={library} saveToDisk={saveToDisk} />}
             {activeTab === 'ledger' && <LedgerTab history={history} saveToDisk={saveToDisk} library={library} handleJobLoad={handleJobLoad} />}
             {activeTab === 'settings' && <SettingsTab library={library} saveToDisk={saveToDisk} history={history} />}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;