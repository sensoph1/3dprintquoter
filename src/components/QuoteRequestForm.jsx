import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

const QuoteRequestForm = ({ userId, shopName }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    description: ''
  });
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.description) {
      setErrorMessage('Please fill in all required fields.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    const { error } = await supabase
      .from('quote_requests')
      .insert({
        user_id: userId,
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone || null,
        description: form.description,
        status: 'new'
      });

    if (error) {
      console.error('Error submitting request:', error);
      setErrorMessage('Something went wrong. Please try again.');
      setStatus('error');
    } else {
      setStatus('success');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-sm border border-slate-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 mb-2">Request Submitted!</h1>
          <p className="text-slate-500 mb-6">
            Thank you for your quote request. We'll review it and get back to you soon.
          </p>
          <button
            onClick={() => {
              setForm({ name: '', email: '', phone: '', description: '' });
              setStatus('idle');
            }}
            className="text-blue-600 font-bold text-sm hover:underline"
          >
            Submit another request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-sm border border-slate-100 max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-800">
            {shopName || 'Quote Request'}
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Fill out the form below and we'll get back to you with a quote.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Phone <span className="text-slate-300">(optional)</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="(555) 123-4567"
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              What do you need? <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what you're looking for... (e.g., custom phone stand, 3D printed gift, prototype)"
              rows={4}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl">
              <AlertCircle size={16} />
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === 'submitting' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send size={16} />
                Submit Request
              </>
            )}
          </button>
        </form>

        <p className="text-center text-slate-400 text-xs mt-6">
          We typically respond within 24-48 hours.
        </p>
      </div>
    </div>
  );
};

export default QuoteRequestForm;
