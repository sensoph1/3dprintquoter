import React, { useState } from 'react';
import { 
  ChevronDown, ChevronUp, FileText, 
  Trash2, Search, TrendingUp, Filter, RefreshCw, Edit2, Archive
} from 'lucide-react';
import Tooltip from './Tooltip';

const QuoteHistoryTab = ({ history, saveToDisk, library, handleJobLoad, handleAddToInventory }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const deleteEntry = (id) => {
    if (window.confirm("Delete this record permanently?")) {
      const newHistory = history.filter(item => item.id !== id);
      saveToDisk(library, newHistory);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Filter logic for Search
  const filteredHistory = history.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.quoteNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER & STATS */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Quote History</h2>
          <p className="text-slate-500 font-medium">Historical record of all logged studio projects.</p>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <div className="flex items-center bg-white border border-slate-100 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
            <Search className="ml-4 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by project name or Q-number..."
              className="w-full pl-4 pr-4 py-4 bg-transparent outline-none font-medium text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <button className="px-6 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition-colors shadow-sm">
          <Filter size={20} />
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Tooltip text="The date the project was logged and its unique quote number.">Date / ID</Tooltip>
              </th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Tooltip text="The name of the project.">Project Name</Tooltip>
              </th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                <Tooltip text="The calculated cost to produce a single item, before any profit margins or multipliers.">Cost Per Item</Tooltip>
              </th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                <Tooltip text="The calculated sale price per item, based on your chosen pricing strategy.">Price Per Item</Tooltip>
              </th>
              <th className="p-6 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-20 text-center text-slate-400 font-bold italic">
                  {searchTerm ? "No projects match your search." : "No production records found."}
                </td>
              </tr>
            ) : (
              filteredHistory.map((item) => (
                <React.Fragment key={item.id}>
                  <tr 
                    onClick={() => toggleExpand(item.id)}
                    className={`group cursor-pointer transition-colors hover:bg-slate-50 ${expandedId === item.id ? 'bg-blue-50/30' : ''}`}
                  >
                    <td className="p-6">
                      <div className="font-black text-slate-900 text-sm">{item.date}</div>
                      <div className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">{item.quoteNo}</div>
                    </td>
                    <td className="p-6">
                      <div className="font-bold text-slate-700">{item.name}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                        {item.details?.qty} Units • {item.details?.hours} Hrs
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="text-lg font-black text-slate-900">${(item.costPerItem || 0).toFixed(2)}</div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="text-lg font-black text-slate-900">${(item.unitPrice || 0).toFixed(2)}</div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2">
                        {expandedId === item.id ? <ChevronUp size={20} className="text-blue-600" /> : <ChevronDown size={20} className="text-slate-300" />}
                      </div>
                    </td>
                  </tr>

                  {expandedId === item.id && (
                    <tr className="bg-slate-50/50">
                      <td colSpan="5" className="p-8 border-t border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="space-y-4">
                            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600">Technical Specs</h4>
                            <div className="grid grid-cols-2 gap-2 text-slate-700">
                              <div className="bg-white p-3 rounded-xl border border-slate-200">
                                <Tooltip text="The infill density used for the print.">
                                  <p className="text-[8px] font-black text-slate-400 uppercase">Infill</p>
                                </Tooltip>
                                <p className="text-xs font-bold">{item.details?.infill}</p>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-slate-200">
                                <Tooltip text="The number of perimeters/walls used for the print.">
                                  <p className="text-[8px] font-black text-slate-400 uppercase">Walls</p>
                                </Tooltip>
                                <p className="text-xs font-bold">{item.details?.walls}</p>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-slate-200">
                                <Tooltip text="The layer height used for the print.">
                                  <p className="text-[8px] font-black text-slate-400 uppercase">Layer</p>
                                </Tooltip>
                                <p className="text-xs font-bold">{item.details?.layerHeight}</p>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-slate-200">
                                <Tooltip text="The labor minutes recorded for the project.">
                                  <p className="text-[8px] font-black text-slate-400 uppercase">Labor</p>
                                </Tooltip>
                                <p className="text-xs font-bold">{item.details?.laborMinutes} Mins</p>
                              </div>
                            </div>
                          </div>

                          <div className="md:col-span-2 space-y-4">
                            <div className="flex justify-between items-center">
                              <Tooltip text="Any specific notes or details recorded for this production job.">
                                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                                  <FileText size={12} /> Production Notes
                                </h4>
                              </Tooltip>
                              <div className="flex justify-between items-center">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleAddToInventory(item); }}
                                  className="flex items-center gap-1 text-[9px] font-black uppercase text-blue-500 hover:text-blue-700 transition-colors"
                                >
                                  <Archive size={12} /> Add to Inventory
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleJobLoad(item.details, item.id); }}
                                  className="flex items-center gap-1 text-[9px] font-black uppercase text-blue-500 hover:text-blue-700 transition-colors"
                                >
                                  <Edit2 size={12} /> Edit
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleJobLoad(item.details); }}
                                  className="flex items-center gap-1 text-[9px] font-black uppercase text-blue-500 hover:text-blue-700 transition-colors"
                                >
                                  <RefreshCw size={12} /> Recall Job
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); deleteEntry(item.id); }}
                                  className="flex items-center gap-1 text-[9px] font-black uppercase text-red-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 size={12} /> Delete Record
                                </button>
                              </div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 min-h-[80px] shadow-sm">
                              {item.notes ? (
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{item.notes}</p>
                              ) : (
                                <p className="text-sm text-slate-400 italic">No notes recorded for this run.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuoteHistoryTab;