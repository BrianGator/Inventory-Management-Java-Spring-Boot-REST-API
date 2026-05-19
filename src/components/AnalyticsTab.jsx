/**
 * Written by Brian McCarthy
 */
import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, ShoppingBag, Store, Search, Filter } from 'lucide-react';

export default function AnalyticsTab() {
  const [year, setYear] = useState('2025');
  const [month, setMonth] = useState('3');
  const [loading, setLoading] = useState(false);
  
  const [monthlySales, setMonthlySales] = useState([]);
  const [companyTotal, setCompanyTotal] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  
  const [stores, setStores] = useState({});

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch('/api/v1/stores');
        const data = await res.json();
        const map = {};
        data.forEach((s) => map[s.id] = s.name);
        setStores(map);
      } catch (err) { console.error(err); }
    };
    fetchStores();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [mRes, cRes, tRes] = await Promise.all([
        fetch(`/api/v1/analytics/monthly-sales-by-store?year=${year}&month=${month}`),
        fetch(`/api/v1/analytics/total-company-sales?year=${year}&month=${month}`),
        fetch(`/api/v1/analytics/top-selling-products?limitCount=8&year=${year}`)
      ]);
      
      const [mData, cData, tData] = await Promise.all([
        mRes.json(),
        cRes.json(),
        tRes.json()
      ]);
      
      setMonthlySales(mData);
      setCompanyTotal(cData);
      setTopProducts(tData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [year, month]);

  return (
    <div className="space-y-4">
      {/* Analytics Controls - Dense Panel */}
      <section className="bg-slate-800 text-white px-4 py-3 rounded border border-slate-700 shadow-lg flex items-center gap-6 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-4">
           <BarChart3 size={18} className="text-blue-400" />
           <div className="w-px h-8 bg-slate-700"></div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Year</label>
            <select 
              value={year} 
              onChange={e => setYear(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-blue-500 font-bold text-blue-300"
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Month</label>
            <select 
              value={month} 
              onChange={e => setMonth(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-blue-500 font-bold text-blue-300"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'short' })}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-grow"></div>
        
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Gross Sales (MTD)</p>
            <p className="text-xl font-black text-white leading-none">${companyTotal?.total_sales?.toLocaleString() || '0'}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Store_Nodes</p>
            <p className="text-xl font-black text-green-400 leading-none">{monthlySales.length}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales by Store - Dense Table */}
        <section className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
              <Store size={12} className="text-blue-600" />
              Node Sales Breakdown
            </h2>
            <span className="text-[10px] font-mono text-slate-400">CALL.getSalesByStore()</span>
          </div>
          <div className="overflow-auto border-box flex-1 min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-tight text-[9px] sticky top-0 bg-white">
                <tr>
                  <th className="px-3 py-1.5 border-b border-r border-slate-100">Origin Node (Store Name)</th>
                  <th className="px-3 py-1.5 border-b border- slate-100 text-right">Revenue (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {monthlySales.map(item => (
                  <tr key={item.store_id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-3 py-1.5 border-r border-slate-100">
                      <div className="font-bold text-slate-800">{stores[item.store_id] || 'NODE_UNKNOWN'}</div>
                      <div className="text-[9px] font-mono text-slate-400 uppercase">UUID: {item.store_id.slice(0, 12)}</div>
                    </td>
                    <td className="px-3 py-1.5 text-right font-black text-blue-600">
                      ${item.total_sales.toLocaleString()}
                      <div className="w-full bg-slate-100 h-1 mt-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${Math.min((item.total_sales / (companyTotal?.total_sales || 1)) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
                {monthlySales.length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-20 text-center text-slate-300 italic font-medium">Record set empty for selected period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Top Products - Dense Table */}
        <section className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
              <ShoppingBag size={12} className="text-blue-600" />
              SKU Velocity Ranking
            </h2>
            <span className="text-[10px] font-mono text-slate-400">CALL.getTopSKUs()</span>
          </div>
          <div className="overflow-auto border-box flex-1 min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-tight text-[9px] sticky top-0 bg-white">
                <tr>
                  <th className="px-3 py-1.5 border-b border-r border-slate-100">Product / Category</th>
                  <th className="px-3 py-1.5 border-b border-r border-slate-100 text-center w-16">Qty</th>
                  <th className="px-3 py-1.5 border-b border-slate-100 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {topProducts.map((p, i) => (
                  <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-3 py-1.5 border-r border-slate-100">
                      <div className="font-bold text-slate-800">{p.name}</div>
                      <div className="text-[9px] text-slate-400 uppercase tracking-tighter">{p.category}</div>
                    </td>
                    <td className="px-3 py-1.5 border-r border-slate-100 text-center font-mono font-medium text-slate-500">
                      {p.total_quantity_sold}
                    </td>
                    <td className="px-3 py-1.5 text-right font-black text-slate-800">
                      ${p.total_sales.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {topProducts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-20 text-center text-slate-300 italic font-medium">No SKU velocity data recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
