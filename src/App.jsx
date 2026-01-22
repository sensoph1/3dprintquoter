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

const App = () => {
  const [activeTab, setActiveTab] = useState('calculator');

  const [library, setLibrary] = useState(() => {
    const saved = localStorage.getItem('studio_db');
    return saved ? JSON.parse(saved) : {
      shopName: "Studio OS",
      shopHourlyRate: 2.00,
      laborRate: 20.00,
      kwhRate: 0.12,
      nextQuoteNo: 1001,
      filaments: [{ id: 1, name: "Matte PLA", colorName: "Black", price: 22, grams: 1000, color: "#3b82f6" }],
      printers: [{ id: 1, name: "Bambu Lab X1C", watts: 350 }]
    };
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('studio_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [job, setJob] = useState({
    name: "",
    qty: 1,
    hours: 0,
    laborMinutes: 0, // Minutes-based labor
    extraCosts: 0,
    infill: "15%",
    walls: "3",
    layerHeight: "0.2mm",
    notes: "", // Custom production notes
    materials: [{ filamentId: 1, grams: 0 }],
    selectedPrinterId: 1
  });

  const stats = (() => {
    const matCost = job.materials.reduce((sum, m) => {
      const f = library.filaments.find(x => x.id === parseInt(m.filamentId)) || library.filaments[0];
      return sum + ((parseFloat(m.grams) || 0) * (f.price / f.grams));
    }, 0);

    const printer = library.printers.find(p => p.id === job.selectedPrinterId) || library.printers[0];
    const energy = (job.hours * (printer.watts / 1000)) * library.kwhRate;
    const labor = (job.laborMinutes / 60) * library.laborRate; // Hourly rate applied to minutes
    const machine = job.hours * library.shopHourlyRate;
    
    const baseCost = matCost + energy + labor + machine + (parseFloat(job.extraCosts) || 0);
    const total = baseCost * job.qty;
    const profit = total - (matCost + energy);

    return { total, profit, baseCost };
  })();

  const saveToDisk = (newLib, newHist = history) => {
    setLibrary(newLib);
    setHistory(newHist);
    localStorage.setItem('studio_db', JSON.stringify(newLib));
    localStorage.setItem('studio_history', JSON.stringify(newHist));
  };

  const handleLogProduction = () => {
    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      quoteNo: `Q-${library.nextQuoteNo}`,
      name: job.name || "Untitled Project",
      unitPrice: stats.total,
      notes: job.notes, // Saving notes to ledger
      details: { ...job }
    };
    saveToDisk({ ...library, nextQuoteNo: library.nextQuoteNo + 1 }, [newEntry, ...history]);
    alert("Production logged with notes!");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 font-sans">
      <header className="max-w-[1600px] mx-auto pt-6 pb-8 px-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-2.5 rounded-2xl text-white shadow-lg"><Box size={22} /></div>
          <h1 className="text-lg font-black uppercase tracking-tighter leading-none">
            {library.shopName} <br/>
            <span className="text-blue-600 text-[9px] tracking-[0.2em] font-black uppercase">Studio OS</span>
          </h1>
        </div>
        <nav className="bg-white p-1.5 rounded-full shadow-sm border border-slate-100 flex items-center">
          {['calculator', 'materials', 'hardware', 'ledger', 'settings'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-[1600px] mx-auto px-8">
        {activeTab === 'calculator' ? (
          <div className="studio-cockpit">
            <div className="left-workbench bg-white rounded-studio border border-slate-100 shadow-sm">
              <CalculatorTab job={job} setJob={setJob} library={library} />
            </div>
            <div className="right-engine">
              <div className="bg-[#1e60ff] rounded-studio p-8 text-white shadow-2xl flex flex-col min-h-[700px]">
                <div className="mb-8 px-1">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Pricing Engine</h3>
                  <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Live Quote v2.3</p>
                </div>
                <div className="space-y-4 flex-grow">
                  <div className="bg-white rounded-[2rem] p-7 text-blue-600 shadow-xl border-b-4 border-blue-50">
                    <span className="text-[9px] font-black uppercase tracking-widest block mb-2 opacity-40">Estimated Quote</span>
                    <h2 className="text-5xl font-black tabular-nums tracking-tighter">${stats.total.toFixed(0)}</h2>
                  </div>
                  <div className="bg-white/10 border border-white/20 rounded-[2rem] p-6">
                    <span className="text-[9px] font-black uppercase tracking-widest block mb-1 opacity-40">Profit Margin</span>
                    <h2 className="text-3xl font-black tabular-nums">${stats.profit.toFixed(2)}</h2>
                  </div>
                </div>
                <div className="mt-10 mb-8 border-t border-white/10 pt-8 px-1 flex justify-between items-end">
                  <div>
                    <span className="text-[9px] font-black uppercase opacity-50 block mb-1">Job Total ({job.qty}x)</span>
                    <h3 className="text-3xl font-black">${stats.total.toFixed(2)}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black opacity-50 block mb-1">Base Cost</span>
                    <h3 className="text-xl font-black text-blue-200">${stats.baseCost.toFixed(2)}</h3>
                  </div>
                </div>
                <button onClick={handleLogProduction} className="w-full py-5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl transition-all">
                  Log Production
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
             {activeTab === 'ledger' && <LedgerTab history={history} saveToDisk={saveToDisk} library={library} />}
             {/* Other tabs... */}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;