/**
 * Written by Brian McCarthy
 */
import { useState, useEffect } from 'react';
import { ShoppingCart, User, Plus, Trash2, CheckCircle2, Store as StoreIcon } from 'lucide-react';

export default function OrderTab() {
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedStore, setSelectedStore] = useState('');
  
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [orderItems, setOrderItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const addItem = () => {
    setOrderItems([...orderItems, { productId: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateItem = (index, pid) => {
    const product = products.find(p => p.id === pid);
    const newItems = [...orderItems];
    newItems[index] = { 
      ...newItems[index], 
      productId: pid, 
      price: product ? product.price : 0 
    };
    setOrderItems(newItems);
  };

  const updateQuantity = (index, qty) => {
    const newItems = [...orderItems];
    newItems[index].quantity = qty;
    setOrderItems(newItems);
  };

  const totalPrice = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (orderItems.length === 0 || !selectedStore) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          storeId: selectedStore,
          items: orderItems,
          totalPrice
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setOrderItems([]);
        setCustomer({ name: '', email: '', phone: '' });
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Dense Header */}
        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
            <ShoppingCart className="text-blue-600" size={14} />
            Direct Order Entry
          </h2>
          {success && (
            <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold px-2 py-0.5 rounded bg-green-100 border border-green-200">
              <CheckCircle2 size={12} />
              ENTRY_RECORD_SAVED
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Left: Metadata */}
            <div className="md:col-span-1 space-y-4">
               <div>
                  <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">
                    Store Reference
                  </h3>
                  <select
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none font-bold"
                    required
                  >
                    <option value="">Select origin...</option>
                    {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4 mb-2 border-b border-slate-100 pb-1">
                    Customer Entity
                  </h3>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={customer.name}
                    onChange={e => setCustomer({...customer, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none placeholder:italic"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={customer.email}
                    onChange={e => setCustomer({...customer, email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none placeholder:italic"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Mobile No"
                    value={customer.phone}
                    onChange={e => setCustomer({...customer, phone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none placeholder:italic"
                    required
                  />
                </div>
            </div>

            {/* Right: Line Items Table */}
            <div className="md:col-span-3 min-h-0 flex flex-col">
              <div className="flex justify-between items-center mb-2 px-1">
                 <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Order Line Items</h3>
                 <button 
                  type="button" 
                  onClick={addItem}
                  className="text-[9px] bg-slate-800 text-white px-2 py-0.5 rounded hover:bg-slate-700 transition-all font-mono"
                >
                  ADD_FIELD()
                </button>
              </div>

              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-[11px] border-collapse">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-tight">
                    <tr>
                      <th className="px-3 py-1.5 border-b border-r border-slate-200">Product Name / ID</th>
                      <th className="px-3 py-1.5 border-b border-r border-slate-200 text-center w-20">Qty</th>
                      <th className="px-3 py-1.5 border-b border-r border-slate-200 text-right w-24">Price</th>
                      <th className="px-3 py-1.5 border-b border-slate-200 text-right w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orderItems.map((item, index) => (
                      <tr key={index} className="bg-white">
                        <td className="px-3 py-1.5 border-r border-slate-100">
                          <select
                            value={item.productId}
                            onChange={(e) => updateItem(index, e.target.value)}
                            className="w-full bg-transparent border-none text-[11px] h-6 focus:outline-none font-medium"
                            required
                          >
                            <option value="">Select item...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} (ID: {p.id.slice(0,4)})</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-1.5 border-r border-slate-100">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={e => updateQuantity(index, parseInt(e.target.value))}
                            className="w-full bg-transparent border-none text-center h-6 focus:outline-none"
                            required
                          />
                        </td>
                        <td className="px-3 py-1.5 border-r border-slate-100 text-right font-bold text-slate-700">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td className="px-3 py-1.5 text-center">
                          <button 
                            type="button" 
                            onClick={() => removeItem(index)}
                            className="text-slate-300 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {orderItems.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400 italic bg-white">
                          Order batch is empty.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Order Summation */}
              <div className="mt-4 p-3 bg-slate-800 text-blue-400 rounded flex justify-between items-center border border-slate-700 shadow-inner">
                <div className="font-mono text-[10px]">
                  <p className="opacity-50 uppercase">Order.aggregate_sum</p>
                  <p className="text-xl font-black">${totalPrice.toFixed(2)}</p>
                </div>
                <button
                  type="submit"
                  disabled={submitting || orderItems.length === 0}
                  className="bg-blue-600 text-white text-xs font-black px-6 py-2 rounded hover:bg-blue-500 transition-all disabled:bg-slate-700 disabled:text-slate-500 uppercase tracking-widest"
                >
                  {submitting ? 'EXECUTING...' : 'CONFIRM_ENTRY'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
