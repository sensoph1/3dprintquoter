import React, { useState } from 'react';
import { Settings, DollarSign, Database, Home, Percent, Zap, Upload, Download, Plus, Trash2, Cloud, Edit2, Check, X, Cpu, Gauge, HardDrive, Tag, LogOut, User, ChevronDown } from 'lucide-react';
import Tooltip from './Tooltip';
import Accordion from './Accordion';

const InputBlock = ({ label, icon: Icon, type = "text", value, onChange, prefix }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
      {Icon && <Icon size={12} />} {label}
    </label>
    <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500">
      {prefix && (
        <span className="px-4 font-bold text-slate-400 text-sm">
          {prefix}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full ${prefix ? '' : 'px-6'} py-4 bg-transparent outline-none font-bold text-sm`}
      />
    </div>
  </div>
);

const HardwareFleet = ({ library, saveToDisk }) => {
  const [newPrinter, setNewPrinter] = useState({ name: '', makeModel: '', watts: 300, cost: 0, hoursOfLife: 0 });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = () => {
    if (!newPrinter.name && !newPrinter.makeModel) return;
    const updatedPrinters = [
      ...library.printers,
      {
        ...newPrinter,
        id: Date.now(),
        name: newPrinter.name || newPrinter.makeModel,
        watts: parseFloat(newPrinter.watts),
        cost: parseFloat(newPrinter.cost),
        hoursOfLife: parseFloat(newPrinter.hoursOfLife)
      }
    ];
    saveToDisk({ ...library, printers: updatedPrinters });
    setNewPrinter({ name: '', makeModel: '', watts: 300, cost: 0, hoursOfLife: 0 });
    setShowAddForm(false);
  };

  const saveEdit = () => {
    const updated = library.printers.map(p =>
      p.id === editingId ? {
        ...editData,
        watts: parseFloat(editData.watts),
        cost: parseFloat(editData.cost),
        hoursOfLife: parseFloat(editData.hoursOfLife)
      } : p
    );
    saveToDisk({ ...library, printers: updated });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* PRINTER LIST */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full mb-2">
          <HardDrive size={12} /> Active Hardware
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {library.printers.map((p) => (
            <div key={p.id} className="p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100 transition-all flex items-center justify-between">
              {editingId === p.id ? (
                /* EDIT MODE */
                <div className="flex flex-1 gap-3 items-center">
                  <Tooltip text="The name of your 3D printer.">
                    <input className="flex-1 px-4 py-3 bg-white rounded-xl border font-bold text-sm outline-none" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                  </Tooltip>
                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200">
                    <Zap size={12} className="text-slate-300" />
                    <Tooltip text="The maximum power your printer draws in Watts.">
                      <input type="number" className="w-20 py-2 bg-transparent font-bold text-sm" value={editData.watts} onChange={e => setEditData({...editData, watts: e.target.value})} placeholder="Peak Power" />
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200">
                    <span className="text-slate-300 font-bold">$</span>
                    <Tooltip text="The initial purchase cost of this printer. Used for calculating depreciation.">
                      <input type="number" className="w-20 py-2 bg-transparent font-bold text-sm" value={editData.cost} onChange={e => setEditData({...editData, cost: e.target.value})} placeholder="Cost" />
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200">
                    <Tooltip text="The estimated total operational hours before this printer needs significant replacement or major repair. Used for calculating depreciation.">
                      <input type="number" className="w-20 py-2 bg-transparent font-bold text-sm" value={editData.hoursOfLife} onChange={e => setEditData({...editData, hoursOfLife: e.target.value})} placeholder="Hrs Life" />
                    </Tooltip>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={saveEdit} className="p-3 bg-blue-600 text-white rounded-xl"><Check size={16}/></button>
                    <button onClick={() => setEditingId(null)} className="p-3 bg-slate-200 text-slate-600 rounded-xl"><X size={16}/></button>
                  </div>
                </div>
              ) : (
                /* VIEW MODE */
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-blue-600">
                      <Gauge size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 uppercase text-xs leading-none">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                          <Zap size={10} /> {p.watts}W
                        </p>
                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          ${p.cost?.toLocaleString() || 0}
                        </p>
                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          {p.hoursOfLife?.toLocaleString() || 0} hrs life
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingId(p.id); setEditData(p); }} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all"><Edit2 size={16} /></button>
                    <button onClick={() => library.printers.length > 1 && saveToDisk({...library, printers: library.printers.filter(x => x.id !== p.id)})} className="p-3 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all"><Trash2 size={16} /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ADD NEW PRINTER - Collapsible */}
      <div className="border border-slate-100 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-all"
        >
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600">
            <Plus size={12} /> Add Machine
          </div>
          <ChevronDown size={16} className={`text-slate-400 transition-transform ${showAddForm ? 'rotate-180' : ''}`} />
        </button>
        {showAddForm && (
          <div className="p-4 border-t border-slate-100 space-y-3">
            {/* Line 1: Machine Name | Make and Model */}
            <div className="flex gap-2">
              <input
                placeholder="Machine Name (e.g. Shop Printer 1)"
                value={newPrinter.name}
                onChange={(e) => setNewPrinter({...newPrinter, name: e.target.value})}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm"
              />
              <input
                placeholder="Make & Model (e.g. Bambu Lab X1C)"
                value={newPrinter.makeModel}
                onChange={(e) => setNewPrinter({...newPrinter, makeModel: e.target.value})}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm"
              />
            </div>
            {/* Line 2: Wattage | Price | Lifespan | Add */}
            <div className="flex gap-2 items-center">
              <div className="flex-1 flex items-center gap-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                <Zap size={12} className="text-slate-400" />
                <input
                  type="number"
                  placeholder="Watts"
                  value={newPrinter.watts}
                  onChange={(e) => setNewPrinter({...newPrinter, watts: e.target.value})}
                  className="w-full bg-transparent outline-none font-bold text-sm"
                />
              </div>
              <div className="flex-1 flex items-center gap-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-slate-400 font-bold text-sm">$</span>
                <input
                  type="number"
                  placeholder="Price"
                  value={newPrinter.cost}
                  onChange={(e) => setNewPrinter({...newPrinter, cost: e.target.value})}
                  className="w-full bg-transparent outline-none font-bold text-sm"
                />
              </div>
              <div className="flex-1 flex items-center gap-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                <input
                  type="number"
                  placeholder="Lifespan"
                  value={newPrinter.hoursOfLife}
                  onChange={(e) => setNewPrinter({...newPrinter, hoursOfLife: e.target.value})}
                  className="w-full bg-transparent outline-none font-bold text-sm"
                />
                <span className="text-slate-400 font-bold text-xs">hrs</span>
              </div>
              <button onClick={handleAdd} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const CategoryManager = ({ library, saveToDisk }) => {
  const [newCategory, setNewCategory] = useState('');

  const handleAdd = () => {
    if (!newCategory.trim()) return;
    const categories = library.categories || [];
    if (categories.includes(newCategory.trim())) return;
    saveToDisk({ ...library, categories: [...categories, newCategory.trim()] });
    setNewCategory('');
  };

  const handleDelete = (cat) => {
    const categories = library.categories || [];
    saveToDisk({ ...library, categories: categories.filter(c => c !== cat) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
        <Tag size={12} /> Project Categories
      </div>

      <div className="flex gap-3">
        <input
          placeholder="New category name..."
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm"
        />
        <button onClick={handleAdd} className="px-6 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(library.categories || []).map((cat, index) => (
          <div key={index} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full">
            <span className="font-bold text-sm text-slate-700">{cat}</span>
            <button
              onClick={() => handleDelete(cat)}
              className="p-1 text-slate-400 hover:text-red-500 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {(!library.categories || library.categories.length === 0) && (
          <p className="text-sm text-slate-400 italic">No categories yet. Add one above.</p>
        )}
      </div>
    </div>
  );
};

const SettingsTab = ({ library, saveToDisk, history, onLogout, userEmail }) => {
  const updateSetting = (key, value) => {
    saveToDisk({ ...library, [key]: value });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-3">
            <Settings className="text-blue-600" size={28} /> Studio Settings
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Configure your global rates and studio identity</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">
{userEmail && (
          <Accordion title="Account">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
                <User size={12} /> Account
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signed in as</p>
                  <p className="font-bold text-slate-800">{userEmail}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
              <p className="text-xs text-slate-400">Your data is automatically synced to the cloud.</p>
            </div>
          </Accordion>
        )}

        <Accordion title="Branding">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
              <Home size={12} /> Branding
            </div>
            <Tooltip text="Your studio's name, displayed at the top of the application.">
              <InputBlock
                label="Studio Name"
                value={library.shopName}
                onChange={(val) => updateSetting('shopName', val)}
              />
            </Tooltip>
          </div>
        </Accordion>

        <Accordion title="Financial Rates">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
              <DollarSign size={12} /> Financial Rates
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Tooltip text="The hourly rate your shop charges for machine usage, independent of material or labor costs.">
                <InputBlock 
                  label="Shop Hourly Rate" 
                  prefix="$" 
                  type="number" 
                  value={library.shopHourlyRate} 
                  onChange={(val) => updateSetting('shopHourlyRate', parseFloat(val))} 
                />
              </Tooltip>
              <Tooltip text="Your personal hourly labor rate. This is factored into job costs when labor minutes are entered.">
                <InputBlock 
                  label="Labor Rate (Your Pay)" 
                  prefix="$" 
                  type="number" 
                  value={library.laborRate} 
                  onChange={(val) => updateSetting('laborRate', parseFloat(val))} 
                />
              </Tooltip>
              <Tooltip text="The cost of electricity per kilowatt-hour (kWh) in your local currency. Used to calculate energy consumption costs.">
                <InputBlock 
                  label="Electricity Cost" 
                  prefix="$" 
                  type="number" 
                  value={library.kwhRate} 
                  onChange={(val) => updateSetting('kwhRate', parseFloat(val))} 
                />
              </Tooltip>
              <Tooltip text="The increment to which all final calculated prices will be rounded up. For example, '1' for nearest dollar, '5' for nearest five dollars.">
                <InputBlock
                  label="Price Rounding"
                  prefix="$"
                  type="number"
                  value={library.rounding}
                  onChange={(val) => updateSetting('rounding', parseFloat(val))}
                />
              </Tooltip>
            </div>
          </div>
        </Accordion>

        <Accordion title="Categories">
          <CategoryManager library={library} saveToDisk={saveToDisk} />
        </Accordion>

        <Accordion title="Hardware Fleet">
          <HardwareFleet library={library} saveToDisk={saveToDisk} />
        </Accordion>

        <Accordion title="Database Info">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
              <Database size={12} /> Database Info
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-center">
                <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Total Quotes</span>
                <span className="text-2xl font-black text-slate-800">{history.length}</span>
              </div>
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-center">
                <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Materials</span>
                <span className="text-2xl font-black text-slate-800">{library.filaments.length}</span>
              </div>
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-center">
                <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Next Quote</span>
                <span className="text-2xl font-black text-slate-800">#{library.nextQuoteNo}</span>
              </div>
            </div>
          </div>
        </Accordion>

        <Accordion title="Danger Zone">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 w-fit px-3 py-1 rounded-full">
              <Zap size={12} /> Danger Zone
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-500">
                  Reset all your data to the initial state. This action cannot be undone.
                </p>
                <button 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
                      saveToDisk({
                        shopName: "Studio OS",
                        shopHourlyRate: 2.00,
                        laborRate: 20.00,
                        kwhRate: 0.12,
                        nextQuoteNo: 1001,
                        filaments: [{ id: 1, name: "Matte PLA", colorName: "Black", price: 22, grams: 1000, color: "#3b82f6" }],
                        printers: [{ id: 1, name: "Bambu Lab X1C", watts: 350 }],
                        categories: ["Client Work", "Prototypes", "Personal"],
                        printedParts: [],
                        inventory: [],
                        rounding: 1
                      }, []);
                    }
                  }}
                  className="mt-4 w-full py-3 bg-red-600 text-white rounded-lg font-bold text-sm"
                >
                  Reset All Data
                </button>
              </div>
            </div>
          </div>
        </Accordion>

        <Accordion title="Print Shop Data Report">
          <div className="pt-6 flex gap-4">
            <button 
              onClick={handlePrint}
              className="w-full py-5 bg-white text-black border-2 border-black rounded-[2rem] font-black text-[10px] tracking-[0.2em] uppercase hover:bg-gray-200 transition shadow-xl"
            >
              Print Shop Data Report
            </button>
          </div>
        </Accordion>
      </div>
    </div>
  );
};

export default SettingsTab;