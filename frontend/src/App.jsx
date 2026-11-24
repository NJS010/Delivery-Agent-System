import { useState, useEffect, useCallback } from 'react';
import { Menu } from 'lucide-react';
import api from './api/client';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import CustomerPortal from './components/CustomerPortal';
import AdminLogin from './components/AdminLogin';
import AdminOperations from './components/AdminOperations';
import CourierManager from './components/CourierManager';

const PAGE_META = {
  customer: { title: 'Dispatch & Tracking', subtitle: 'Book shipments and monitor live delivery status' },
  admin: { title: 'Operations Console', subtitle: 'Manage active orders, SLAs, rewards, and archives' },
  couriers: { title: 'Courier Network', subtitle: 'Onboard logistics partners and review performance' },
};

export default function App() {
  const [activeTab, setActiveTab] = useState('customer');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '');
  const [couriers, setCouriers] = useState([]);
  const [toast, setToast] = useState(null);

  const notify = useCallback((text, type = 'info') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadCouriers = useCallback(async () => {
    try {
      const { data } = await api.get('/couriers');
      setCouriers(data);
    } catch {
      notify('Failed to load couriers', 'error');
    }
  }, [notify]);

  useEffect(() => {
    loadCouriers();
  }, [loadCouriers]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('adminToken');
    setToken('');
    notify('Signed out');
  }, [notify]);

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-900">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        token={token}
        onLogout={handleLogout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">{PAGE_META[activeTab].title}</h1>
              <p className="text-xs text-slate-500 hidden sm:block">{PAGE_META[activeTab].subtitle}</p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
            v1.0 · Live
          </span>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          {activeTab === 'customer' && <CustomerPortal couriers={couriers} notify={notify} />}
          {(activeTab === 'admin' || activeTab === 'couriers') && !token && (
            <AdminLogin onSuccess={setToken} notify={notify} />
          )}
          {activeTab === 'admin' && token && <AdminOperations onAuthError={handleLogout} notify={notify} />}
          {activeTab === 'couriers' && token && (
            <CourierManager couriers={couriers} onCourierAdded={loadCouriers} notify={notify} />
          )}
        </main>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}