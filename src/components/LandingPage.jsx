import React from 'react';
import {
  Calculator, DollarSign, Calendar, Box,
  TrendingUp, Check, ArrowRight, Zap
} from 'lucide-react';

const LandingPage = ({ onGetStarted, onTryDemo }) => {
  const features = [
    {
      icon: Calculator,
      title: 'Smart Pricing Calculator',
      desc: 'Factor in material, energy, labor, and depreciation. Never underprice again.'
    },
    {
      icon: DollarSign,
      title: '3 Pricing Strategies',
      desc: 'Compare profit margin, hourly rate, and material multiplier side-by-side.'
    },
    {
      icon: Calendar,
      title: 'Event Management',
      desc: 'Track craft fairs, markets, and pop-ups. Link sales to events automatically.'
    },
    {
      icon: Box,
      title: 'Inventory Tracking',
      desc: 'Manage finished products, consumables, and filament stock in one place.'
    },
    {
      icon: TrendingUp,
      title: 'Sales & Analytics',
      desc: 'See what sells, track revenue by event, and export reports.'
    },
    {
      icon: Zap,
      title: 'Square Integration',
      desc: 'Sync your Square POS sales and push inventory automatically.'
    },
  ];

  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      desc: 'Perfect for getting started',
      features: [
        'Unlimited estimates',
        '10 saved quotes',
        '1 event',
        'Basic inventory',
        'CSV export',
      ],
      notIncluded: [
        'Square integration',
        'Unlimited history',
        'Unlimited events',
      ],
      cta: 'Start Free',
      highlight: false,
    },
    {
      name: 'Pro',
      price: '$6',
      period: '/month',
      yearlyPrice: '$50/year (save 30%)',
      desc: 'For serious booth sellers',
      features: [
        'Everything in Free',
        'Unlimited saved quotes',
        'Unlimited events',
        'Square POS integration',
        'Priority support',
      ],
      notIncluded: [],
      cta: 'Start Free Trial',
      highlight: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Nav */}
      <nav className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white">
            <Calculator size={24} />
          </div>
          <span className="font-black text-xl tracking-tight">3DPrintCalc</span>
        </div>
        <button
          onClick={onGetStarted}
          className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition"
        >
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-24 text-center">
        <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
          For 3D Print Sellers
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 mb-6">
          Know Your Costs.<br />
          <span className="text-blue-600">Price With Confidence.</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
          Stop guessing at craft fairs. The all-in-one calculator and inventory system
          built for makers who sell at markets, fairs, and online.
        </p>
        <div className="flex flex-row gap-4 justify-center">
          <button
            onClick={onTryDemo}
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
          >
            Try It Free <ArrowRight size={18} />
          </button>
          <button
            onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 bg-white text-slate-700 rounded-2xl font-bold border-2 border-slate-200 hover:border-slate-300 transition"
          >
            See How It Works
          </button>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          No account required to try. <button onClick={onGetStarted} className="text-blue-600 font-bold hover:underline">Sign in</button> to save your work.
        </p>
      </section>

      {/* Social Proof */}
      <section className="border-y border-slate-100 bg-slate-50/50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-500 font-medium">
            Trusted by <span className="font-black text-slate-700">500+</span> makers at craft fairs and markets
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-4">
            How It Works
          </h2>
          <p className="text-slate-600">
            From "I have no idea" to confident pricing in 3 steps.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-4">
              1
            </div>
            <h3 className="font-black text-xl text-slate-900 mb-2">Enter Your Costs</h3>
            <p className="text-slate-600">
              Plug in filament used, print time, and labor. We calculate material, energy, and depreciation automatically.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-4">
              2
            </div>
            <h3 className="font-black text-xl text-slate-900 mb-2">Compare Strategies</h3>
            <p className="text-slate-600">
              See three prices side-by-side: profit margin, hourly rate, and material multiplier. Pick what works for you.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-4">
              3
            </div>
            <h3 className="font-black text-xl text-slate-900 mb-2">Track & Sell</h3>
            <p className="text-slate-600">
              Save to inventory, sync with Square, and track sales at every market. Know exactly what you made.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-4">
            Everything You Need to Sell Smarter
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            From pricing your first print to managing inventory at your 100th market.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all">
              <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <f.icon className="text-blue-600" size={24} />
              </div>
              <h3 className="font-black text-lg text-slate-900 mb-2">{f.title}</h3>
              <p className="text-slate-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-slate-900 py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-4">
              Simple, Maker-Friendly Pricing
            </h2>
            <p className="text-slate-400">
              Start free. Upgrade when you're ready.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {tiers.map((tier, i) => (
              <div
                key={i}
                className={`rounded-3xl p-8 ${
                  tier.highlight
                    ? 'bg-blue-600 text-white ring-4 ring-blue-400/30'
                    : 'bg-slate-800 text-white'
                }`}
              >
                <div className="mb-6">
                  <h3 className="font-black text-xl mb-1">{tier.name}</h3>
                  <p className={tier.highlight ? 'text-blue-200' : 'text-slate-400'}>{tier.desc}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-black">{tier.price}</span>
                  <span className={tier.highlight ? 'text-blue-200' : 'text-slate-400'}>{tier.period}</span>
                  {tier.yearlyPrice && (
                    <p className="text-sm text-blue-200 mt-1">{tier.yearlyPrice}</p>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <Check size={16} className={tier.highlight ? 'text-blue-200' : 'text-green-400'} />
                      {f}
                    </li>
                  ))}
                  {tier.notIncluded.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-500 line-through">
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onGetStarted}
                  className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition ${
                    tier.highlight
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-4">
          Ready to Price With Confidence?
        </h2>
        <p className="text-slate-600 mb-8">
          Join makers who stopped leaving money on the table.
        </p>
        <button
          onClick={onGetStarted}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-600/30"
        >
          Get Started Free
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} 3DPrintCalc. Built for makers, by makers.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
