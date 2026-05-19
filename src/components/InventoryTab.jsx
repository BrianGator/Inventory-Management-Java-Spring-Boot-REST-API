/**
 * Written by Brian McCarthy
 */
import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Store as StoreIcon, AlertTriangle } from 'lucide-react';

export default function InventoryTab() {
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // New Stock Form
  const [newStock, setNewStock] = useState({ productId: '', stockLevel: 0 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, pRes] = await Promise.all([
          fetch('/api/v1/stores'),
          fetch('/api/v1/products')
        ]);
        const [sData, pData] = await Promise.all([sRes.json(), pRes.json()]);
        setStores(sData);
        setProducts(pData);
        if (sData.length > 0) setSelectedStore(sData[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const fetchInventory = async (storeId) => {
    if (!storeId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/inventory/${storeId}`);
      const data = await res.json();
      setInventory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStore) fetchInventory(selectedStore);
  }, [selectedStore]);

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!selectedStore || !newStock.productId) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newStock, storeId: selectedStore }),
      });
      if (res.ok) {
        setNewStock({ productId: '', stockLevel: 0 });
        fetchInventory(selectedStore);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getProductName = (pid) => products.find(p => p.id === pid)?.name || 'Unknown';
  const getProductSku = (pid) => products.find(p => p.id === pid)?.sku || 'N/A';

  return (
    <div className="space-y-4">
      {/* Store Selector - Small & Functional */}
      <div className="flex items-center gap-3 bg-white px-3 py-2 rounded border border-slate-200 shadow-sm shrink-0">
        <StoreIcon size={14} className="text-blue-600" />
        <span className="text-[11px] font-bold uppercase tracking-tight text-slate-500">Target Hub:</span>
        <select
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-bold"
        >
          {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
        {/* Update Stock - Side Terminal Style */}
        <div className="lg:col-span-1">
          <section className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Plus size={12} className="text-blue-500" />
                Adjustment Buffer
              </h2>
            </div>
            <form onSubmit={handleAddStock} className="p-3 space-y-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">SKU Selection</label>
                <select
                  value={newStock.productId}
                  onChange={(e) => setNewStock({ ...newStock, productId: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Choose product...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.sku} | {p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Delta Quantity</label>
                <input
                  type="number"
                  value={newStock.stockLevel}
                  onChange={(e) => setNewStock({ ...newStock, stockLevel: parseInt(e.target.value) })}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-800 text-blue-400 text-[10px] font-bold py-1.5 rounded hover:bg-slate-700 transition-colors disabled:bg-slate-900 border border-slate-600 font-mono"
              >
                {submitting ? 'EXECUTING...' : 'CALL.update_stock()'}
              </button>
            </form>
            <div className="mt-auto p-3 bg-slate-800/5 border-t border-slate-100 italic text-[10px] text-slate-400 flex items-center gap-2">
              <AlertTriangle size={12} className="shrink-0" />
              Manual stock overrides are logged to security audit.
            </div>
          </section>
        </div>

        {/* Inventory List - Dense Table */}
        <div className="lg:col-span-3">
          <section className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                <ClipboardList size={12} className="text-blue-600" />
                Live Stock Manifest
              </h2>
              <span className="text-[9px] font-mono bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded leading-none">
                STORE_ID: {selectedStore?.slice(0, 8)}
              </span>
            </div>
            
            <div className="overflow-auto border-box">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 sticky top-0 bg-white">
                  <tr>
                    <th className="px-3 py-2 border-b border-r border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                    <th className="px-3 py-2 border-b border-r border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU</th>
                    <th className="px-3 py-2 border-b border-r border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center italic">Count</th>
                    <th className="px-3 py-2 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {inventory.map((item) => {
                    const lowStock = item.stockLevel < 10;
                    return (
                      <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-3 py-1.5 border-r border-slate-50 font-bold text-slate-800">{getProductName(item.productId)}</td>
                        <td className="px-3 py-1.5 border-r border-slate-50 text-slate-500 font-mono">{getProductSku(item.productId)}</td>
                        <td className="px-3 py-1.5 border-r border-slate-50 text-center font-bold">
                          <span className={lowStock ? 'text-red-600' : 'text-slate-700'}>{item.stockLevel}</span>
                        </td>
                        <td className="px-3 py-1.5 text-right">
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            lowStock ? 'bg-red-100 text-red-700 underline decoration-red-300 underline-offset-2' : 'bg-green-100 text-green-700'
                          }`}>
                            {lowStock ? 'Critical Level' : 'Available'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {inventory.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-10 text-center text-[11px] text-slate-400 italic">
                        No product allocations found for this store.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
