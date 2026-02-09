import React from 'react';
import { Cloud, X, Save } from 'lucide-react';

const SignupPrompt = ({ feature, onClose, onSignup }) => {
  const messages = {
    save: {
      title: "Create an account to save",
      desc: "Your estimate is ready! Sign up to save it to your history and access it from anywhere.",
      icon: Save,
    },
    sync: {
      title: "Sign up to sync your data",
      desc: "Create a free account to sync your data across devices and access cloud features.",
      icon: Cloud,
    },
  };

  const msg = messages[feature] || messages.save;
  const Icon = msg.icon;

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
          <div className="bg-blue-600 p-3 rounded-2xl text-white">
            <Icon size={24} />
          </div>
          <h3 className="text-xl font-black text-slate-900">{msg.title}</h3>
        </div>

        <p className="text-slate-600 mb-6">{msg.desc}</p>

        <div className="bg-green-50 rounded-2xl p-4 mb-6 border border-green-100">
          <ul className="space-y-2 text-sm text-green-800">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span> Save unlimited estimates
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span> Access from any device
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span> Free forever (basic features)
            </li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            Keep Exploring
          </button>
          <button
            onClick={onSignup}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
          >
            Create Free Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupPrompt;
