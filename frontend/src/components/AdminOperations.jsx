import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Activity, IndianRupee, CheckCircle, Award } from 'lucide-react';
import api from '../api/client';
import { STATUS_STYLES } from '../constants';

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
        api.get('/deliveries', {
          params: { archived: showArchived, status: statusFilter, search, page, limit: 8 },
        }),
        api.get('/deliveries/stats'),
      ]);
      setDeliveries(ordersRes.data.items);
      setPagination(ordersRes.data.pagination);
      setStats(statsRes.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 400) onAuthError();
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
      {/* Live Aggregation KPIs */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Active Shipments</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.activeOrders}</p>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><Activity className="w-5 h-5" /></div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">On-Time SLA</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.slaRate}%</p>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle className="w-5 h-5" /></div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Gross Revenue</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">₹{stats.totalRevenue}</p>
            </div>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg"><IndianRupee className="w-5 h-5" /></div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Net Courier Rewards</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">₹{stats.netRewards}</p>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg"><Award className="w-5 h-5" /></div>
          </div>
        </div>
      )}

      {/* Orders Table */}
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
            <button
              onClick={() => { setShowArchived((p) => !p); setPage(1); }}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50"
            >
              {showArchived ? 'View Active' : 'View Archive'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Tracking</th>
                <th className="px-5 py-3">Route</th>
                <th className="px-5 py-3">Courier</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">SLA Impact</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-400">Loading shipments...</td>
                </tr>
              ) : deliveries.length ? (
                deliveries.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-mono font-semibold text-slate-900">{d.trackingCode}</td>
                    <td className="px-5 py-3">{d.source} → {d.destination}</td>
                    <td className="px-5 py-3">{d.courierId?.name || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[d.status]}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium">
                      {d.rewardPenalty > 0 && <span className="text-emerald-600">+₹{d.rewardPenalty}</span>}
                      {d.rewardPenalty < 0 && <span className="text-red-600">-₹{Math.abs(d.rewardPenalty)}</span>}
                      {d.rewardPenalty === 0 && <span className="text-slate-400">₹0</span>}
                    </td>
                    <td className="px-5 py-3 text-right space-x-2">
                      {!['Delivered', 'Cancelled'].includes(d.status) && (
                        <>
                          <button
                            onClick={() => handleComplete(d._id, true)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
                          >
                            On-Time
                          </button>
                          <button
                            onClick={() => handleComplete(d._id, false)}
                            className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium"
                          >
                            Late
                          </button>
                        </>
                      )}
                      {!d.isArchived && ['Delivered', 'Cancelled'].includes(d.status) && (
                        <button
                          onClick={() => handleArchive(d._id)}
                          className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-800 text-white text-xs font-medium"
                        >
                          Archive
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-400">No matching deliveries found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50">
          <span>
            Showing page <strong>{page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} total)
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded border border-slate-300 bg-white disabled:opacity-40 hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded border border-slate-300 bg-white disabled:opacity-40 hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}