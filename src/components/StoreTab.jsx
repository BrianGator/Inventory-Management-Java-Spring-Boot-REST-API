/**
 * Written by Brian McCarthy
 */
import { useState, useEffect } from 'react';
import { Plus, Store as StoreIcon, MapPin, RefreshCw } from 'lucide-react';

export default function StoreTab() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newStore, setNewStore] = useState({ name: '', address: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/stores');
      const data = await res.json();
      setStores(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleAddStore = async (e) => {
    e.preventDefault();
    if (!newStore.name || !newStore.address) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStore),
      });
      if (res.ok) {
        setNewStore({ name: '', address: '' });
        fetchStores();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Store Form - Dense Header Style */}
      <section className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <Plus size={14} className="text-blue-600" />
            Provision Store Location
          </h2>
        </div>
        <form onSubmit={handleAddStore} className="p-3 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Store Name</label>
            <input
              type="text"
              value={newStore.name}
              onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
              className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              placeholder="e.g. Downtown Hub"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Address</label>
            <input
              type="text"
              value={newStore.address}
              onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
              className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              placeholder="Full address"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white text-xs font-bold py-1.5 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {submitting ? 'PROCESSING...' : 'ADD RECORD'}
          </button>
        </form>
      </section>

      {/* Stores List - High Density Cards */}
      <section>
        <div className="flex justify-between items-center mb-2 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Registered Locations</h2>
          <button 
            onClick={fetchStores}
            className="text-slate-400 hover:text-blue-600 transition-all"
            title="Refresh Registry"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-8 bg-white border border-slate-200 rounded">
            <RefreshCw className="animate-spin text-blue-600" size={24} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {stores.map((store) => (
              <div key={store.id} className="bg-white p-3 rounded border border-slate-200 shadow-sm hover:border-slate-400 transition-colors group">
                <div className="flex items-start gap-3">
                  <div className="bg-slate-100 p-2 rounded group-hover:bg-blue-50 transition-colors">
                    <StoreIcon size={16} className="text-slate-500 group-hover:text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-800 truncate">{store.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin size={10} className="text-slate-400 shrink-0" />
                      <p className="text-[10px] text-slate-500 truncate italic">{store.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {stores.length === 0 && (
              <div className="col-span-full bg-slate-50 border border-slate-200 rounded p-6 text-center text-xs text-slate-400 italic">
                Registry is empty. Use the form above to add store records.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
