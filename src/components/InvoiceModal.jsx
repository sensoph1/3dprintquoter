import React, { useState, useEffect } from 'react';
import { X, FileText, Download, Loader2 } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';

const InvoiceModal = ({ estimate, shopName, onClose, requests = [] }) => {
  const [loading, setLoading] = useState(false);

  // Pre-fill from linked request if available
  const linkedRequest = estimate.requestId
    ? requests.find(r => r.id === estimate.requestId)
    : null;

  const [formData, setFormData] = useState({
    customerName: linkedRequest?.customer_name || '',
    customerEmail: linkedRequest?.customer_email || '',
    quantity: estimate.details?.qty || 1,
    notes: '',
  });

  const update = (field, value) => setFormData({ ...formData, [field]: value });

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}-${random}`;
  };

  const handleGenerate = async () => {
    setLoading(true);

    const invoiceData = {
      ...formData,
      invoiceNumber: generateInvoiceNumber(),
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
    };

    try {
      const doc = <InvoicePDF estimate={estimate} invoiceData={invoiceData} shopName={shopName} />;
      const blob = await pdf(doc).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoiceData.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const total = (estimate.unitPrice || 0) * formData.quantity;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <FileText size={20} />
            <h3 className="font-black text-lg uppercase tracking-wide">Generate Invoice</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Project Info */}
          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Project</div>
            <div className="font-bold text-slate-800">{estimate.name}</div>
            <div className="text-sm text-slate-500">{estimate.quoteNo} • ${(estimate.unitPrice || 0).toFixed(2)}/unit</div>
          </div>

          {/* Customer Info */}
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => update('customerName', e.target.value)}
                placeholder="Enter customer name..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                Customer Email <span className="text-slate-300">(optional)</span>
              </label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => update('customerEmail', e.target.value)}
                placeholder="customer@email.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Quantity & Total */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => update('quantity', Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                Total
              </label>
              <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-lg font-black text-blue-600">
                ${total.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Invoice Notes <span className="text-slate-300">(optional)</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Payment terms, special instructions, etc..."
              rows={2}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || !formData.customerName.trim()}
            className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download size={16} />
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
