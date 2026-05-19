/**
 * Written by Brian McCarthy
 */
import { useState, useEffect } from 'react';
import { MessageSquare, Star, Plus, RefreshCw, User, Package } from 'lucide-react';

export default function ReviewTab() {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [newReview, setNewReview] = useState({ 
    customerId: 'guest_admin', 
    productId: '', 
    storeId: '', 
    rating: 5, 
    comment: '' 
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, sRes] = await Promise.all([
          fetch('/api/v1/products'),
          fetch('/api/v1/stores')
        ]);
        const [pData, sData] = await Promise.all([pRes.json(), sRes.json()]);
        setProducts(pData);
        setStores(sData);
        if (pData.length > 0) setSelectedProduct(pData[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const fetchReviews = async (pid) => {
    if (!pid) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/reviews/${pid}`);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProduct) fetchReviews(selectedProduct);
  }, [selectedProduct]);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newReview.productId || !newReview.storeId) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview),
      });
      if (res.ok) {
        setNewReview({ ...newReview, comment: '', rating: 5 });
        fetchReviews(newReview.productId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Left Sidebar: Controls & Post */}
      <div className="lg:col-span-1 space-y-4">
        <section className="bg-white p-3 rounded border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50 mb-3">
             <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
              <Package size={12} className="text-blue-500" />
              Manifest Filter
            </h2>
          </div>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-bold"
          >
            <option value="">All Catalog Products</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </section>

        <section className="bg-slate-800 text-white p-4 rounded border border-slate-700 shadow-lg">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
            <Plus size={12} />
            Insert MongoDB Document
          </h2>
          <form onSubmit={handleAddReview} className="space-y-3 font-mono text-[11px]">
            <div>
              <label className="block text-slate-500 mb-1">item_id</label>
              <select
                value={newReview.productId}
                onChange={(e) => setNewReview({ ...newReview, productId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-blue-300 focus:outline-none"
                required
              >
                <option value="">null</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-500 mb-1">store_ref</label>
              <select
                value={newReview.storeId}
                onChange={(e) => setNewReview({ ...newReview, storeId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-blue-300 focus:outline-none"
                required
              >
                <option value="">null</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-500 mb-1">rating_value</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: num })}
                    className={`p-1.5 rounded transition-all ${
                      newReview.rating >= num ? 'text-amber-400 bg-slate-700' : 'text-slate-600 bg-slate-900 border border-slate-800'
                    }`}
                  >
                    <Star size={14} fill={newReview.rating >= num ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-slate-500 mb-1">comment_body</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-300 focus:outline-none min-h-[80px]"
                placeholder="String value..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white font-black py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-slate-700 uppercase tracking-widest text-[10px]"
            >
              {submitting ? 'EXECUTING...' : 'DB.insert_json()'}
            </button>
          </form>
        </section>
      </div>

      {/* Main Area: Review Cards */}
      <div className="lg:col-span-3 space-y-3 flex flex-col h-full min-h-0">
        <div className="px-1 flex justify-between items-center mb-1">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
            <MessageSquare size={12} className="text-blue-600" />
            Unstructured Feedback Stream
          </h2>
          <span className="text-[10px] font-mono text-slate-400 italic">Total Documents: {reviews.length}</span>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {loading ? (
            <div className="flex justify-center p-12 bg-white rounded border border-slate-200">
              <RefreshCw className="animate-spin text-blue-600" size={24} />
            </div>
          ) : (
            <>
              {reviews.map((review) => (
                <div key={review.id} className="bg-white p-4 rounded border border-slate-200 shadow-sm border-l-4 border-l-blue-500">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-100 p-1.5 rounded text-slate-500">
                        <User size={14} />
                      </div>
                      <div className="text-[11px] font-bold text-slate-900 leading-none">{review.customerId}</div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          size={12} 
                          className={star <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-relaxed italic border-l border-slate-100 pl-3">
                    "{review.comment || 'Empty feedback document content.'}"
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-50 flex justify-between items-center text-[9px] font-mono text-slate-400 uppercase">
                    <span>PID_{review.productId?.slice(0,8)}</span>
                    <span className="bg-slate-50 px-1.5 py-0.5 rounded">Store_{stores.find(s => s.id === review.storeId)?.name.replace(/\s/g, '_')}</span>
                  </div>
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="bg-slate-100 border-2 border-dashed border-slate-200 rounded p-12 text-center text-slate-400 text-xs italic">
                    Query returned 0 results. Document collection is empty.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
