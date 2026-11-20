import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { STATUS_STYLES } from '../constants';

export default function AdminOperations({ onAuthError, notify }) {
  const [deliveries, setDeliveries] = useState([]);
  const [showArchived, setShowArchived] = useState(false);

  const loadDeliveries = useCallback(async () => {
    try {
      const { data } = await api.get(`/deliveries?archived=${showArchived}`);
      setDeliveries(data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 400) {
        onAuthError();
      }
    }
  }, [showArchived, onAuthError]);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  const handleComplete = async (id, onTime) => {
    try {
      const { data } = await api.put(`/deliveries/${id}/complete`, { onTime });
      notify(data.message, 'success');
      loadDeliveries();
    } catch (err) {
      notify(err.response?.data?.error || 'Action failed', 'error');
    }
  };

  const handleArchive = async (id) => {
    try {
      await api.put(`/deliveries/${id}/archive`);
      notify('Order moved to archive', 'success');
      loadDeliveries();
    } catch (err) {
      notify(err.response?.data?.error || 'Archive failed', 'error');
    }
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {showArchived ? 'Archived Deliveries' : 'Active Deliveries'}
          </h2>
          <p className="text-xs text-slate-500">{deliveries.length} records found</p>
        </div>
        <button
          onClick={() => setShowArchived((prev) => !prev)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50"
        >
          {showArchived ? 'View Active' : 'View Archive'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">Tracking</th>
              <th className="px-5 py-3">Route</th>
              <th className="px-5 py-3">Courier</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Reward/Penalty</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {deliveries.map((d) => (
              <tr key={d._id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-mono font-medium">{d.trackingCode}</td>
                <td className="px-5 py-3">{d.source} → {d.destination}</td>
                <td className="px-5 py-3">{d.courierId?.name || '—'}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[d.status]}`}>
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
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                      >
                        On-Time
                      </button>
                      <button
                        onClick={() => handleComplete(d._id, false)}
                        className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white text-xs"
                      >
                        Late
                      </button>
                    </>
                  )}
                  {!d.isArchived && ['Delivered', 'Cancelled'].includes(d.status) && (
                    <button
                      onClick={() => handleArchive(d._id)}
                      className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-800 text-white text-xs"
                    >
                      Archive
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!deliveries.length && (
              <tr>
                <td colSpan="6" className="px-5 py-8 text-center text-slate-400">
                  No deliveries in this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}