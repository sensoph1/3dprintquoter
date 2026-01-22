import React, { useState, useEffect } from 'react';
import { 
  Calculator, History, FlaskConical, Printer, 
  Settings, Layers, HardDrive, Package 
} from 'lucide-react';

// --- SUPABASE & AUTH ---
import { supabase } from './supabaseClient';
import AuthGate from './components/Auth';

// --- TAB COMPONENTS ---
import CalculatorTab from './components/CalculatorTab';
import InventoryTab from './components/InventoryTab';
import LedgerTab from './components/LedgerTab';
import FilamentTab from './components/FilamentTab';
import PrinterTab from './components/PrinterTab';
import SettingsTab from './components/SettingsTab';

const DEFAULT_LIBRARY = {
  filaments: [{ id: 1, name: 'Bambu Matte PLA', price: 24.99, grams: 1000, color: '#3b82f6' }],
  printers: [{ id: 1, name: 'Bambu Lab X1C', watts: 350, cost: 1200, lifespan: 15000 }],
  inventory: [],
  printedParts: [],
  nextQuoteNo: 5001,
  kwhRate: 0.14,
  laborRate: 25,
  shopHourlyRate: 15.00,
  shopName: "PRO PRINT STUDIO"
};

const PrintingApp = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [activeTab, setActiveTab] = useState('calculator');
  const [selectedStrategy, setSelectedStrategy] = useState('markup');
  const [library, setLibrary] = useState(DEFAULT_LIBRARY);
  const [history, setHistory] = useState([]);
  
  const [job, setJob] = useState({
    name: '', qty: 1, hours: 0, materials: [{ filamentId: 1, grams: 0 }], 
    extraCosts: 0, laborHours: 0, desiredMargin: 50, materialMarkup: 2.5,
    hourlyRateOverride: 0, selectedPrinterId: 1
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (session) fetchUserData(); }, [session]);

  const fetchUserData = async () => {
    try {
      const { data } = await supabase.from('profiles').select('shop_data').eq('id', session.user.id).single();
      if (data?.shop_data) {
        setLibrary({ ...DEFAULT_LIBRARY, ...data.shop_data.library });
        setHistory(data.shop_data.history || []);
      }
    } catch (err) { console.log("New user setup."); }
  };

  const saveToDisk = async (newLib, newHis = null) => {
    const finalLib = newLib || library;
    const finalHis = newHis !== null ? newHis : history;
    setLibrary(finalLib);
    setHistory(finalHis);

    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      shop_data: { library: finalLib, history: finalHis },
      updated_at: new Date()
    });
    if (!error) {
      setStatus('Saved to Cloud');
      setTimeout(() => setStatus(''), 2000);
    }
  };

  // --- CALCULATION LOGIC ---
  const activePrinter = library.printers.find(p => p.id === job.selectedPrinterId) || library.printers[0];
  const unitMaterialCost = (job.materials || []).reduce((total, entry) => {
    const filament = library.filaments.find(f => f.id === entry.filamentId) || library.filaments[0];
    return total + ((filament.price / filament.grams) * (entry.grams || 0));
  }, 0);

  const unitOpCost = ((activePrinter.watts / 1000) * library.kwhRate * job.hours) + ((activePrinter.cost / activePrinter.lifespan) * job.hours);
  const unitLaborCost = library.laborRate * job.laborHours;
  const unitInternalCost = unitMaterialCost + unitOpCost + unitLaborCost + Number(job.extraCosts);
  const effectiveMultiplier = job.hourlyRateOverride > 0 ? job.hourlyRateOverride : library.shopHourlyRate;
  
  const roundToFive = (num) => Math.ceil(num / 5) * 5;
  const pricing = {
    markup: roundToFive((unitMaterialCost * job.materialMarkup) + (effectiveMultiplier * job.hours) + (unitLaborCost * 1.2) + Number(job.extraCosts)),
    margin: roundToFive(unitInternalCost / (1 - (job.desiredMargin / 100))),
    hourly: roundToFive(((effectiveMultiplier * 1.5) * job.hours) + (unitMaterialCost * 1.1) + Number(job.extraCosts))
  };

  const totalJobPrice = pricing[selectedStrategy] * job.qty;
  const totalJobProfit = totalJobPrice - (unitInternalCost * job.qty);

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
    saveToDisk({ ...library, nextQuoteNo: library.nextQuoteNo + 1 }, [newEntry, ...history]);
  };

  const TabButton = ({ id, icon: Icon, label }) => (
    <button onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-4 py-4 font-black text-[10px] tracking-widest uppercase transition-all border-b-2 ${activeTab === id ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
      <Icon size={14} /> {label}
    </button>
  );

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 font-black text-slate-300">INITIALIZING CLOUD...</div>;
  if (!session) return <AuthGate />;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">
      <header className="bg-white border-b sticky top-0 z-50 overflow-x-auto shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center min-w-[900px]">
          <div className="py-4 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white"><Layers size={20} /></div>
            <h1 className="font-black tracking-tighter text-lg uppercase leading-none">{library.shopName}</h1>
          </div>
          <nav className="flex items-center">
            <TabButton id="calculator" icon={Calculator} label="Calculator" />
            <TabButton id="history" icon={History} label="History" />
            <TabButton id="printed-inv" icon={HardDrive} label="Inventory" />
            <TabButton id="filament-inv" icon={FlaskConical} label="Materials" />
            <TabButton id="printers" icon={Printer} label="Hardware" />
            <TabButton id="settings" icon={Settings} label="Settings" />
            <button onClick={() => supabase.auth.signOut()} className="px-4 py-4 font-black text-[10px] text-red-500 hover:text-red-700 uppercase ml-4">Sign Out</button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area: Responsive Width */}
        <div className={activeTab === 'calculator' ? "lg:col-span-8" : "lg:col-span-12"}>
          {activeTab === 'calculator' && <CalculatorTab job={job} setJob={setJob} library={library} />}
          {activeTab === 'history' && <LedgerTab history={history} setJob={setJob} setActiveTab={setActiveTab} />}
          {activeTab === 'printed-inv' && <InventoryTab library={library} saveToDisk={saveToDisk} view="printed" />}
          {activeTab === 'filament-inv' && <FilamentTab library={library} saveToDisk={saveToDisk} />}
          {activeTab === 'printers' && <PrinterTab library={library} saveToDisk={saveToDisk} />}
          {activeTab === 'settings' && <SettingsTab library={library} saveToDisk={saveToDisk} history={history} />}
        </div>

        {/* Sidebar: Only visible on Calculator */}
        {activeTab === 'calculator' && (
          <div className="lg:col-span-4 animate-in slide-in-from-right duration-500">
            <div className="bg-blue-600 rounded-[3rem] p-8 text-white sticky top-28 shadow-2xl border-b-[12px] border-blue-800">
              <div className="flex justify-between items-center mb-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase opacity-60 tracking-widest">Pricing Engine</span>
                  <span className="text-[10px] font-bold opacity-40 italic">Unit Cost: ${unitInternalCost.toFixed(2)}</span>
                </div>
                {status && <div className="bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase">{status}</div>}
              </div>

              <div className="space-y-4">
                {['markup', 'margin', 'hourly'].map(id => (
                  <button key={id} onClick={() => setSelectedStrategy(id)} className={`w-full p-6 rounded-[2rem] border-2 text-left transition-all ${selectedStrategy === id ? 'bg-white text-blue-600 border-white scale-[1.05] shadow-xl' : 'bg-blue-500/40 border-blue-400'}`}>
                    <div className="text-[9px] font-black uppercase opacity-70 mb-1">{id}</div>
                    <div className="text-4xl font-black">${pricing[id]}</div>
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-blue-400/30 flex justify-between items-end">
                <div>
                  <div className="text-[10px] font-black uppercase opacity-60">Job Total ({job.qty}x)</div>
                  <div className="text-2xl font-black">${totalJobPrice.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black uppercase opacity-60">Profit</div>
                  <div className="text-lg font-bold">+${totalJobProfit.toFixed(2)}</div>
                </div>
              </div>

              <button onClick={handleSaveHistory} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-[10px] tracking-[0.2em] uppercase mt-8 hover:bg-slate-800 transition">
                LOG PRODUCTION
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PrintingApp;