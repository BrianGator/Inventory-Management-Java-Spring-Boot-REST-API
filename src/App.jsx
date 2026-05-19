import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Store, 
  Package, 
  ClipboardList, 
  ShoppingCart, 
  MessageSquare, 
  BarChart3,
  Plus,
  Search,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// Tabs
import StoreTab from './components/StoreTab';
import ProductTab from './components/ProductTab';
import InventoryTab from './components/InventoryTab';
import OrderTab from './components/OrderTab';
import ReviewTab from './components/ReviewTab';
import AnalyticsTab from './components/AnalyticsTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('stores');

  const tabs = [
    { id: 'stores', label: 'Store Records', icon: Store },
    { id: 'products', label: 'Product Catalog', icon: Package },
    { id: 'inventory', label: 'Inventory Control', icon: ClipboardList },
    { id: 'orders', label: 'Order Entry', icon: ShoppingCart },
    { id: 'reviews', label: 'NoSQL Reviews', icon: MessageSquare },
    { id: 'analytics', label: 'Distribution Analytics', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar - High Density Aside */}
      <aside className="w-52 bg-slate-800 text-white flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-lg font-bold tracking-tight text-blue-400 uppercase leading-none">RMS Admin</h1>
          <p className="text-[10px] text-slate-400 italic mt-1 font-mono">Retail Distribution Hub</p>
        </div>
        
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700 bg-slate-900/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-[10px]">BM</div>
            <div className="text-[10px]">
              <p className="font-bold leading-none text-slate-200">Brian McCarthy</p>
              <p className="text-slate-500">Global Admin</p>
            </div>
          </div>
          <p className="text-[9px] text-slate-500 font-mono">v2.4.1-STABLE</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
              System Online
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
            <span>Last Sync: {new Date().toLocaleTimeString()}</span>
            <div className="w-px h-4 bg-slate-200 mx-1"></div>
            <span className="text-blue-600">Warehouse ID: 01-A</span>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 p-4 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {activeTab === 'stores' && <StoreTab />}
              {activeTab === 'products' && <ProductTab />}
              {activeTab === 'inventory' && <InventoryTab />}
              {activeTab === 'orders' && <OrderTab />}
              {activeTab === 'reviews' && <ReviewTab />}
              {activeTab === 'analytics' && <AnalyticsTab />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="bg-slate-800 text-white p-2 text-center text-[10px] shrink-0">
          <p>Retail Management Backend &copy; 2025 Warehouse distribution Hub. Written by Brian McCarthy.</p>
        </footer>
      </main>
    </div>
  );
}
