import React from 'react';
import { ChevronRight } from 'lucide-react';

// 1. The name HERE...
const LedgerTab = ({ history, setJob, setActiveTab }) => {
  return (
    <div className="bg-white rounded-[2rem] border p-8 shadow-sm">
      <h2 className="font-black text-lg mb-6 uppercase">Production Ledger</h2>
      <div className="space-y-3">
        {history.map(item => (
          <div key={item.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border">
            <div>
              <div className="text-[10px] font-bold text-slate-400 font-mono">{item.quoteNo}</div>
              <div className="font-black text-slate-700 uppercase">{item.name}</div>
            </div>
            <div className="font-black text-blue-600 text-xl">${item.unitPrice}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. ...must match the name HERE
export default LedgerTab;