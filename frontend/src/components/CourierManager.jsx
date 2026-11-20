import { useState } from 'react';
import api from '../api/client';

export default function CourierManager({ couriers, onCourierAdded, notify }) {
  const [form, setForm] = useState({ name: '', localities: '', basePrice: '' });
  const [analytics, setAnalytics] = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/couriers/add', {
        name: form.name,
        availableLocalities: form.localities.split(',').map((s) => s.trim()).filter(Boolean),
        basePrice: Number(form.basePrice),
      });
      setForm({ name: '', localities: '', basePrice: '' });
      onCourierAdded();
      notify('Courier added', 'success');
    } catch (err) {
      notify(err.response?.data?.error || 'Failed to add courier', 'error');
    }
  };

  const handleLoadAnalytics = async (courierId) => {
    try {
      const { data } = await api.get(`/deliveries/courier/${courierId}/analytics`);
      setAnalytics(data);
    } catch (err) {
      notify(err.response?.data?.error || 'Failed to load analytics', 'error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Add Courier Partner</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <input
            type="text"
            placeholder="Courier Name (e.g. BlueDart)"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Localities (comma-separated: Delhi, Mumbai, Patna)"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            value={form.localities}
            onChange={(e) => setForm({ ...form, localities: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Base Price (₹)"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            value={form.basePrice}
            onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm"
          >
            Save Courier
          </button>
        </form>
      </section>

      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Courier Performance</h2>
        <div className="space-y-2 mb-4">
          {couriers.map((c) => (
            <div
              key={c._id}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              <div>
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-xs text-slate-500">
                  ₹{c.basePrice} · {c.availableLocalities.join(', ')}
                </p>
              </div>
              <button
                onClick={() => handleLoadAnalytics(c._id)}
                className="px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-medium"
              >
                View Stats
              </button>
            </div>
          ))}
        </div>

        {analytics && (
          <div className="p-4 rounded-lg bg-slate-900 text-white text-sm space-y-1">
            <p className="font-semibold text-base">{analytics.courier}</p>
            <p className="text-slate-300">Total Assigned: {analytics.totalAssigned}</p>
            <p className="text-slate-300">Completed: {analytics.completedCount}</p>
            <p className="text-slate-300">Net Rewards/Penalties: ₹{analytics.netRewards}</p>
          </div>
        )}
      </section>
    </div>
  );
}