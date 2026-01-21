import React from 'react';
import { Store, DollarSign, Zap, User, Clock } from 'lucide-react';

const SettingsTab = ({ library, saveToDisk }) => {
  const updateGlobal = (field, value) => {
    saveToDisk({ ...library, [field]: value });
  };

  return (
    <div className="bg-white rounded-[2rem] border p-8 shadow-sm animate-in fade-in duration-300 space-y-8">
      <h2 className="font-black text-xl uppercase tracking-tighter text-slate-800">Shop Configuration</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><Store size={14}/> Shop Name</label>
          <input className="w-full text-lg font-black p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-blue-500" value={library.shopName} onChange={(e) => updateGlobal('shopName', e.target.value.toUpperCase())}/>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><User size={14}/> Base Labor Rate ($/hr)</label>
          <input type="number" className="w-full text-lg font-black p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-blue-500" value={library.laborRate} onChange={(e) => updateGlobal('laborRate', parseFloat(e.target.value))}/>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><Clock size={14}/> Per Print Hour Multiplier ($)</label>
          <input type="number" className="w-full text-lg font-black p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-blue-500" value={library.shopHourlyRate} onChange={(e) => updateGlobal('shopHourlyRate', parseFloat(e.target.value))}/>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><Zap size={14}/> Electricity Rate ($/kWh)</label>
          <input type="number" step="0.01" className="w-full text-lg font-black p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-blue-500" value={library.kwhRate} onChange={(e) => updateGlobal('kwhRate', parseFloat(e.target.value))}/>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;