import React, { useState } from 'react';
import { 
  History, Search, Printer, Layers, 
  Calendar, DollarSign, ExternalLink, Trash2 
} from 'lucide-react';

const LedgerTab = ({ history, saveToDisk, library }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHistory = history.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.quoteNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    if (window.confirm("Delete this record from history? This won't refund material stock.")) {
      const updatedHistory = history.filter(item => item.id !== id);
      saveToDisk(library, updatedHistory);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
        
        {/* HEADER & SEARCH */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-3">
              <History className="text-blue-600" size={28} /> Production Log
            </h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Archived quotes & technical specs</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search quotes or parts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs"
            />
          </div>
        </div>

        <hr className="border-slate-50" />

        {/* LOG ENTRIES */}
        <div className="space-y-4">
          {filteredHistory.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No matching records found</p>
            </div>
          ) : (
            filteredHistory.map((entry) => (
              <div key={entry.id} className="group bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 p-6 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                
                {/* LEFT: IDENTITY */}
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-slate-800 shadow-sm">
                    <span className="text-[8px] font-black uppercase text-blue-600">ID</span>
                    <span className="font-black text-sm">{entry.quoteNo.split('-')[1]}</span>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 uppercase text-sm leading-tight group-hover:text-blue-600 transition-colors">
                      {entry.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                        <Calendar size={10} /> {entry.date}
                      </p>
                      <span className="w-1 h-1 bg-slate-200 rounded-full" />
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                        <Layers size={10} /> {entry.details?.qty || 1} Units
                      </p>
                    </div>
                  </div>
                </div>

                {/* MIDDLE: TECH SPECS (The "Slicer" data) */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 py-2 px-6 border-l border-slate-200 hidden lg:grid">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-300 uppercase">Infill</span>
                    <span className="text-[10px] font-black text-slate-600">{entry.details?.infill || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-300 uppercase">Layer</span>
                    <span className="text-[10px] font-black text-slate-600">{entry.details?.layerHeight || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-300 uppercase">Supports</span>
                    <span className="text-[10px] font-black text-slate-600 uppercase">{entry.details?.supports || 'None'}</span>
                  </div>
                </div>

                {/* RIGHT: PRICING & ACTIONS */}
                <div className="flex items-center gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                  <div className="flex flex-col md:items-end flex-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Quote Total</span>
                    <span className="text-xl font-black text-slate-900">${entry.unitPrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleDelete(entry.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 size={18} />
                    </button>
                    <button className="p-3 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-slate-200">
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LedgerTab;