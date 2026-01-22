import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Layers, Mail, Lock } from 'lucide-react';

const AuthGate = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleAuth = async (type) => {
    setLoading(true);
    setMessage('');
    const { error } = type === 'LOGIN' 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) setMessage(error.message);
    else if (type === 'SIGNUP') setMessage('Check your email for a confirmation link!');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-4 rounded-2xl text-white mb-4"><Layers size={32} /></div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Pro3D Cloud</h1>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          
          <button onClick={() => handleAuth('LOGIN')} disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? 'Processing...' : 'Sign In'}
          </button>
          
          <button onClick={() => handleAuth('SIGNUP')} disabled={loading}
            className="w-full py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl font-black uppercase tracking-widest hover:bg-blue-50 transition">
            Create Account
          </button>
        </div>
        {message && <p className="mt-4 text-center text-xs font-bold text-red-500 uppercase tracking-tighter">{message}</p>}
      </div>
    </div>
  );
};

export default AuthGate;