import { useState } from 'react';
import { Truck, MapPin, Search, CheckCircle2, Clock, IndianRupee } from 'lucide-react';
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

  const lowestRate = couriers.length ? Math.min(...couriers.map((c) => c.basePrice)) : 0;
  const totalCities = new Set(couriers.flatMap((c) => c.availableLocalities)).size;

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
      setTrackedOrder({
        ...trackedOrder,
        status: data.data.status,
        timeline: data.data.timeline || trackedOrder.timeline,
      });
      notify('Booking cancelled', 'success');
    } catch (err) {
      notify(err.response?.data?.error || 'Cancellation failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Active Partners</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{couriers.length}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Starting Rate</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">₹{lowestRate}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Serviceable Cities</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalCities}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className="xl:col-span-5 bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Book a Delivery</h2>
          <p className="text-xs text-slate-500 mb-5">Enter route details to dispatch a shipment.</p>

          <form onSubmit={handleBook} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Source City</label>
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
                <label className="block text-xs font-medium text-slate-700 mb-1">Destination City</label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={autoAssign}
                onChange={(e) => setAutoAssign(e.target.checked)}
                className="rounded border-slate-300 text-blue-600"
              />
              Auto-assign cheapest courier servicing this route
            </label>

            {!autoAssign && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Select Courier</label>
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
              Confirm & Dispatch
            </button>
          </form>
        </section>

        <section className="xl:col-span-7 bg-white p-6 rounded-xl border border-slate-200 flex flex-col">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Track & Manage Order</h2>
          <p className="text-xs text-slate-500 mb-5">Check real-time status, reschedule, or cancel an active booking.</p>

          <form onSubmit={handleTrack} className="flex gap-2 mb-5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Enter Tracking Code (e.g. DLV-482910)"
                className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                value={trackInput}
                onChange={(e) => setTrackInput(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium"
            >
              Track
            </button>
          </form>

          {trackedOrder ? (
            <div className="border border-slate-200 rounded-xl p-5 space-y-5 bg-slate-50/70 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Tracking ID</p>
                  <p className="font-mono text-lg font-bold text-slate-900">{trackedOrder.trackingCode}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    STATUS_STYLES[trackedOrder.status] || 'bg-slate-100'
                  }`}
                >
                  {trackedOrder.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm bg-white p-4 rounded-lg border border-slate-200">
                <div>
                  <p className="text-slate-400 text-xs">Route</p>
                  <p className="font-semibold text-slate-800">{trackedOrder.source} → {trackedOrder.destination}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Assigned Courier</p>
                  <p className="font-semibold text-slate-800">{trackedOrder.courierId?.name || 'N/A'} (₹{trackedOrder.cost})</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Est. Delivery</p>
                  <p className="font-semibold text-slate-800">
                    {new Date(trackedOrder.estimatedDelivery).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              {trackedOrder.timeline?.length > 0 && (
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Shipment Timeline</p>
                  <ol className="relative border-l border-slate-200 ml-2 space-y-3">
                    {trackedOrder.timeline.map((event, idx) => (
                      <li key={idx} className="ml-4">
                        <span className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
                        <p className="text-xs font-semibold text-slate-900">{event.status}</p>
                        <p className="text-xs text-slate-600">{event.note}</p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(event.timestamp).toLocaleString('en-IN')}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {!['Delivered', 'Cancelled'].includes(trackedOrder.status) && (
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <form onSubmit={handleReschedule} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="New destination"
                      className="border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white"
                      value={rescheduleDest}
                      onChange={(e) => setRescheduleDest(e.target.value)}
                    />
                    <input
                      type="date"
                      className="border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium py-2"
                    >
                      Reschedule Order
                    </button>
                  </form>
                  <button
                    onClick={handleCancel}
                    className="w-full py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium"
                  >
                    Cancel Booking
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-xl p-8 text-center">
              <Clock className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-700">No shipment selected</p>
              <p className="text-xs text-slate-500 mt-1">Book a new delivery or search a tracking code to inspect live details.</p>
            </div>
          )}
        </section>
      </div>

      {/* Bottom Panel: Live Courier Network */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Available Courier Network</h3>
            <p className="text-xs text-slate-500">Live partner rates and locality coverage used by the auto-assignment engine</p>
          </div>
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Live
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Courier Partner</th>
                <th className="px-6 py-3">Serviceable Localities</th>
                <th className="px-6 py-3 text-right">Base Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {couriers.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50">
                  <td className="px-6 py-3.5 font-medium text-slate-900">{c.name}</td>
                  <td className="px-6 py-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {c.availableLocalities.map((loc) => (
                        <span key={loc} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                          {loc}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-right font-semibold text-slate-900">₹{c.basePrice}</td>
                </tr>
              ))}
              {!couriers.length && (
                <tr>
                  <td colSpan="3" className="px-6 py-6 text-center text-slate-400 text-xs">
                    No couriers added yet. Add partners from the Courier Network tab.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}