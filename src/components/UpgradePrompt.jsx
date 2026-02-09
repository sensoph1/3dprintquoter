import React from 'react';
import { Sparkles, X } from 'lucide-react';

const UpgradePrompt = ({ feature, onClose, onUpgrade }) => {
  const messages = {
    history: {
      title: "You've hit the free plan limit",
      desc: "Free accounts can save up to 10 estimates. Upgrade to Pro for unlimited history.",
    },
    events: {
      title: "Want to track more events?",
      desc: "Free accounts can create 1 event. Upgrade to Pro for unlimited events.",
    },
    square: {
      title: "Square integration is a Pro feature",
      desc: "Sync your Square POS sales and push inventory automatically with Pro.",
    },
  };

  const msg = messages[feature] || messages.history;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl text-white">
            <Sparkles size={24} />
          </div>
          <h3 className="text-xl font-black text-slate-900">{msg.title}</h3>
        </div>

        <p className="text-slate-600 mb-6">{msg.desc}</p>

        <div className="bg-slate-50 rounded-2xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-black text-slate-900">Pro Plan</span>
              <span className="text-slate-500 text-sm ml-2">Unlimited everything</span>
            </div>
            <div className="text-right">
              <span className="font-black text-2xl text-slate-900">$6</span>
              <span className="text-slate-500">/mo</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            Maybe Later
          </button>
          <button
            onClick={onUpgrade}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
