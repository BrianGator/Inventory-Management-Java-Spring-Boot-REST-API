/**
 * Written by Brian McCarthy
 */
import { useState, useEffect } from 'react';
import { Plus, Package, Tag, Trash2, Search } from 'lucide-react';

export default function ProductTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: 0, sku: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      if (res.ok) {
        setNewProduct({ name: '', category: '', price: 0, sku: '' });
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetch(`/api/v1/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Add Product Form - High Density */}
      <section className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <Plus size={14} className="text-blue-600" />
            Catalog Entry
          </h2>
        </div>
        <form onSubmit={handleAddProduct} className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div className="lg:col-span-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Name</label>
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
            <select
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              required
            >
              <option value="">Select Category</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Furniture">Furniture</option>
              <option value="Groceries">Groceries</option>
              <option value="Mobile">Mobile</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
              className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">SKU</label>
            <input
              type="text"
              value={newProduct.sku}
              onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
              className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white text-xs font-bold py-1.5 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {submitting ? 'SYNCING...' : 'ADD RECORD'}
          </button>
        </form>
      </section>

      {/* Catalog Table - Dense Style */}
      <section className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <Package size={14} />
            Master Catalog
          </h2>
          <div className="relative w-48">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search SKU/Name..."
              className="w-full pl-7 pr-2 py-1 bg-white border border-slate-200 rounded text-[11px] focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 border-b border-r border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50/80">Product Name</th>
                <th className="px-3 py-2 border-b border-r border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50/80">Category</th>
                <th className="px-3 py-2 border-b border-r border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50/80">SKU</th>
                <th className="px-3 py-2 border-b border-r border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50/80">Price</th>
                <th className="px-3 py-2 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50/80 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors text-[11px]">
                  <td className="px-3 py-1.5 border-r border-slate-100 font-bold text-slate-800">{product.name}</td>
                  <td className="px-3 py-1.5 border-r border-slate-100">
                    <span className="text-[10px] font-mono text-slate-500">{product.category}</span>
                  </td>
                  <td className="px-3 py-1.5 border-r border-slate-100 text-slate-500">{product.sku}</td>
                  <td className="px-3 py-1.5 border-r border-slate-100 font-bold">${product.price?.toFixed(2)}</td>
                  <td className="px-3 py-1.5 text-right">
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="text-slate-300 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-[11px] text-slate-400 italic bg-white">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 text-[9px] text-slate-400 text-center italic">
          Showing {filteredProducts.length} entries in Master Registry
        </div>
      </section>
    </div>
  );
}
