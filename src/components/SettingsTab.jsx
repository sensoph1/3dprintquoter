import React from 'react';
import { Settings, DollarSign, Database, Home, Percent, Zap } from 'lucide-react';

const SettingsTab = ({ library, saveToDisk, history }) => {
  
  const updateSetting = (key, value) => {
    saveToDisk({ ...library, [key]: value });
  };

  const InputBlock = ({ label, icon: Icon, type = "text", value, onChange, prefix }) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
        {Icon && <Icon size={12} />} {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
            {prefix}
          </span>
        )}
        <input 
          type={type} 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${prefix ? 'pl-10' : 'px-6'} py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm`}
        />
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-12">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-3">
              <Settings className="text-blue-600" size={28} /> Studio Settings
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Configure your global rates and studio identity</p>
          </div>
        </div>

        {/* SECTION 1: STUDIO IDENTITY */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
            <Home size={12} /> Branding
          </div>
          <InputBlock 
            label="Studio Name" 
            value={library.shopName} 
            onChange={(val) => updateSetting('shopName', val)} 
          />
        </div>

        <hr className="border-slate-50" />

        {/* SECTION 2: GLOBAL RATES */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
            <DollarSign size={12} /> Financial Rates
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputBlock 
              label="Shop Hourly Rate" 
              prefix="$" 
              type="number" 
              value={library.shopHourlyRate} 
              onChange={(val) => updateSetting('shopHourlyRate', parseFloat(val))} 
            />
            <InputBlock 
              label="Labor Rate (Your Pay)" 
              prefix="$" 
              type="number" 
              value={library.laborRate} 
              onChange={(val) => updateSetting('laborRate', parseFloat(val))} 
            />
            <InputBlock 
              label="Electricity Cost" 
              prefix="$" 
              type="number" 
              value={library.kwhRate} 
              onChange={(val) => updateSetting('kwhRate', parseFloat(val))} 
            />
          </div>
        </div>

        <hr className="border-slate-50" />

        {/* SECTION 3: SYSTEM STATS */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
            <Database size={12} /> Database Info
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-center">
              <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Total Quotes</span>
              <span className="text-2xl font-black text-slate-800">{history.length}</span>
            </div>
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-center">
              <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Materials</span>
              <span className="text-2xl font-black text-slate-800">{library.filaments.length}</span>
            </div>
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-center">
              <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Hardware</span>
              <span className="text-2xl font-black text-slate-800">{library.printers.length}</span>
            </div>
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-center">
              <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Next Quote</span>
              <span className="text-2xl font-black text-slate-800">#{library.nextQuoteNo}</span>
            </div>
          </div>
        </div>

        {/* FOOTER ACTION */}
        <div className="pt-6">
          <button 
            onClick={() => window.print()}
            className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] tracking-[0.2em] uppercase hover:bg-slate-800 transition shadow-xl"
          >
            Export Shop Data Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;