import React from 'react';
import { Sparkles, Database } from 'lucide-react';

const FreshStartPrompt = ({ onFreshStart, onKeepSamples }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="text-green-600" size={32} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Welcome aboard!</h3>
          <p className="text-slate-600">Your account is ready. How would you like to start?</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onFreshStart}
            className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition">
                <Sparkles className="text-blue-600" size={20} />
              </div>
              <div>
                <div className="font-black text-slate-900">Start Fresh</div>
                <div className="text-sm text-slate-500">Clean slate - enter your own data</div>
              </div>
            </div>
          </button>

          <button
            onClick={onKeepSamples}
            className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-xl group-hover:bg-purple-200 transition">
                <Database className="text-purple-600" size={20} />
              </div>
              <div>
                <div className="font-black text-slate-900">Keep Sample Data</div>
                <div className="text-sm text-slate-500">Continue exploring with demo data</div>
              </div>
            </div>
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          You can clear or manage your data anytime in Settings → Your Data
        </p>
      </div>
    </div>
  );
};

export default FreshStartPrompt;
