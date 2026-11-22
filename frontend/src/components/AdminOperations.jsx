import { useState, useEffect, useCallback } from 'react';
import { Search, Activity, IndianRupee, CheckCircle, Award } from 'lucide-react';
import api from '../api/client';
import KpiCard from './KpiCard';
import OrdersTable from './OrdersTable';

const STATUS_FILTERS = ['ALL', 'Booked', 'Rescheduled', 'Delivered', 'Cancelled'];

export default function AdminOperations({ onAuthError, notify }) {
  const [deliveries, setDeliveries] = useState([]);
  const [stats, setStats] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        api.get('/deliveries', { params: { archived: showArchived, status: statusFilter, search, page, limit: 8 } }),
        api.get('/deliveries/stats'),
      ]);
      setDeliveries(ordersRes.data.items);
      setPagination(ordersRes.data.pagination);
      setStats(statsRes.data);
    } catch (err) {
      if ([400, 401].includes(err.response?.status)) onAuthError();
    } finally {
      setLoading(false);
    }
  }, [showArchived, statusFilter, search, page, onAuthError]);

  useEffect(() => {
    const timer = setTimeout(loadData, 250);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleComplete = async (id, onTime) => {
    try {
      const { data } = await api.put(`/deliveries/${id}/complete`, { onTime });
      notify(data.message, 'success');
      loadData();
    } catch (err) {
      notify(err.response?.data?.error || 'Action failed', 'error');
    }
  };

  const handleArchive = async (id) => {
    try {
      await api.put(`/deliveries/${id}/archive`);
      notify('Order moved to archive', 'success');
      loadData();
    } catch (err) {
      notify(err.response?.data?.error || 'Archive failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Active Shipments" value={stats.activeOrders} icon={Activity} iconBg="bg-blue-50 text-blue-600" />
          <KpiCard label="On-Time SLA" value={`${stats.slaRate}%`} icon={CheckCircle} iconBg="bg-emerald-50 text-emerald-600" valueClass="text-emerald-600" />
          <KpiCard label="Gross Revenue" value={`₹${stats.totalRevenue}`} icon={IndianRupee} iconBg="bg-indigo-50 text-indigo-600" />
          <KpiCard label="Net Courier Rewards" value={`₹${stats.netRewards}`} icon={Award} iconBg="bg-amber-50 text-amber-600" />
        </div>
      )}

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  statusFilter === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search code or city..."
                className="border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <button onClick={() => { setShowArchived((p) => !p); setPage(1); }} className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50">
              {showArchived ? 'View Active' : 'View Archive'}
            </button>
          </div>
        </div>

        <OrdersTable
          deliveries={deliveries}
          loading={loading}
          page={page}
          pagination={pagination}
          onPageChange={setPage}
          onComplete={handleComplete}
          onArchive={handleArchive}
        />
      </section>
    </div>
  );
}