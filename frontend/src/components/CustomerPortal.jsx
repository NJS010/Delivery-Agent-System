import { useState } from 'react';
import api from '../api/client';
import { STATUS_STYLES } from '../constants';

export default function CustomerPortal({ couriers, notify }) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [autoAssign, setAutoAssign] = useState(true);
  const [selectedCourierId, setSelectedCourierId] = useState('');

  const [trackInput, setTrackInput] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [rescheduleDest, setRescheduleDest] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      const courierId = selectedCourierId || couriers[0]?._id;
      const { data } = await api.post('/deliveries/book', {
        source,
        destination,
        autoAssign,
        courierId: autoAssign ? undefined : courierId,
      });
      setTrackedOrder(data.data);
      setTrackInput(data.data.trackingCode);
      setSource('');
      setDestination('');
      notify(`Booked! Tracking Code: ${data.data.trackingCode} (${data.data.courierId.name})`, 'success');
    } catch (err) {
      notify(err.response?.data?.error || 'Booking failed', 'error');
    }
  };

  const handleTrack = async (e) => {
    e?.preventDefault();
    if (!trackInput.trim()) return;
    try {
      const { data } = await api.get(`/deliveries/track/${trackInput.trim()}`);
      setTrackedOrder(data);
    } catch (err) {
      setTrackedOrder(null);
      notify(err.response?.data?.error || 'Order not found', 'error');
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!trackedOrder) return;
    try {
      const { data } = await api.put(`/deliveries/${trackedOrder._id}/reschedule`, {
        newDestination: rescheduleDest,
        newDate: rescheduleDate,
      });
      setTrackedOrder(data.data);
      setRescheduleDest('');
      setRescheduleDate('');
      notify('Delivery rescheduled', 'success');
    } catch (err) {
      notify(err.response?.data?.error || 'Reschedule failed', 'error');
    }
  };

  const handleCancel = async () => {
    if (!trackedOrder) return;
    try {
      const { data } = await api.put(`/deliveries/${trackedOrder._id}/cancel`);
      setTrackedOrder({ ...trackedOrder, status: data.data.status });
      notify('Booking cancelled', 'success');
    } catch (err) {
      notify(err.response?.data?.error || 'Cancellation failed', 'error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Book a Delivery</h2>
        <form onSubmit={handleBook} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Source City</label>
            <input
              type="text"
              placeholder="e.g. Bhagalpur"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Destination City</label>
            <input
              type="text"
              placeholder="e.g. Bengaluru"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={autoAssign}
              onChange={(e) => setAutoAssign(e.target.checked)}
              className="rounded border-slate-300"
            />
            Auto-assign best available courier (cheapest for route)
          </label>

          {!autoAssign && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Courier</label>
              <select
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                value={selectedCourierId || couriers[0]?._id || ''}
                onChange={(e) => setSelectedCourierId(e.target.value)}
              >
                {couriers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} — ₹{c.basePrice}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition"
          >
            Confirm Booking
          </button>
        </form>
      </section>

      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Track & Manage Order</h2>
        <form onSubmit={handleTrack} className="flex gap-2 mb-5">
          <input
            type="text"
            placeholder="Enter Tracking Code (e.g. DLV-482910)"
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none"
            value={trackInput}
            onChange={(e) => setTrackInput(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium"
          >
            Track
          </button>
        </form>

        {trackedOrder ? (
          <div className="border border-slate-200 rounded-lg p-4 space-y-4 bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-slate-900">{trackedOrder.trackingCode}</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  STATUS_STYLES[trackedOrder.status] || 'bg-slate-100'
                }`}
              >
                {trackedOrder.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500 text-xs">Route</p>
                <p className="font-medium">{trackedOrder.source} → {trackedOrder.destination}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Courier</p>
                <p className="font-medium">{trackedOrder.courierId?.name || 'N/A'} (₹{trackedOrder.cost})</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Est. Delivery</p>
                <p className="font-medium">{new Date(trackedOrder.estimatedDelivery).toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            {!['Delivered', 'Cancelled'].includes(trackedOrder.status) && (
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <form onSubmit={handleReschedule} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="New destination"
                    className="border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white"
                    value={rescheduleDest}
                    onChange={(e) => setRescheduleDest(e.target.value)}
                  />
                  <input
                    type="date"
                    className="border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-md text-xs font-medium py-1.5"
                  >
                    Reschedule
                  </button>
                </form>
                <button
                  onClick={handleCancel}
                  className="w-full py-1.5 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium"
                >
                  Cancel Booking
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Enter a tracking code above to view live status or modify a booking.</p>
        )}
      </section>
    </div>
  );
}