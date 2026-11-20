import { useState, useEffect, useCallback } from 'react';
import api from './api/client';
import Sidebar from './components/Sidebar';
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
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">{PAGE_META[activeTab].title}</h1>
            <p className="text-xs text-slate-500">{PAGE_META[activeTab].subtitle}</p>
          </div>
          <span className="text-xs font-mono text-slate-400">CS311 · P03</span>
        </header>

        <main className="flex-1 p-8">
          {toast && (
            <div
              className={`mb-6 px-4 py-3 rounded-lg border text-sm font-medium ${
                toast.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : toast.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}
            >
              {toast.text}
            </div>
          )}

          {activeTab === 'customer' && <CustomerPortal couriers={couriers} notify={notify} />}

          {(activeTab === 'admin' || activeTab === 'couriers') && !token && (
            <AdminLogin onSuccess={setToken} notify={notify} />
          )}

          {activeTab === 'admin' && token && (
            <AdminOperations onAuthError={handleLogout} notify={notify} />
          )}

          {activeTab === 'couriers' && token && (
            <CourierManager couriers={couriers} onCourierAdded={loadCouriers} notify={notify} />
          )}
        </main>
      </div>
    </div>
  );
}
