import React, { useState, useEffect } from 'react';
import { Inbox, Mail, Phone, ChevronDown, ChevronRight, Check, X, Clock, Trash2, Copy, ExternalLink } from 'lucide-react';
import { supabase } from '../supabaseClient';

// TODO: Remove this hardcoded ID after testing
const TEST_USER_ID = 'c4ffce99-d61c-49c1-a77f-904fcb532e3e';

const RequestsTab = ({ session }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [copied, setCopied] = useState(false);

  // Use session user ID if available, otherwise fall back to test ID
  const userId = session?.user?.id || TEST_USER_ID;

  const shareableLink = `${window.location.origin}?request=${userId}`;

  useEffect(() => {
    loadRequests();
  }, [userId]);

  const loadRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading requests:', error);
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('quote_requests')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
    }
  };

  const deleteRequest = async (id) => {
    if (!window.confirm('Delete this request?')) return;

    const { error } = await supabase
      .from('quote_requests')
      .delete()
      .eq('id', id);

    if (!error) {
      setRequests(requests.filter(r => r.id !== id));
    }
  };

  const copyLink = () => {
    if (shareableLink) {
      navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusColors = {
    new: 'bg-blue-100 text-blue-700',
    quoted: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    completed: 'bg-slate-100 text-slate-700',
    declined: 'bg-red-100 text-red-700'
  };

  const statusOptions = ['new', 'quoted', 'accepted', 'completed', 'declined'];

  // TODO: Restore auth check after testing
  // if (!session) {
  //   return (
  //     <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
  //       <div className="flex justify-between items-center">
  //         <div>
  //           <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-3">
  //             <Inbox className="text-blue-600" size={28} /> Requests
  //           </h2>
  //           <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Customer quote requests</p>
  //         </div>
  //       </div>
  //       <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 text-center">
  //         <p className="text-slate-500">Sign in to view and manage quote requests.</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-3">
            <Inbox className="text-blue-600" size={28} /> Requests
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Customer quote requests</p>
        </div>
        <button
          onClick={loadRequests}
          className="px-4 py-2 bg-slate-100 rounded-xl text-slate-600 text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
        >
          Refresh
        </button>
      </div>

      {/* SHAREABLE LINK */}
      {shareableLink && (
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <div className="text-xs font-black uppercase tracking-widest text-blue-600 mb-2 flex items-center gap-2">
            <ExternalLink size={14} /> Your Quote Request Link
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareableLink}
              className="flex-1 px-3 py-2 bg-white rounded-xl text-sm font-mono text-slate-600 border border-blue-200"
            />
            <button
              onClick={copyLink}
              className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-blue-500 mt-2">Share this link with customers so they can submit quote requests.</p>
        </div>
      )}

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-400 text-sm">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8">
            <Inbox className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-400">No requests yet. Share your link to start receiving quote requests!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(request => {
              const isExpanded = expandedId === request.id;
              return (
                <div key={request.id} className="border border-slate-100 rounded-2xl overflow-hidden">
                  {/* Request Header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-all"
                    onClick={() => setExpandedId(isExpanded ? null : request.id)}
                  >
                    <div className="flex items-center gap-4">
                      {isExpanded ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
                      <div>
                        <div className="font-black text-slate-800">{request.customer_name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <Clock size={12} /> {new Date(request.created_at).toLocaleDateString()}
                          <span className="mx-1">•</span>
                          <Mail size={12} /> {request.customer_email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusColors[request.status] || statusColors.new}`}>
                        {request.status}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-4">
                      {/* Contact Info */}
                      <div className="flex flex-wrap gap-4">
                        <a href={`mailto:${request.customer_email}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                          <Mail size={14} /> {request.customer_email}
                        </a>
                        {request.customer_phone && (
                          <a href={`tel:${request.customer_phone}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                            <Phone size={14} /> {request.customer_phone}
                          </a>
                        )}
                      </div>

                      {/* Description */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Request Details</div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{request.description}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-xs font-bold text-slate-400 uppercase">Status:</div>
                        {statusOptions.map(status => (
                          <button
                            key={status}
                            onClick={() => updateStatus(request.id, status)}
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-all ${
                              request.status === status
                                ? statusColors[status]
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                        <button
                          onClick={() => deleteRequest(request.id)}
                          className="ml-auto p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestsTab;
