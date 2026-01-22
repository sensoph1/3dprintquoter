import React, { useState } from 'react';
import { Save, Cloud, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';

const SettingsTab = ({ library, saveToDisk, history }) => {
  const [formData, setFormData] = useState({
    shopName: library.shopName || "PRO PRINT STUDIO",
    kwhRate: library.kwhRate || 0.14,
    laborRate: library.laborRate || 25,
    shopHourlyRate: library.shopHourlyRate || 15.00
  });

  const [syncStatus, setSyncStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'shopName' ? value : parseFloat(value) || 0
    }));
  };

  const handleUpdateSettings = async () => {
    setSyncStatus('Saving...');
    const updatedLibrary = {
      ...library,
      ...formData
    };
    
    // This calls the saveToDisk function in App.jsx
    await saveToDisk(updatedLibrary);
    setSyncStatus('Settings Saved!');
    setTimeout(() => setSyncStatus(''), 3000);
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure? This will delete all logged production history from the cloud.")) {
      saveToDisk(library, []); // Send empty array for history
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">Shop Settings</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Configure your rates and cloud sync</p>
          </div>
          <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
            syncStatus.includes('Saved') ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'
          }`}>
            {syncStatus || 'Cloud Active'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SHOP NAME */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Studio Name</label>
            <input 
              type="text"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
            />
          </div>

          {/* ELECTRICITY RATE */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Electricity ($/kWh)</label>
            <input 
              type="number"
              name="kwhRate"
              step="0.01"
              value={formData.kwhRate}
              onChange={handleChange}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
            />
          </div>

          {/* LABOR RATE */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Labor Rate ($/hr)</label>
            <input 
              type="number"
              name="laborRate"
              value={formData.laborRate}
              onChange={handleChange}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
            />
          </div>

          {/* SHOP OVERHEAD */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Shop Overhead ($/hr)</label>
            <input 
              type="number"
              name="shopHourlyRate"
              value={formData.shopHourlyRate}
              onChange={handleChange}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
            />
          </div>
        </div>

        <button 
          onClick={handleUpdateSettings}
          className="mt-8 w-full md:w-auto px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-100"
        >
          <Cloud size={16} /> Save to Cloud
        </button>
      </div>

      {/* DATA MANAGEMENT SECTION */}
      <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="text-amber-400" size={20} />
          <h3 className="font-black uppercase tracking-tight">Danger Zone</h3>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-6 border border-slate-800 rounded-3xl bg-slate-800/50">
          <div>
            <h4 className="font-bold text-sm">Clear Production Ledger</h4>
            <p className="text-slate-400 text-xs mt-1">Permanently remove all {history.length} logged items from the database.</p>
          </div>
          <button 
            onClick={handleClearHistory}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
          >
            <Trash2 size={14} /> Purge History
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center">
          <p className="text-slate-500 text-[9px] uppercase font-black tracking-[0.3em]">
            Sync ID: {library.nextQuoteNo || 'NO_SESSION'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;