import { useState } from 'react';
import api from '../api/client';

export default function BookingForm({ couriers, onBooked, notify }) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [autoAssign, setAutoAssign] = useState(true);
  const [selectedCourierId, setSelectedCourierId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const courierId = selectedCourierId || couriers[0]?._id;
      const { data } = await api.post('/deliveries/book', {
        source,
        destination,
        autoAssign,
        courierId: autoAssign ? undefined : courierId,
      });
      onBooked(data.data);
      setSource('');
      setDestination('');
      notify(`Booked! Tracking Code: ${data.data.trackingCode} (${data.data.courierId.name})`, 'success');
    } catch (err) {
      notify(err.response?.data?.error || 'Booking failed', 'error');
    }
  };

  return (
    <section className="xl:col-span-5 bg-white p-6 rounded-xl border border-slate-200">
      <h2 className="text-base font-semibold text-slate-900 mb-1">Book a Delivery</h2>
      <p className="text-xs text-slate-500 mb-5">Enter route details to dispatch a shipment.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Source City</label>
            <input type="text" placeholder="e.g. Bhagalpur" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={source} onChange={(e) => setSource(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Destination City</label>
            <input type="text" placeholder="e.g. Bengaluru" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={destination} onChange={(e) => setDestination(e.target.value)} required />
          </div>
        </div>

        <label className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 cursor-pointer">
          <input type="checkbox" checked={autoAssign} onChange={(e) => setAutoAssign(e.target.checked)} className="rounded border-slate-300 text-blue-600" />
          Auto-assign cheapest courier servicing this route
        </label>

        {!autoAssign && (
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Select Courier</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" value={selectedCourierId || couriers[0]?._id || ''} onChange={(e) => setSelectedCourierId(e.target.value)}>
              {couriers.map((c) => <option key={c._id} value={c._id}>{c.name} — ₹{c.basePrice}</option>)}
            </select>
          </div>
        )}

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition">
          Confirm & Dispatch
        </button>
      </form>
    </section>
  );
}