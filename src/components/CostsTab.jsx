import React, { useState } from 'react';
import { Plus, Trash, Edit, Check, X } from 'lucide-react';
import Tooltip from './Tooltip';

const CostsTab = ({ library, saveToDisk }) => {
  const [newSubscription, setNewSubscription] = useState({ name: '', cost: 0, interval: 'monthly' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleAdd = () => {
    if (!newSubscription.name) return;
    const updatedSubscriptions = [
      ...library.subscriptions,
      { ...newSubscription, id: Date.now(), cost: parseFloat(newSubscription.cost) }
    ];
    saveToDisk({ ...library, subscriptions: updatedSubscriptions });
    setNewSubscription({ name: '', cost: 0, interval: 'monthly' });
  };

  const saveEdit = () => {
    const updated = library.subscriptions.map(s =>
      s.id === editingId ? { ...editData, cost: parseFloat(editData.cost) } : s
    );
    saveToDisk({ ...library, subscriptions: updated });
    setEditingId(null);
  };

  const deleteSubscription = (id) => {
    const updated = library.subscriptions.filter(s => s.id !== id);
    saveToDisk({ ...library, subscriptions: updated });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Costs</h2>

      {/* Subscriptions Section */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-2">Software & Subscriptions</h3>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            <Plus size={14} /> Add Subscription
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Tooltip text="A descriptive name for your subscription (e.g., Patreon, Fusion 360).">
              <input
                placeholder="Subscription Name"
                value={newSubscription.name}
                onChange={(e) => setNewSubscription({ ...newSubscription, name: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </Tooltip>
            <Tooltip text="The cost of the subscription.">
              <input
                type="number"
                placeholder="Cost"
                value={newSubscription.cost}
                onChange={(e) => setNewSubscription({ ...newSubscription, cost: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </Tooltip>
            <Tooltip text="The billing interval for the subscription.">
              <select
                value={newSubscription.interval}
                onChange={(e) => setNewSubscription({ ...newSubscription, interval: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </Tooltip>
            <button onClick={handleAdd} className="bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-all">
              Add
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {library.subscriptions.map(sub => (
            <div key={sub.id} className="flex items-center justify-between p-2 border rounded-lg">
              {editingId === sub.id ? (
                <>
                  <input type="text" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} className="p-1 border rounded" />
                  <input type="number" value={editData.cost} onChange={e => setEditData({ ...editData, cost: e.target.value })} className="p-1 border rounded" />
                  <select value={editData.interval} onChange={e => setEditData({ ...editData, interval: e.target.value })} className="p-1 border rounded">
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                  </select>
                  <div className="flex gap-1">
                    <button onClick={saveEdit} className="p-2 bg-blue-600 text-white rounded-lg"><Check size={16} /></button>
                    <button onClick={() => setEditingId(null)} className="p-2 bg-slate-200 text-slate-600 rounded-lg"><X size={16} /></button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="font-bold">{sub.name}</span> - ${sub.cost} / {sub.interval}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingId(sub.id); setEditData(sub); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><Edit size={16} /></button>
                    <button onClick={() => deleteSubscription(sub.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg"><Trash size={16} /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CostsTab;
