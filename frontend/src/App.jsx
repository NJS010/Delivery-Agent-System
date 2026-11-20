import { useState, useEffect, useCallback } from 'react';
import api from './api/client';
import Navbar from './components/Navbar';
import CustomerPortal from './components/CustomerPortal';
import AdminLogin from './components/AdminLogin';
import AdminOperations from './components/AdminOperations';
import CourierManager from './components/CourierManager';

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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        token={token}
        onLogout={handleLogout}
      />

      <main className="max-w-6xl mx-auto px-6 py-8">
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

        {activeTab === 'customer' && (
          <CustomerPortal couriers={couriers} notify={notify} />
        )}

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
  );
}
