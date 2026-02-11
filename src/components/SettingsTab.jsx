import React, { useState, useRef } from 'react';
import { Settings, DollarSign, Database, Home, Percent, Zap, Upload, Download, Plus, Trash2, Cloud, Edit2, Check, X, Cpu, Gauge, HardDrive, Tag, ChevronDown, AlertTriangle, FileSpreadsheet, FileText, FileJson, UploadCloud } from 'lucide-react';
import Tooltip from './Tooltip';
import Accordion from './Accordion';
import SquareIntegration from './SquareIntegration';
import { supabase } from '../supabaseClient';
import {
  downloadCSV,
  formatSalesCSV,
  formatEstimatesCSV,
  formatPrintedPartsCSV,
  formatConsumablesCSV,
  formatEventsCSV,
  formatMaterialsCSV,
  formatPrintersCSV,
  downloadJSONBackup,
  parseJSONBackup,
} from '../utils/csvExport';

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
  const thresholds = library.categoryThresholds || {};

  const handleAdd = () => {
    if (!newCategory.trim()) return;
    const categories = library.categories || [];
    if (categories.includes(newCategory.trim())) return;
    saveToDisk({ ...library, categories: [...categories, newCategory.trim()] });
    setNewCategory('');
  };

  const handleDelete = (cat) => {
    const categories = library.categories || [];
    const newThresholds = { ...thresholds };
    delete newThresholds[cat];
    saveToDisk({ ...library, categories: categories.filter(c => c !== cat), categoryThresholds: newThresholds });
  };

  const updateThreshold = (cat, value) => {
    const val = parseInt(value) || 0;
    saveToDisk({ ...library, categoryThresholds: { ...thresholds, [cat]: val } });
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

      <div className="space-y-2">
        {(library.categories || []).map((cat, index) => (
          <div key={index} className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="font-bold text-sm text-slate-700 flex-1">{cat}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Low at</span>
              <input
                type="number"
                min="0"
                value={thresholds[cat] ?? 3}
                onChange={(e) => updateThreshold(cat, e.target.value)}
                className="w-16 px-3 py-1 bg-white rounded-lg border text-sm font-bold text-center"
              />
            </div>
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

const SettingsTab = ({ library, saveToDisk, history, session, tierLimits, onUpgradeClick }) => {
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [deleteSelections, setDeleteSelections] = useState({
    quotes: true,
    materials: true,
    printers: true,
    inventory: true,
    consumables: true,
    events: true,
    sales: true,
    subscriptions: true,
    categories: true,
  });
  const [restoreStatus, setRestoreStatus] = useState(null); // null | 'success' | 'error'
  const [restoreError, setRestoreError] = useState('');
  const fileInputRef = useRef(null);

  const updateSetting = (key, value) => {
    saveToDisk({ ...library, [key]: value });
  };

  const handleRestore = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = parseJSONBackup(event.target.result);
      if (result.valid) {
        if (window.confirm('This will replace all your current data with the backup. Continue?')) {
          saveToDisk(result.data.library, result.data.history);
          setRestoreStatus('success');
          setTimeout(() => setRestoreStatus(null), 3000);
        }
      } else {
        setRestoreError(result.error);
        setRestoreStatus('error');
        setTimeout(() => setRestoreStatus(null), 5000);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset so same file can be selected again
  };

  const toggleSelection = (key) => {
    setDeleteSelections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedCount = Object.values(deleteSelections).filter(Boolean).length;

  const handleReset = () => {
    const newLibrary = { ...library };
    let newHistory = [...history];

    if (deleteSelections.quotes) {
      newHistory = [];
      newLibrary.nextQuoteNo = 1001;
    }
    if (deleteSelections.materials) {
      newLibrary.filaments = [{ id: 1, name: "Matte PLA", colorName: "Black", price: 22, grams: 1000, color: "#3b82f6" }];
    }
    if (deleteSelections.printers) {
      newLibrary.printers = [{ id: 1, name: "Bambu Lab X1C", watts: 350 }];
    }
    if (deleteSelections.inventory) {
      newLibrary.printedParts = [];
    }
    if (deleteSelections.consumables) {
      newLibrary.inventory = [];
    }
    if (deleteSelections.events) {
      newLibrary.events = [];
    }
    if (deleteSelections.sales) {
      newLibrary.sales = [];
    }
    if (deleteSelections.subscriptions) {
      newLibrary.subscriptions = [];
    }
    if (deleteSelections.categories) {
      newLibrary.categories = ["Client Work", "Prototypes", "Personal"];
    }

    saveToDisk(newLibrary, newHistory);
    setResetModalOpen(false);
    setResetConfirmText('');
    setDeleteSelections({
      quotes: true,
      materials: true,
      printers: true,
      inventory: true,
      consumables: true,
      events: true,
      sales: true,
      subscriptions: true,
      categories: true,
    });
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
        <Accordion title="Square Integration">
          {tierLimits?.squareSync ? (
            <SquareIntegration
              session={session}
              library={library}
              saveToDisk={saveToDisk}
            />
          ) : (
            <div className="p-6 bg-slate-50 rounded-2xl text-center space-y-4">
              <p className="text-slate-600">Square integration is available on the Pro plan.</p>
              <button
                onClick={onUpgradeClick}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
              >
                Upgrade to Pro
              </button>
            </div>
          )}
        </Accordion>

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

        <Accordion title="Your Data">
          <div className="space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Quotes</span>
                <span className="text-xl font-black text-slate-800">{history.length}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Materials</span>
                <span className="text-xl font-black text-slate-800">{library.filaments?.length || 0}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Next Quote</span>
                <span className="text-xl font-black text-slate-800">#{library.nextQuoteNo}</span>
              </div>
            </div>

            {/* Export CSV */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <FileSpreadsheet size={12} /> Export CSV
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => downloadCSV('quotes.csv', formatEstimatesCSV(history, library.events || []))}
                  className="py-2 px-3 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition"
                >
                  Quotes
                </button>
                <button
                  onClick={() => downloadCSV('sales.csv', formatSalesCSV(library.sales || [], library.events || []))}
                  className="py-2 px-3 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition"
                >
                  Sales
                </button>
                <button
                  onClick={() => downloadCSV('events.csv', formatEventsCSV(library.events || [], library.sales || [], history))}
                  className="py-2 px-3 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition"
                >
                  Events
                </button>
                <button
                  onClick={() => downloadCSV('inventory.csv', formatPrintedPartsCSV(library.printedParts || []))}
                  className="py-2 px-3 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition"
                >
                  Inventory
                </button>
                <button
                  onClick={() => downloadCSV('consumables.csv', formatConsumablesCSV(library.inventory || []))}
                  className="py-2 px-3 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition"
                >
                  Consumables
                </button>
                <button
                  onClick={() => downloadCSV('materials.csv', formatMaterialsCSV(library.filaments || []))}
                  className="py-2 px-3 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition"
                >
                  Materials
                </button>
              </div>
            </div>

            {/* Backup & Restore */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <FileJson size={12} /> Backup & Restore
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => downloadJSONBackup(library, history)}
                  className="py-2 px-3 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition flex items-center justify-center gap-1"
                >
                  <Download size={14} /> Download Backup
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2 px-3 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition flex items-center justify-center gap-1"
                >
                  <UploadCloud size={14} /> Restore Backup
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleRestore}
                className="hidden"
              />
              {restoreStatus === 'success' && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <Check size={14} /> Data restored successfully!
                </p>
              )}
              {restoreStatus === 'error' && (
                <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                  <X size={14} /> {restoreError}
                </p>
              )}
            </div>

            {/* Delete */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <Trash2 size={12} /> Danger Zone
              </p>
              <button
                onClick={() => setResetModalOpen(true)}
                className="w-full py-2 bg-red-50 text-red-600 rounded-lg font-bold text-xs hover:bg-red-100 transition"
              >
                Delete Data...
              </button>
            </div>
          </div>
        </Accordion>
      </div>

      {/* Reset Confirmation Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setResetModalOpen(false)}>
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="text-red-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Delete Data</h3>
                <p className="text-xs text-slate-500">Select what to delete</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <button
                  onClick={() => {
                    const allSelected = selectedCount === 9;
                    setDeleteSelections({
                      quotes: !allSelected,
                      materials: !allSelected,
                      printers: !allSelected,
                      inventory: !allSelected,
                      consumables: !allSelected,
                      events: !allSelected,
                      sales: !allSelected,
                      subscriptions: !allSelected,
                      categories: !allSelected,
                    });
                  }}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wide"
                >
                  {selectedCount === 9 ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-[10px] text-slate-400">{selectedCount} selected</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { key: 'quotes', label: 'Quotes', count: history.length },
                  { key: 'materials', label: 'Materials', count: library.filaments?.length || 0 },
                  { key: 'printers', label: 'Printers', count: library.printers?.length || 0 },
                  { key: 'inventory', label: 'Printed Parts', count: library.printedParts?.length || 0 },
                  { key: 'consumables', label: 'Consumables', count: library.inventory?.length || 0 },
                  { key: 'events', label: 'Events', count: library.events?.length || 0 },
                  { key: 'sales', label: 'Sales', count: library.sales?.length || 0 },
                  { key: 'subscriptions', label: 'Subscriptions', count: library.subscriptions?.length || 0 },
                  { key: 'categories', label: 'Categories', count: library.categories?.length || 0 },
                ].map(({ key, label, count }) => (
                  <label
                    key={key}
                    className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition text-xs ${
                      deleteSelections[key] ? 'bg-red-50 text-red-700' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={deleteSelections[key]}
                      onChange={() => toggleSelection(key)}
                      className="w-3 h-3 rounded border-slate-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="flex-1 truncate">{label}</span>
                    <span className="font-mono text-[10px] opacity-60">{count}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedCount > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Type <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-center text-sm focus:border-red-500 focus:outline-none"
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => { setResetModalOpen(false); setResetConfirmText(''); }}
                className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={selectedCount === 0 || resetConfirmText !== 'DELETE'}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
                  selectedCount > 0 && resetConfirmText === 'DELETE'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
              >
                Delete {selectedCount > 0 ? `(${selectedCount})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;