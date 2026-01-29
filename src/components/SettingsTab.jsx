import { Settings, DollarSign, Database, Home, Percent, Zap, Upload, Download, Cpu, HardDrive, Plus, Trash2, Edit2, Check, X, Gauge, FlaskConical, Palette, RefreshCw, AlertCircle, Copy } from 'lucide-react';
import Tooltip from './Tooltip';
import generateUniqueId from '../utils/idGenerator';

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

const SettingsTab = ({ library, saveToDisk, history }) => {
  const [newPrinter, setNewPrinter] = React.useState({ name: '', watts: 300, cost: 0, hoursOfLife: 0 });
  const [editingId, setEditingId] = React.useState(null);
  const [editData, setEditData] = React.useState({});

  const [newFilament, setNewFilament] = React.useState({ name: '', colorName: '', price: '', grams: 1000, color: '#3b82f6' });
  const [editingFilamentId, setEditingFilamentId] = React.useState(null);
  const [editFilamentData, setEditFilamentData] = React.useState({});

  const updateSetting = (key, value) => {
    saveToDisk({ ...library, [key]: value });
  };

  const handleAddPrinter = () => {
    if (!newPrinter.name) return;
    const updatedPrinters = [
      ...library.printers,
      { 
        ...newPrinter, 
        id: Date.now(), 
        watts: parseFloat(newPrinter.watts), 
        cost: parseFloat(newPrinter.cost),
        hoursOfLife: parseFloat(newPrinter.hoursOfLife)
      }
    ];
    saveToDisk({ ...library, printers: updatedPrinters });
    setNewPrinter({ name: '', watts: 300, cost: 0, hoursOfLife: 0 });
  };

  const savePrinterEdit = () => {
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

  const handleAddFilament = () => {
    if (!newFilament.name || !newFilament.price) return;
    const updatedFilaments = [
      ...library.filaments,
      { ...newFilament, id: generateUniqueId(), price: parseFloat(newFilament.price), grams: parseFloat(newFilament.grams) }
    ];
    saveToDisk({ ...library, filaments: updatedFilaments });
    setNewFilament({ name: '', colorName: '', price: '', grams: 1000, color: '#3b82f6' });
  };

  const handleDuplicateFilament = (f) => {
    const duplicated = { ...f, id: generateUniqueId(), name: `${f.name} (Copy)` };
    saveToDisk({ ...library, filaments: [...library.filaments, duplicated] });
    setEditingFilamentId(duplicated.id);
    setEditFilamentData(duplicated);
  };

  const saveFilamentEdit = () => {
    const updated = library.filaments.map(f => f.id === editingFilamentId ? { ...editFilamentData, price: parseFloat(editFilamentData.price), grams: parseFloat(editFilamentData.grams) } : f);
    saveToDisk({ ...library, filaments: updated });
    setEditingFilamentId(null);
  };

  const handleRefillFilament = (id) => {
    const amount = window.prompt("Enter new weight (grams):", "1000");
    if (amount) {
      const updated = library.filaments.map(f => f.id === id ? { ...f, grams: parseFloat(amount) } : f);
      saveToDisk({ ...library, filaments: updated });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-12">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-3">
              <Settings className="text-blue-600" size={28} /> Studio Settings
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Configure your global rates and studio identity</p>
          </div>
        </div>

        {/* SECTION 1: STUDIO IDENTITY */}
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

        <hr className="border-slate-50" />

        {/* SECTION 2: GLOBAL RATES */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
            <DollarSign size={12} /> Financial Rates
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <Tooltip text="The estimated number of hours you spend printing per month. This is used to calculate the hourly cost of your subscriptions.">
              <InputBlock
                label="Monthly Printing Hours"
                type="number"
                value={library.monthlyPrintingHours}
                onChange={(val) => updateSetting('monthlyPrintingHours', parseFloat(val))}
              />
            </Tooltip>
          </div>
        </div>

        <hr className="border-slate-50" />

        {/* PRINTERS SECTION */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
            <Cpu size={12} /> Hardware Fleet
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
            <Tooltip text="A descriptive name for your 3D printer (e.g., Voron 2.4, Ender 3 Pro).">
              <input 
                placeholder="Printer Name (e.g. Voron 2.4)" 
                value={newPrinter.name} 
                onChange={(e) => setNewPrinter({...newPrinter, name: e.target.value})} 
                className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm col-span-1 lg:col-span-2" 
              />
            </Tooltip>
            <div className="flex items-center gap-2 px-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <Zap size={14} className="text-slate-400" />
              <Tooltip text="The maximum power your printer draws in Watts. This is used to calculate energy costs.">
                <input 
                  type="number" 
                  placeholder="Peak Power Consumption (Watts)" 
                  value={newPrinter.watts} 
                  onChange={(e) => setNewPrinter({...newPrinter, watts: e.target.value})} 
                  className="w-full py-4 bg-transparent outline-none font-bold text-sm" 
                />
              </Tooltip>
            </div>
            <div className="flex items-center gap-2 px-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <span className="text-slate-400 font-bold">$</span>
              <Tooltip text="The initial purchase cost of this printer. Used for calculating depreciation.">
                <input 
                  type="number" 
                  placeholder="Printer Cost" 
                  value={newPrinter.cost} 
                  onChange={(e) => setNewPrinter({...newPrinter, cost: e.target.value})} 
                  className="w-full py-4 bg-transparent outline-none font-bold text-sm" 
                />
              </Tooltip>
            </div>
            <div className="flex items-center gap-2 px-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <Tooltip text="The estimated total operational hours before this printer needs significant replacement or major repair. Used for calculating depreciation.">
                <input 
                  type="number" 
                  placeholder="Expected Hours of Life" 
                  value={newPrinter.hoursOfLife} 
                  onChange={(e) => setNewPrinter({...newPrinter, hoursOfLife: e.target.value})} 
                  className="w-full py-4 bg-transparent outline-none font-bold text-sm" 
                />
              </Tooltip>
            </div>
            <button onClick={handleAddPrinter} className="bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all col-span-1">
              Deploy Machine
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full mb-2">
            <HardDrive size={12} /> Active Hardware
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {library.printers.map((p) => (
              <div key={p.id} className="p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100 transition-all flex flex-col md:flex-row items-center justify-between">
                {editingId === p.id ? (
                  /* EDIT MODE */
                  <div className="flex flex-1 flex-col md:flex-row gap-3 items-center">
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
                      <button onClick={savePrinterEdit} className="p-3 bg-blue-600 text-white rounded-xl"><Check size={16}/></button>
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
                        <div className="flex items-center gap-3 mt-1.5">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                            <Zap size={10} /> {p.watts} Peak W Consumption
                          </p>
                          <span className="w-1 h-1 bg-slate-200 rounded-full" />
                          <p className="text-[10px] font-bold uppercase tracking-widest text-green-500">Online</p>
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

        <hr className="border-slate-50" />

        {/* FILAMENTS SECTION */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
            <FlaskConical size={12} /> Material Ledger
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            <Tooltip text="The brand or type of filament (e.g., Polymaker PLA, Hatchbox PETG).">
              <input placeholder="Brand (e.g. Polymaker)" value={newFilament.name} onChange={(e) => setNewFilament({...newFilament, name: e.target.value})} className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
            </Tooltip>
            <Tooltip text="The specific color of the filament (e.g., Galaxy Black, Azure Blue).">
              <input placeholder="Color Name" value={newFilament.colorName} onChange={(e) => setNewFilament({...newFilament, colorName: e.target.value})} className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
            </Tooltip>
            <div className="flex items-center gap-2 px-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <span className="text-slate-400 font-bold">$</span>
              <Tooltip text="The cost of the entire spool of filament in your local currency.">
                <input type="number" placeholder="Price" value={newFilament.price} onChange={(e) => setNewFilament({...newFilament, price: e.target.value})} className="w-full py-4 bg-transparent outline-none font-bold text-sm" />
              </Tooltip>
            </div>
            <div className="flex items-center gap-2 px-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <span className="text-slate-400 font-bold">g</span>
              <Tooltip text="The total weight of the filament spool in grams (e.g., 1000g, 750g).">
                <input type="number" placeholder="Weight" value={newFilament.grams} onChange={(e) => setNewFilament({...newFilament, grams: e.target.value})} className="w-full py-4 bg-transparent outline-none font-bold text-sm" />
              </Tooltip>
            </div>
            <button onClick={handleAddFilament} className="bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">
              Register Spool
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full mb-2">
            <Palette size={12} /> Current Inventory
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {library.filaments.map((f) => (
              <div key={f.id} className={`p-5 rounded-[2rem] border transition-all flex flex-col md:flex-row items-center justify-between ${f.grams < 100 ? 'border-red-100 bg-red-50/20' : 'bg-slate-50/50 border-slate-100'}`}>
                {editingFilamentId === f.id ? (
                  /* EDIT MODE */
                  <div className="flex flex-1 flex-col md:flex-row gap-3 items-center">
                    <Tooltip text="The brand or type of filament.">
                      <input className="flex-1 px-4 py-3 bg-white rounded-xl border font-bold text-sm outline-none" value={editFilamentData.name} onChange={e => setEditFilamentData({...editFilamentData, name: e.target.value})} />
                    </Tooltip>
                    <Tooltip text="The specific color of the filament.">
                      <input className="flex-1 px-4 py-3 bg-white rounded-xl border font-bold text-sm outline-none" value={editFilamentData.colorName} onChange={e => setEditFilamentData({...editFilamentData, colorName: e.target.value})} />
                    </Tooltip>
                    <Tooltip text="The visual color representation of the filament.">
                      <input type="color" className="w-10 h-10 border-none bg-transparent cursor-pointer" value={editFilamentData.color} onChange={e => setEditFilamentData({...editFilamentData, color: e.target.value})} />
                    </Tooltip>
                    <Tooltip text="The cost of the entire spool of filament in your local currency.">
                      <input type="number" className="w-20 px-4 py-3 bg-white rounded-xl border font-bold text-sm" value={editFilamentData.price} onChange={e => setEditFilamentData({...editFilamentData, price: e.target.value})} />
                    </Tooltip>
                    <div className="flex gap-1">
                      <button onClick={saveFilamentEdit} className="p-3 bg-blue-600 text-white rounded-xl"><Check size={16}/></button>
                      <button onClick={() => setEditingFilamentId(null)} className="p-3 bg-slate-200 text-slate-600 rounded-xl"><X size={16}/></button>
                    </div>
                  </div>
                ) : (
                  /* VIEW MODE */
                  <>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl shadow-inner border-4 border-white flex-shrink-0 relative" style={{ backgroundColor: f.color || '#3b82f6' }}>
                        {f.grams < 100 && <AlertCircle className="absolute -top-2 -right-2 text-red-500 bg-white rounded-full" size={16} />}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 uppercase text-xs leading-none">
                          {f.name} — <span className="text-blue-600">{f.colorName || 'No Color Name'}</span>
                        </h3>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mt-1.5 ${f.grams < 100 ? 'text-red-500' : 'text-slate-400'}`}>
                          ${f.price} / {f.grams.toFixed(0)}g Remaining
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleDuplicateFilament(f)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all"><Copy size={16} /></button>
                      <button onClick={() => handleRefillFilament(f.id)} className="p-3 text-slate-400 hover:text-green-600 hover:bg-white rounded-xl transition-all"><RefreshCw size={16} /></button>
                      <button onClick={() => setEditingFilamentId(f.id) || setEditFilamentData(f)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all"><Edit2 size={16} /></button>
                      <button onClick={() => library.filaments.length > 1 && saveToDisk({...library, filaments: library.filaments.filter(x => x.id !== f.id)})} className="p-3 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all"><Trash2 size={16} /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>


        <hr className="border-slate-50" />

        {/* SECTION 3: SYSTEM STATS */}
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
              <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Hardware</span>
              <span className="text-2xl font-black text-slate-800">{library.printers.length}</span>
            </div>
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-center">
              <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Next Quote</span>
              <span className="text-2xl font-black text-slate-800">#{library.nextQuoteNo}</span>
            </div>
          </div>
        </div>

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
                      printedParts: [],
                      inventory: []
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

        <hr className="border-slate-50" />

        <hr className="border-slate-50" />

        {/* FOOTER ACTION */}
        <div className="pt-6 flex gap-4">
          <button 
            onClick={handlePrint}
            className="w-full py-5 bg-white text-black border-2 border-black rounded-[2rem] font-black text-[10px] tracking-[0.2em] uppercase hover:bg-gray-200 transition shadow-xl"
          >
            Print Shop Data Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;