import React, { useState, useEffect, useCallback } from 'react';
import {
  Link, Check, RefreshCw, Upload, LogOut,
  AlertCircle, Store, MapPin, Clock, Settings,
  ChevronDown
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const SquareIntegration = ({
  session,
  library,
  saveToDisk,
}) => {
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showOptions, setShowOptions] = useState(false);

  // Sync options
  const [syncOptions, setSyncOptions] = useState({
    linkToEvent: true,
    updateInventory: false,
  });

  // Check for connection status
  const checkConnection = useCallback(async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('square_connections')
        .select('merchant_id, merchant_name, location_id, location_name, last_sync_at')
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking connection:', error);
      }

      setConnection(data);
    } catch (err) {
      console.error('Connection check error:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    checkConnection();

    // Check for OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const squareConnected = urlParams.get('square_connected');
    const squareError = urlParams.get('square_error');

    if (squareConnected === 'true') {
      setSuccessMessage('Successfully connected to Square!');
      checkConnection();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (squareError) {
      setError(decodeURIComponent(squareError));
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [session, checkConnection]);

  const handleConnect = async () => {
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('square-auth-url');

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No authorization URL returned');
      }
    } catch (err) {
      console.error('Connect error:', err);
      setError(err.message || 'Failed to start connection');
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect from Square? This will stop syncing sales data.')) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke('square-disconnect');

      if (error) throw error;

      setConnection(null);
      setSuccessMessage('Disconnected from Square');
    } catch (err) {
      console.error('Disconnect error:', err);
      setError(err.message || 'Failed to disconnect');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setError(null);
    setSuccessMessage(null);
    setSyncing(true);

    try {
      const { data, error } = await supabase.functions.invoke('square-sync', {
        body: {
          action: 'pull',
          lastSyncTime: connection?.last_sync_at
        }
      });

      if (error) throw error;

      if (data?.transactions?.length > 0) {
        const existingSales = library.sales || [];

        // Build date-to-event lookup for auto-linking
        const events = library.events || [];
        const eventByDate = {};
        if (syncOptions.linkToEvent) {
          for (const event of events) {
            if (event.date) {
              const dateStr = new Date(event.date).toLocaleDateString();
              eventByDate[dateStr] = event.id;
            }
          }
        }

        // Convert Square transactions to sale records
        const newSales = data.transactions
          .filter(t => !existingSales.some(s => s.squareOrderId === t.squareOrderId))
          .map(t => {
            const saleDate = new Date(t.date).toLocaleDateString();
            return {
              id: `sale-sq-${t.squareOrderId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              date: saleDate,
              itemName: t.name,
              quantity: t.quantity || 1,
              unitPrice: t.unitPrice,
              total: (t.quantity || 1) * t.unitPrice,
              paymentMethod: 'square',
              eventId: eventByDate[saleDate] || null,
              inventoryId: null,
              squareOrderId: t.squareOrderId,
              squareSource: true,
              notes: 'Imported from Square',
            };
          });

        if (newSales.length > 0) {
          let updatedLibrary = { ...library, sales: [...newSales, ...existingSales] };

          // Auto-decrement inventory quantities
          if (syncOptions.updateInventory && library.printedParts?.length > 0) {
            const updatedParts = [...library.printedParts];
            let decrementedCount = 0;

            for (const sale of newSales) {
              const txName = sale.itemName?.toLowerCase();
              const txQty = sale.quantity || 1;

              const matchIdx = updatedParts.findIndex(p =>
                (txName && p.name?.toLowerCase() === txName)
              );

              if (matchIdx !== -1) {
                updatedParts[matchIdx] = {
                  ...updatedParts[matchIdx],
                  qty: Math.max(0, (updatedParts[matchIdx].qty || 0) - txQty),
                };
                decrementedCount++;
              }
            }

            if (decrementedCount > 0) {
              updatedLibrary = { ...updatedLibrary, printedParts: updatedParts };
            }
          }

          saveToDisk(updatedLibrary);

          const inventoryMsg = syncOptions.updateInventory
            ? (() => {
                const matched = newSales.filter(sale => {
                  const txName = sale.itemName?.toLowerCase();
                  return library.printedParts?.some(p =>
                    txName && p.name?.toLowerCase() === txName
                  );
                }).length;
                return matched > 0 ? `, updated inventory for ${matched} item(s)` : '';
              })()
            : '';
          const linkedCount = newSales.filter(s => s.eventId).length;
          const eventMsg = linkedCount > 0 ? `, linked ${linkedCount} to events` : '';
          setSuccessMessage(`Imported ${newSales.length} new sale(s) from Square${inventoryMsg}${eventMsg}`);
        } else {
          setSuccessMessage('No new transactions to import');
        }
      } else {
        setSuccessMessage('No transactions found');
      }

      // Refresh connection to update last_sync_at
      checkConnection();
    } catch (err) {
      console.error('Sync error:', err);
      setError(err.message || 'Failed to sync');
    } finally {
      setSyncing(false);
    }
  };

  const handlePushInventory = async () => {
    setError(null);
    setSuccessMessage(null);
    setPushing(true);

    try {
      // Get printedParts to push
      const itemsToPush = library.printedParts.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        unitPrice: p.unitPrice || p.priceByProfitMargin,
        squareCatalogId: p.squareCatalogId,
        squareVariationId: p.squareVariationId,
      }));

      if (itemsToPush.length === 0) {
        setSuccessMessage('No inventory items to push');
        setPushing(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('square-sync', {
        body: {
          action: 'push',
          items: itemsToPush
        }
      });

      if (error) throw error;

      // Update local items with Square IDs
      if (data?.pushResults) {
        const updatedParts = library.printedParts.map(p => {
          const result = data.pushResults.find(r => r.id === p.id);
          if (result?.success) {
            return {
              ...p,
              squareCatalogId: result.squareCatalogId,
              squareVariationId: result.squareVariationId,
            };
          }
          return p;
        });

        saveToDisk({ ...library, printedParts: updatedParts });

        const successCount = data.pushResults.filter(r => r.success).length;
        const failCount = data.pushResults.filter(r => !r.success).length;

        if (failCount > 0) {
          setSuccessMessage(`Pushed ${successCount} item(s), ${failCount} failed`);
        } else {
          setSuccessMessage(`Successfully pushed ${successCount} item(s) to Square`);
        }
      }
    } catch (err) {
      console.error('Push error:', err);
      setError(err.message || 'Failed to push inventory');
    } finally {
      setPushing(false);
    }
  };

  const formatLastSync = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  if (!session) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
            <Link size={12} /> Square POS
          </div>
        </div>
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <p className="text-sm text-slate-500">Sign in to connect your Square account</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
          <Link size={12} /> Square POS
        </div>
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <RefreshCw size={20} className="animate-spin mx-auto text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
          <Link size={12} /> Square POS
        </div>
        {connection && (
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <Check size={12} /> Connected
          </div>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600">
          <AlertCircle size={16} />
          <span className="text-sm font-medium">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-600">
          <Check size={16} />
          <span className="text-sm font-medium">{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-auto text-green-400 hover:text-green-600"
          >
            ×
          </button>
        </div>
      )}

      {connection ? (
        /* Connected State */
        <div className="space-y-4">
          {/* Connection Info */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center gap-3">
              <Store size={16} className="text-slate-400" />
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Merchant</p>
                <p className="font-bold text-slate-800">{connection.merchant_name || connection.merchant_id}</p>
              </div>
            </div>
            {connection.location_name && (
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-slate-400" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                  <p className="font-bold text-slate-800">{connection.location_name}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-slate-400" />
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Sync</p>
                <p className="font-bold text-slate-800">{formatLastSync(connection.last_sync_at)}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing...' : 'Sync Sales'}
            </button>
            <button
              onClick={handlePushInventory}
              disabled={pushing}
              className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              <Upload size={14} className={pushing ? 'animate-pulse' : ''} />
              {pushing ? 'Pushing...' : 'Push Inventory'}
            </button>
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all"
            >
              <LogOut size={14} />
              Disconnect
            </button>
          </div>

          {/* Sync Options */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-all"
            >
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
                <Settings size={12} /> Sync Options
              </div>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform ${showOptions ? 'rotate-180' : ''}`}
              />
            </button>
            {showOptions && (
              <div className="p-4 border-t border-slate-100 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncOptions.linkToEvent}
                    onChange={(e) => setSyncOptions({ ...syncOptions, linkToEvent: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Auto-link sales to events by matching date</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncOptions.updateInventory}
                    onChange={(e) => setSyncOptions({ ...syncOptions, updateInventory: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Update inventory quantities from Square</span>
                </label>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Disconnected State */
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-4">
          <p className="text-sm text-slate-600">
            Connect your Square account to sync sales and inventory automatically.
          </p>
          <button
            onClick={handleConnect}
            className="inline-flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all"
          >
            <Link size={14} />
            Connect to Square
          </button>
        </div>
      )}
    </div>
  );
};

export default SquareIntegration;
