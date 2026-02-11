import React, { useState } from 'react';
import { Sparkles, X, Check } from 'lucide-react';
import { supabase } from '../supabaseClient';

// These will be set after creating products in Stripe
const STRIPE_PRICES = {
  monthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || '',
  yearly: import.meta.env.VITE_STRIPE_PRICE_YEARLY || '',
};

const UpgradePrompt = ({ feature, onClose, session }) => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(false);

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

  const handleUpgrade = async () => {
    if (!session?.user) {
      alert('Please sign in to upgrade');
      return;
    }

    const priceId = STRIPE_PRICES[billingCycle];
    if (!priceId) {
      alert('Stripe is not configured yet. Please try again later.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          priceId,
          userId: session.user.id,
          userEmail: session.user.email,
          returnUrl: window.location.origin,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

        {/* Billing toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`flex-1 py-2 px-4 rounded-xl font-bold text-sm transition ${
              billingCycle === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`flex-1 py-2 px-4 rounded-xl font-bold text-sm transition ${
              billingCycle === 'yearly'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Yearly <span className="text-green-400 text-xs ml-1">Save $12</span>
          </button>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="font-black text-slate-900">Pro Plan</span>
            </div>
            <div className="text-right">
              {billingCycle === 'monthly' ? (
                <>
                  <span className="font-black text-2xl text-slate-900">$6</span>
                  <span className="text-slate-500">/mo</span>
                </>
              ) : (
                <>
                  <span className="font-black text-2xl text-slate-900">$60</span>
                  <span className="text-slate-500">/year</span>
                  <div className="text-xs text-green-600 font-bold">$5/mo</div>
                </>
              )}
            </div>
          </div>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Unlimited estimates</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Unlimited events</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Square POS integration</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            Maybe Later
          </button>
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Upgrade Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
