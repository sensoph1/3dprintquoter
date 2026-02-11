import React, { useState, useEffect } from 'react';
import {
  Calculator, FlaskConical,
  Settings as SettingsIcon, History,
  Box, Menu, X, Calendar, Inbox, ShoppingCart, User,
  LogOut, CreditCard, Sparkles
} from 'lucide-react';

import CalculatorTab from './components/CalculatorTab';
import FilamentTab from './components/FilamentTab';
import SettingsTab from './components/SettingsTab';
import QuoteHistoryTab from './components/QuoteHistoryTab';
import InventoryTab from './components/InventoryTab';
import EventsTab from './components/EventsTab';
import SalesTab from './components/SalesTab';
import RequestsTab from './components/RequestsTab';
import QuoteRequestForm from './components/QuoteRequestForm';
import AuthGate from './components/Auth';
import LandingPage from './components/LandingPage';
import UpgradePrompt from './components/UpgradePrompt';
import SignupPrompt from './components/SignupPrompt';
import FreshStartPrompt from './components/FreshStartPrompt';

import { supabase } from './supabaseClient';
import generateUniqueId from './utils/idGenerator';

const ensureNumber = (value, defaultValue = 0) => {
  const num = parseFloat(value);
  return isNaN(num) ? defaultValue : num;
};

const DEFAULT_LIBRARY = {
  shopName: "My Studio",
  shopHourlyRate: 2.00,
  laborRate: 20.00,
  kwhRate: 0.12,
  nextQuoteNo: 1004,
  filaments: [
    { id: 1, name: "Matte PLA", colorName: "Black", price: 22, grams: 1000, color: "#1e293b" },
    { id: 2, name: "PETG", colorName: "White", price: 28, grams: 1000, color: "#f8fafc" },
    { id: 3, name: "Silk PLA", colorName: "Gold", price: 32, grams: 1000, color: "#eab308" }
  ],
  printers: [
    { id: 1, name: "Bambu Lab X1C", watts: 350, cost: 1449, hoursOfLife: 5000 },
    { id: 2, name: "Prusa MK4", watts: 150, cost: 799, hoursOfLife: 8000 }
  ],
  categories: ["Client Work", "Prototypes", "Personal"],
  printedParts: [
    { id: 101, name: "Phone Stand", category: "Client Work", qty: 5, unitPrice: 12.50, priceByProfitMargin: 12.50, priceByHourlyRate: 8.00, priceByMaterialMultiplier: 6.40, color: "Black" },
    { id: 102, name: "Cable Organizer", category: "Personal", qty: 12, unitPrice: 4.00, priceByProfitMargin: 4.00, priceByHourlyRate: 3.50, priceByMaterialMultiplier: 2.80, color: "White" },
    { id: 103, name: "Desk Nameplate", category: "Client Work", qty: 3, unitPrice: 18.00, priceByProfitMargin: 18.00, priceByHourlyRate: 15.00, priceByMaterialMultiplier: 9.60, color: "Gold" }
  ],
  inventory: [
    { id: 201, name: "6mm Magnets (100pk)", qty: 87, unitCost: 0.08, lowStockThreshold: 20 },
    { id: 202, name: "Small Shipping Boxes", qty: 24, unitCost: 0.95, lowStockThreshold: 10 },
    { id: 203, name: "Bubble Wrap Roll", qty: 3, unitCost: 12.00, lowStockThreshold: 2 }
  ],
  subscriptions: [
    { id: 301, name: "Thangs Pro", monthlyCost: 9.99, cycle: "monthly" },
    { id: 302, name: "Adobe Creative Cloud", monthlyCost: 59.99, cycle: "monthly" },
    { id: 303, name: "Cloud Backup", monthlyCost: 99.99, cycle: "yearly" }
  ],
  events: [
    { id: 401, name: "Downtown Craft Fair", date: "2025-01-18", location: "City Convention Center", boothFee: 150, otherCosts: 45, notes: "Corner booth near entrance" },
    { id: 402, name: "Maker Market", date: "2025-01-25", location: "Community Center", boothFee: 75, otherCosts: 20, notes: "Shared table with friend" },
    { id: 403, name: "Holiday Pop-Up Shop", date: "2024-12-14", location: "Main Street Plaza", boothFee: 200, otherCosts: 60, notes: "Great foot traffic" },
    { id: 404, name: "Tech Meetup Vendor Fair", date: "2024-11-20", location: "Innovation Hub", boothFee: 50, otherCosts: 15, notes: "Mostly prototypes shown" },
    { id: 405, name: "Spring Artisan Market", date: "2026-03-15", location: "Riverside Park", boothFee: 125, otherCosts: 30, notes: "Outdoor event - bring tent" },
    { id: 406, name: "Local Flea Market", date: "2026-02-22", location: "Fairgrounds", boothFee: 40, otherCosts: 10, notes: "Monthly recurring event" }
  ],
  sales: [],
  rounding: 1
};

const DEFAULT_HISTORY = [
  {
    id: 1001,
    date: "1/18/2025",
    quoteNo: "Q-1001",
    name: "Custom Phone Stand",
    category: "Client Work",
    unitPrice: 12.50,
    priceByProfitMargin: 12.50,
    priceByHourlyRate: 8.00,
    priceByMaterialMultiplier: 6.40,
    costPerItem: 3.20,
    notes: "Sold at craft fair",
    status: "sold",
    eventId: 401,
    details: { name: "Custom Phone Stand", category: "Client Work", qty: 5, hours: 2.5, laborMinutes: 15, extraCosts: 0, materials: [{ filamentId: 1, grams: 45 }], selectedPrinterId: 1, profitMargin: 20 }
  },
  {
    id: 1002,
    date: "1/18/2025",
    quoteNo: "Q-1002",
    name: "Desk Organizer Set",
    category: "Prototypes",
    unitPrice: 24.00,
    priceByProfitMargin: 24.00,
    priceByHourlyRate: 18.00,
    priceByMaterialMultiplier: 14.40,
    costPerItem: 7.20,
    notes: "Popular item at fair",
    status: "sold",
    eventId: 401,
    details: { name: "Desk Organizer Set", category: "Prototypes", qty: 2, hours: 4, laborMinutes: 30, extraCosts: 0, materials: [{ filamentId: 2, grams: 120 }], selectedPrinterId: 1, profitMargin: 20 }
  },
  {
    id: 1003,
    date: "1/25/2025",
    quoteNo: "Q-1003",
    name: "Trophy Base",
    category: "Client Work",
    unitPrice: 18.00,
    priceByProfitMargin: 18.00,
    priceByHourlyRate: 15.00,
    priceByMaterialMultiplier: 9.60,
    costPerItem: 4.80,
    notes: "Sold at maker market",
    status: "sold",
    eventId: 402,
    details: { name: "Trophy Base", category: "Client Work", qty: 3, hours: 3, laborMinutes: 20, extraCosts: 0, materials: [{ filamentId: 3, grams: 85 }], selectedPrinterId: 2, profitMargin: 20 }
  },
  {
    id: 1004,
    date: "12/14/2024",
    quoteNo: "Q-1004",
    name: "Holiday Ornament Set",
    category: "Personal",
    unitPrice: 8.00,
    priceByProfitMargin: 8.00,
    priceByHourlyRate: 6.00,
    priceByMaterialMultiplier: 4.80,
    costPerItem: 2.40,
    notes: "Best seller at holiday pop-up",
    status: "sold",
    eventId: 403,
    details: { name: "Holiday Ornament Set", category: "Personal", qty: 15, hours: 1.5, laborMinutes: 10, extraCosts: 0, materials: [{ filamentId: 3, grams: 25 }], selectedPrinterId: 1, profitMargin: 20 }
  },
  {
    id: 1005,
    date: "12/14/2024",
    quoteNo: "Q-1005",
    name: "Gift Box Inserts",
    category: "Client Work",
    unitPrice: 5.00,
    priceByProfitMargin: 5.00,
    priceByHourlyRate: 4.00,
    priceByMaterialMultiplier: 3.00,
    costPerItem: 1.50,
    notes: "Custom order from holiday event",
    status: "sold",
    eventId: 403,
    details: { name: "Gift Box Inserts", category: "Client Work", qty: 20, hours: 2, laborMinutes: 5, extraCosts: 0, materials: [{ filamentId: 2, grams: 15 }], selectedPrinterId: 2, profitMargin: 20 }
  }
];

// Subscription tier limits
const TIER_LIMITS = {
  free: { maxHistory: 10, maxEvents: 1, squareSync: false },
  pro: { maxHistory: Infinity, maxEvents: Infinity, squareSync: true },
};

const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('calculator');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  // Subscription tier (Supabase for logged-in users, localStorage fallback for guests)
  const [userTier, setUserTier] = useState(() => {
    return localStorage.getItem('user_tier') || 'free';
  });

  const tierLimits = TIER_LIMITS[userTier];

  const loadUserTier = async (userId) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('tier')
      .eq('id', userId)
      .single();

    if (data?.tier) {
      setUserTier(data.tier);
      localStorage.setItem('user_tier', data.tier);
    } else if (error?.code === 'PGRST116') {
      // No profile yet - create one (trigger should handle this, but just in case)
      await supabase.from('user_profiles').insert({ id: userId, tier: 'free' });
      setUserTier('free');
    }
  };

  // Check for public quote request form URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const requestUserId = urlParams.get('request');

  // Check for Stripe checkout success
  const checkoutSuccess = urlParams.get('success');
  const checkoutCanceled = urlParams.get('canceled');

  const [library, setLibrary] = useState(() => {
    const saved = localStorage.getItem('studio_db');
    return saved ? JSON.parse(saved) : DEFAULT_LIBRARY;
  });

  const lowStockCount = [
    ...(library.printedParts || []).filter(p => p.qty <= (p.lowStockThreshold ?? 3)),
    ...(library.inventory || []).filter(i => i.qty < (i.lowStockThreshold || 10)),
  ].length;

  const tabs = {
    calculator: { name: 'Calculator', icon: Calculator },
    quoteHistory: { name: 'Estimates', icon: History },
    events: { name: 'Events', icon: Calendar },
    sales: { name: 'Sales', icon: ShoppingCart },
    requests: { name: 'Requests', icon: Inbox },
    filament: { name: 'Costs', icon: FlaskConical },
    inventory: { name: 'Inventory', icon: Box, badge: lowStockCount || null },
    settings: { name: 'Settings', icon: SettingsIcon },
  };

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
    rounding: ensureNumber(library.rounding, 1),
    requestId: null,
    landedPrice: null
  });

  const [job, setJob] = useState(() => getDefaultJob(library));

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('studio_history');
    return saved ? JSON.parse(saved) : DEFAULT_HISTORY;
  });
  const [editingJobId, setEditingJobId] = useState(null);
  const [reEvaluatePartId, setReEvaluatePartId] = useState(null);
  const [requests, setRequests] = useState([]);
  const [toast, setToast] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const [showFreshStartPrompt, setShowFreshStartPrompt] = useState(false);
  const [upgradePrompt, setUpgradePrompt] = useState(null); // null | 'history' | 'events' | 'square'
  const [signupPrompt, setSignupPrompt] = useState(null); // null | 'save' | 'sync'

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Load quote requests from Supabase
  const loadRequests = async (uid) => {
    if (!uid) {
      setRequests([]);
      return;
    }
    const { data, error } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRequests(data);
    }
  };

  // Auth state and data loading
  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadFromSupabase(session.user.id);
        loadUserTier(session.user.id);
        loadRequests(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadFromSupabase(session.user.id);
        loadUserTier(session.user.id);
        loadRequests(session.user.id);
      } else {
        setRequests([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle Stripe checkout return
  useEffect(() => {
    if (checkoutSuccess && session?.user?.id) {
      // Reload tier after successful checkout
      loadUserTier(session.user.id);
      showToast('Welcome to Pro! Your subscription is active.');
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (checkoutCanceled) {
      showToast('Checkout canceled');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [checkoutSuccess, checkoutCanceled, session]);

  const loadFromSupabase = async (userId) => {
    const { data, error } = await supabase
      .from('user_data')
      .select('library, history')
      .eq('user_id', userId)
      .single();

    if (data) {
      // Existing user - load their data
      if (data.library) {
        setLibrary(data.library);
        localStorage.setItem('studio_db', JSON.stringify(data.library));
      }
      if (data.history) {
        setHistory(data.history);
        localStorage.setItem('studio_history', JSON.stringify(data.history));
      }
    } else if (error && error.code === 'PGRST116') {
      // New user - no data yet, show fresh start prompt
      setShowFreshStartPrompt(true);
    } else if (error) {
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
  const unroundedPriceByMaterialMultiplier = (matCost * ensureNumber(job.materialCostMultiplier)) / qty;
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

    const handleLogProduction = async () => {
    // Check if guest mode - prompt to sign up
    if (guestMode) {
      setSignupPrompt('save');
      return;
    }

    // Check tier limit for saved quotes
    if (history.length >= tierLimits.maxHistory) {
      setUpgradePrompt('history');
      return;
    }

    const finalPrice = job.landedPrice ?? stats.priceByProfitMargin;
    const newEntry = {
      id: generateUniqueId(),
      date: new Date().toLocaleDateString(),
      quoteNo: `Q-${library.nextQuoteNo}`,
      name: job.name || "Untitled Project",
      category: job.category || "",
      unitPrice: finalPrice,
      landedPrice: finalPrice,
      priceByProfitMargin: stats.priceByProfitMargin,
      priceByHourlyRate: stats.priceByHourlyRate,
      priceByMaterialMultiplier: stats.priceByMaterialMultiplier,
      costPerItem: stats.costPerItem,
      notes: job.notes,
      requestId: job.requestId || null,
      status: job.requestId ? 'quoted' : 'draft',
      details: { ...job }
    };

    let updatedLibrary = { ...library, nextQuoteNo: library.nextQuoteNo + 1 };

    // If this was a re-evaluation from inventory, prompt to update inventory price
    if (reEvaluatePartId) {
      const part = library.printedParts.find(p => p.id === reEvaluatePartId);
      if (part && window.confirm(`Update inventory price for "${part.name}" to $${finalPrice.toFixed(2)}?`)) {
        updatedLibrary = {
          ...updatedLibrary,
          printedParts: library.printedParts.map(p =>
            p.id === reEvaluatePartId ? { ...p, sellingPrice: finalPrice } : p
          )
        };
      }
      setReEvaluatePartId(null);
    }

    saveToDisk(updatedLibrary, [newEntry, ...history]);

    // Update request status to "quoted" if linked to a request
    if (job.requestId) {
      await supabase
        .from('quote_requests')
        .update({ status: 'quoted' })
        .eq('id', job.requestId);
      loadRequests(session?.user?.id); // Refresh requests list
    }

    showToast("Estimate saved!");
  };

  const handleUpdateJob = () => {
    const finalPrice = job.landedPrice ?? stats.priceByProfitMargin;
    const newHistory = history.map(item => {
      if (item.id === editingJobId) {
        return {
          ...item,
          name: job.name,
          category: job.category || "",
          unitPrice: finalPrice,
          landedPrice: finalPrice,
          priceByProfitMargin: stats.priceByProfitMargin,
          priceByHourlyRate: stats.priceByHourlyRate,
          priceByMaterialMultiplier: stats.priceByMaterialMultiplier,
          costPerItem: stats.costPerItem,
          notes: job.notes,
          requestId: job.requestId || null,
          details: { ...job }
        };
      }
      return item;
    });
    saveToDisk(library, newHistory);
    setEditingJobId(null);
    setJob(getDefaultJob(library));
    showToast("Job updated!");
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
        sellingPrice: item.unitPrice,
        estimateId: item.id,
        details: item.details,
        costPerItem: item.costPerItem || 0
      });
    }
    saveToDisk({ ...library, printedParts: newPrintedParts });
    showToast(`${item.details.qty} x ${item.name} added to inventory`);
  };

  const handleReEvaluate = (part) => {
    if (part.details) {
      setJob(part.details);
      setReEvaluatePartId(part.id);
      setActiveTab('calculator');
    } else {
      showToast("No original job data available for this item");
    }
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

  // Show public quote request form if URL parameter is present
  if (requestUserId) {
    return <QuoteRequestForm userId={requestUserId} shopName={library.shopName} />;
  }

  if (!session && !guestMode) {
    if (showAuth) {
      return <AuthGate onBack={() => setShowAuth(false)} />;
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} onTryDemo={() => {
      // Load sample data for demo
      setLibrary(DEFAULT_LIBRARY);
      setHistory(DEFAULT_HISTORY);
      setGuestMode(true);
    }} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 font-sans">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-xl font-bold text-sm animate-in fade-in slide-in-from-top-2 duration-300">
          {toast}
        </div>
      )}

      {/* Upgrade prompt modal */}
      {upgradePrompt && (
        <UpgradePrompt
          feature={upgradePrompt}
          onClose={() => setUpgradePrompt(null)}
          session={session}
        />
      )}

      {/* Signup prompt modal (for guest users) */}
      {signupPrompt && (
        <SignupPrompt
          feature={signupPrompt}
          onClose={() => setSignupPrompt(null)}
          onSignup={() => {
            setSignupPrompt(null);
            setGuestMode(false);
            setShowAuth(true);
          }}
        />
      )}

      {/* Fresh start prompt (for new users from guest mode) */}
      {showFreshStartPrompt && (
        <FreshStartPrompt
          onFreshStart={() => {
            // Clear to empty state
            const freshLibrary = {
              ...DEFAULT_LIBRARY,
              shopName: library.shopName, // Keep their shop name if they set one
              printedParts: [],
              inventory: [],
              events: [],
              sales: [],
            };
            const freshHistory = [];
            setLibrary(freshLibrary);
            setHistory(freshHistory);
            saveToDisk(freshLibrary, freshHistory);
            setShowFreshStartPrompt(false);
            showToast("You're all set! Start creating estimates.");
          }}
          onKeepSamples={() => {
            // Keep current sample data and save to cloud
            saveToDisk(library, history);
            setShowFreshStartPrompt(false);
            showToast("Sample data saved. Explore away!");
          }}
        />
      )}
      {/* Guest mode banner */}
      {guestMode && (
        <div className="bg-blue-600 text-white py-2 px-4 text-center text-sm">
          <span className="font-medium">You're in demo mode.</span>
          {' '}
          <button
            onClick={() => { setGuestMode(false); setShowAuth(true); }}
            className="font-bold underline hover:no-underline"
          >
            Create a free account
          </button>
          {' '}to save your work.
        </div>
      )}
      <header className="max-w-[1600px] mx-auto pt-6 pb-8 px-4 sm:px-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-2.5 rounded-2xl text-white shadow-lg"><tabs.calculator.icon size={22} /></div>
          <h1 className="text-xl font-black tracking-tight">
            PrintPrice Pro
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
            <button key={tab} onClick={() => setActiveTab(tab)} className={`relative px-4 py-2 sm:px-6 sm:py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
              {tabs[tab].name}
              {tabs[tab].badge && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">{tabs[tab].badge}</span>
              )}
            </button>
          ))}
          {session && (
            <>
              <div className="w-px h-6 bg-slate-200 mx-2" />
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all ${accountMenuOpen ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                >
                  <User size={14} />
                </button>
                {accountMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAccountMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 space-y-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signed in as</p>
                        <p className="font-bold text-slate-800 truncate">{session.user?.email}</p>
                      </div>
                      <div className="border-t border-slate-100 pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</p>
                            <p className="font-bold text-slate-800 capitalize flex items-center gap-1">
                              {userTier === 'pro' && <Sparkles size={12} className="text-blue-600" />}
                              {userTier}
                            </p>
                          </div>
                          {userTier === 'pro' ? (
                            <button
                              onClick={async () => {
                                try {
                                  const { data } = await supabase.functions.invoke('stripe-portal', {
                                    body: { userId: session.user?.id, returnUrl: window.location.origin },
                                  });
                                  if (data?.url) window.location.href = data.url;
                                } catch (err) {
                                  console.error('Portal error:', err);
                                }
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                            >
                              <CreditCard size={12} /> Billing
                            </button>
                          ) : (
                            <button
                              onClick={() => { setAccountMenuOpen(false); setUpgradePrompt('account'); }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"
                            >
                              <Sparkles size={12} /> Upgrade
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="border-t border-slate-100 pt-4">
                        <button
                          onClick={() => { handleLogout(); setAccountMenuOpen(false); }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
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
                    {tabs[tab].badge && (
                      <span className="ml-auto bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">{tabs[tab].badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
            {session && (
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                <div className="px-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signed in as</p>
                  <p className="font-bold text-slate-800 truncate">{session.user?.email}</p>
                </div>
                <div className="px-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</p>
                    <p className="font-bold text-slate-800 capitalize flex items-center gap-1">
                      {userTier === 'pro' && <Sparkles size={12} className="text-blue-600" />}
                      {userTier}
                    </p>
                  </div>
                  {userTier === 'pro' ? (
                    <button
                      onClick={async () => {
                        try {
                          const { data } = await supabase.functions.invoke('stripe-portal', {
                            body: { userId: session.user?.id, returnUrl: window.location.origin },
                          });
                          if (data?.url) window.location.href = data.url;
                        } catch (err) {
                          console.error('Portal error:', err);
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                    >
                      <CreditCard size={12} /> Billing
                    </button>
                  ) : (
                    <button
                      onClick={() => { setMobileMenuOpen(false); setUpgradePrompt('account'); }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"
                    >
                      <Sparkles size={12} /> Upgrade
                    </button>
                  )}
                </div>
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </nav>
        </div>
      )}

      <main className="max-w-[1600px] mx-auto px-4 sm:px-8">
        {activeTab === 'calculator' ? (
          <div className="studio-cockpit max-w-6xl mx-auto">
            <div className="left-workbench bg-white rounded-studio border border-slate-100 shadow-sm">
              <CalculatorTab
                job={job}
                setJob={setJob}
                library={library}
                stats={stats}
                requests={requests}
              />
            </div>
            <div className="right-engine">
              <div className="bg-[#1e60ff] rounded-studio p-6 sm:p-8 text-white shadow-2xl flex flex-col">
                <div className="mb-8 px-1 flex justify-between items-start">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Pricing Engine</h3>
                    <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Live Quote v2.4</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black opacity-50 block mb-1">Cost Per Item</span>
                    <h3 className="text-lg sm:text-xl font-black text-blue-200">${stats.costPerItem.toFixed(2)}</h3>
                  </div>
                </div>
                <div className="space-y-4 flex-grow">
                  <div
                    onClick={() => setJob({ ...job, landedPrice: stats.priceByProfitMargin })}
                    className="bg-white/10 border border-white/20 rounded-[2rem] p-6 cursor-pointer hover:bg-white/20 transition-all"
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest block mb-1 opacity-40">Profit Margin ({job.profitMargin}%)</span>
                    <h2 className="text-2xl sm:text-3xl font-black tabular-nums">${stats.priceByProfitMargin.toFixed(2)}</h2>
                  </div>
                  <div
                    onClick={() => setJob({ ...job, landedPrice: stats.priceByHourlyRate })}
                    className="bg-white/10 border border-white/20 rounded-[2rem] p-6 cursor-pointer hover:bg-white/20 transition-all"
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest block mb-1 opacity-40">Hourly Rate (${job.overrideShopHourlyRate}/hr)</span>
                    <h2 className="text-2xl sm:text-3xl font-black tabular-nums">${stats.priceByHourlyRate.toFixed(2)}</h2>
                  </div>
                  <div
                    onClick={() => setJob({ ...job, landedPrice: stats.priceByMaterialMultiplier })}
                    className="bg-white/10 border border-white/20 rounded-[2rem] p-6 cursor-pointer hover:bg-white/20 transition-all"
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest block mb-1 opacity-40">Material Cost (x{job.materialCostMultiplier})</span>
                    <h2 className="text-2xl sm:text-3xl font-black tabular-nums">${stats.priceByMaterialMultiplier.toFixed(2)}</h2>
                  </div>
                  <div className="bg-white rounded-[2rem] p-6">
                    <span className="text-[9px] font-black uppercase tracking-widest block mb-1 text-blue-400">Landed Price</span>
                    <div className="flex items-baseline text-blue-600">
                      <span className="text-2xl sm:text-3xl font-black">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={job.landedPrice ?? ''}
                        onChange={(e) => setJob({ ...job, landedPrice: e.target.value === '' ? null : parseFloat(e.target.value) })}
                        placeholder={stats.priceByProfitMargin.toFixed(2)}
                        className="landed-price-input font-black tabular-nums text-blue-600 placeholder:text-blue-300"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-8"></div>
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
                    Save Estimate
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto bg-white rounded-studio border border-slate-100 shadow-sm p-4 sm:p-6">
             {activeTab === 'events' && <EventsTab library={library} history={history} saveToDisk={saveToDisk} tierLimits={tierLimits} onUpgradeClick={() => setUpgradePrompt('events')} />}
             {activeTab === 'sales' && <SalesTab library={library} saveToDisk={saveToDisk} />}
             {activeTab === 'requests' && <RequestsTab session={session} history={history} />}
             {activeTab === 'filament' && <FilamentTab library={library} saveToDisk={saveToDisk} />}
             {activeTab === 'inventory' && <InventoryTab library={library} saveToDisk={saveToDisk} handleReEvaluate={handleReEvaluate} />}
             {activeTab === 'quoteHistory' && <QuoteHistoryTab history={history} saveToDisk={saveToDisk} library={library} handleJobLoad={handleJobLoad} handleAddToInventory={handleAddToInventory} requests={requests} />}
             {activeTab === 'settings' && <SettingsTab library={library} saveToDisk={saveToDisk} history={history} session={session} tierLimits={tierLimits} onUpgradeClick={() => setUpgradePrompt('square')} />}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;