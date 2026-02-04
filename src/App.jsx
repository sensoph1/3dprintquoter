import React, { useState, useEffect } from 'react';
import {
  Calculator, FlaskConical,
  Settings as SettingsIcon, History,
  Box, Menu, X
} from 'lucide-react';

import CalculatorTab from './components/CalculatorTab';
import FilamentTab from './components/FilamentTab';
import SettingsTab from './components/SettingsTab';
import QuoteHistoryTab from './components/QuoteHistoryTab';
import InventoryTab from './components/InventoryTab';
import AuthGate from './components/Auth';

import { supabase } from './supabaseClient';
import generateUniqueId from './utils/idGenerator';

const ensureNumber = (value, defaultValue = 0) => {
  const num = parseFloat(value);
  return isNaN(num) ? defaultValue : num;
};

const DEFAULT_LIBRARY = {
  shopName: "Studio OS",
  shopHourlyRate: 2.00,
  laborRate: 20.00,
  kwhRate: 0.12,
  nextQuoteNo: 1001,
  filaments: [{ id: 1, name: "Matte PLA", colorName: "Black", price: 22, grams: 1000, color: "#3b82f6" }],
  printers: [{ id: 1, name: "Bambu Lab X1C", watts: 350, cost: 0, hoursOfLife: 0 }],
  categories: ["Client Work", "Prototypes", "Personal"],
  printedParts: [],
  inventory: [],
  rounding: 1
};

const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('calculator');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = {
    calculator: { name: 'Calculator', icon: Calculator },
    quoteHistory: { name: 'Quote History', icon: History },
    filament: { name: 'Materials', icon: FlaskConical },
    inventory: { name: 'Inventory', icon: Box },
    settings: { name: 'Settings', icon: SettingsIcon },
  };

  const [library, setLibrary] = useState(() => {
    const saved = localStorage.getItem('studio_db');
    return saved ? JSON.parse(saved) : DEFAULT_LIBRARY;
  });

  const getDefaultJob = (library) => ({
    name: "",
    category: "",
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

  // Auth state and data loading
  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadFromSupabase(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadFromSupabase(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadFromSupabase = async (userId) => {
    const { data, error } = await supabase
      .from('user_data')
      .select('library, history')
      .eq('user_id', userId)
      .single();

    if (data) {
      if (data.library) {
        setLibrary(data.library);
        localStorage.setItem('studio_db', JSON.stringify(data.library));
      }
      if (data.history) {
        setHistory(data.history);
        localStorage.setItem('studio_history', JSON.stringify(data.history));
      }
    } else if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine for new users
      console.error('Error loading data:', error);
    }
  };

  const saveToSupabase = async (newLib, newHist) => {
    if (!session?.user?.id) return;

    const { error } = await supabase
      .from('user_data')
      .upsert({
        user_id: session.user.id,
        library: newLib,
        history: newHist,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error saving to cloud:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const matCost = job.materials.reduce((sum, m) => {
    const f = library.filaments.find(x => x.id === parseInt(m.filamentId)) || { price: 0, grams: 1 }; // Default filament if not found
    return sum + (ensureNumber(m.grams) * (ensureNumber(f.price) / Math.max(1, ensureNumber(f.grams))));
  }, 0);

  const selectedPrinter = library.printers.find(p => p.id === job.selectedPrinterId);
  const printer = selectedPrinter || { watts: 0, cost: 0, hoursOfLife: 1 }; // Default printer if not found, hoursOfLife defaults to 1 to prevent division by zero

  const energy = (ensureNumber(job.hours) * (ensureNumber(printer.watts) / 1000)) * ensureNumber(library.kwhRate);
  const labor = (ensureNumber(job.laborMinutes) / 60) * ensureNumber(library.laborRate);
  
  const hourlyAmortization = (ensureNumber(printer.cost) / Math.max(1, ensureNumber(printer.hoursOfLife)));
  const depreciationCost = hourlyAmortization * ensureNumber(job.hours);
  
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
    hourlyAmortization,
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
    // Sync to Supabase if logged in
    saveToSupabase(newLib, newHist);
  };

    const handleLogProduction = () => {
    const newEntry = {
      id: generateUniqueId(),
      date: new Date().toLocaleDateString(),
      quoteNo: `Q-${library.nextQuoteNo}`,
      name: job.name || "Untitled Project",
      category: job.category || "",
      unitPrice: stats.priceByProfitMargin,
      priceByProfitMargin: stats.priceByProfitMargin,
      priceByHourlyRate: stats.priceByHourlyRate,
      priceByMaterialMultiplier: stats.priceByMaterialMultiplier,
      costPerItem: stats.costPerItem,
      notes: job.notes,
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
          category: job.category || "",
          unitPrice: stats.priceByProfitMargin,
          priceByProfitMargin: stats.priceByProfitMargin,
          priceByHourlyRate: stats.priceByHourlyRate,
          priceByMaterialMultiplier: stats.priceByMaterialMultiplier,
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

  const handleAddToInventory = (item) => {
    const existingPartIndex = library.printedParts.findIndex(p => p.name.toLowerCase() === item.name.toLowerCase());
    let newPrintedParts = [...library.printedParts];

    if (existingPartIndex > -1) {
      newPrintedParts[existingPartIndex].qty += item.details.qty;
    } else {
      newPrintedParts.push({
        id: generateUniqueId(),
        name: item.name,
        category: item.category || "",
        qty: item.details.qty,
        unitPrice: item.unitPrice,
        priceByProfitMargin: item.priceByProfitMargin || item.unitPrice,
        priceByHourlyRate: item.priceByHourlyRate || 0,
        priceByMaterialMultiplier: item.priceByMaterialMultiplier || 0,
        color: 'Multi-Mat'
      });
    }
    saveToDisk({ ...library, printedParts: newPrintedParts });
    alert(`${item.details.qty} x ${item.name} added to inventory!`);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth gate if not logged in
  if (!session) {
    return <AuthGate />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 font-sans">
      <header className="max-w-[1600px] mx-auto pt-6 pb-8 px-4 sm:px-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-2.5 rounded-2xl text-white shadow-lg"><tabs.calculator.icon size={22} /></div>
          <h1 className="text-lg font-black uppercase tracking-tighter leading-none">
            {library.shopName} <br/>
            <span className="text-blue-600 text-[9px] tracking-[0.2em] font-black uppercase">Studio OS</span>
          </h1>
        </div>

        {/* Mobile hamburger button */}
        <button
          className="mobile-menu-btn p-3 bg-white rounded-2xl shadow-sm border border-slate-100"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop nav */}
        <nav className="desktop-nav bg-white p-1.5 rounded-full shadow-sm border border-slate-100 items-center">
          {Object.keys(tabs).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 sm:px-6 sm:py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
              {tabs[tab].name}
            </button>
          ))}
        </nav>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="mobile-only fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <nav
            className="absolute top-0 right-0 h-full w-72 bg-white shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-black uppercase text-sm tracking-tight">Menu</h2>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-2">
              {Object.keys(tabs).map((tab) => {
                const TabIcon = tabs[tab].icon;
                return (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-black text-sm uppercase tracking-wide transition-all ${activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <TabIcon size={20} />
                    {tabs[tab].name}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      )}

      <main className="max-w-[1600px] mx-auto px-4 sm:px-8">
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
              <div className="bg-[#1e60ff] rounded-studio p-6 sm:p-8 text-white shadow-2xl flex flex-col">
                <div className="mb-8 px-1">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Pricing Engine</h3>
                  <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Live Quote v2.4</p>
                </div>
                <div className="space-y-4 flex-grow">
                  <div className="bg-white rounded-[2rem] p-6 text-blue-600 shadow-xl border-b-4 border-blue-50">
                    <span className="text-[9px] font-black uppercase tracking-widest block mb-2 opacity-40">Profit Margin ({job.profitMargin}%)</span>
                    <h2 className="text-2xl sm:text-3xl font-black tabular-nums tracking-tighter">${stats.priceByProfitMargin.toFixed(2)}</h2>
                  </div>
                  <div className="bg-white/10 border border-white/20 rounded-[2rem] p-6">
                    <span className="text-[9px] font-black uppercase tracking-widest block mb-1 opacity-40">Hourly Rate (${job.overrideShopHourlyRate}/hr)</span>
                    <h2 className="text-2xl sm:text-3xl font-black tabular-nums">${stats.priceByHourlyRate.toFixed(2)}</h2>
                  </div>
                  <div className="bg-white/10 border border-white/20 rounded-[2rem] p-6">
                    <span className="text-[9px] font-black uppercase tracking-widest block mb-1 opacity-40">Material Cost (x{job.materialCostMultiplier})</span>
                    <h2 className="text-2xl sm:text-3xl font-black tabular-nums">${stats.priceByMaterialMultiplier.toFixed(2)}</h2>
                  </div>
                </div>
                <div className="mt-10 mb-8 border-t border-white/10 pt-8 px-1">
                  <div className="text-right">
                    <span className="text-[9px] font-black opacity-50 block mb-1">Cost Per Item</span>
                    <h3 className="text-lg sm:text-xl font-black text-blue-200">${stats.costPerItem.toFixed(2)}</h3>
                  </div>
                </div>
                {editingJobId ? (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={handleUpdateJob} className="w-full py-4 sm:py-5 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl transition-all">
                      Save Changes
                    </button>
                    <button onClick={handleCancelEdit} className="w-full py-4 sm:py-5 bg-slate-600 hover:bg-slate-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl transition-all">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={handleLogProduction} className="w-full py-4 sm:py-5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl transition-all">
                    Log Production
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto bg-white rounded-studio border border-slate-100 shadow-sm p-4 sm:p-6">
             {activeTab === 'filament' && <FilamentTab library={library} saveToDisk={saveToDisk} />}
             {activeTab === 'inventory' && <InventoryTab library={library} saveToDisk={saveToDisk} />}
             {activeTab === 'quoteHistory' && <QuoteHistoryTab history={history} saveToDisk={saveToDisk} library={library} handleJobLoad={handleJobLoad} handleAddToInventory={handleAddToInventory} />}
             {activeTab === 'settings' && <SettingsTab library={library} saveToDisk={saveToDisk} history={history} onLogout={handleLogout} userEmail={session?.user?.email} />}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;