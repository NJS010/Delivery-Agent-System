import { useState, useEffect } from 'react';
import { Search, Clock } from 'lucide-react';
import api from '../api/client';
import { STATUS_STYLES } from '../constants';

export default function OrderTracker({ trackedOrder, setTrackedOrder, notify }) {
  const [trackInput, setTrackInput] = useState('');
  const [rescheduleDest, setRescheduleDest] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');

  useEffect(() => {
    if (trackedOrder?.trackingCode) setTrackInput(trackedOrder.trackingCode);
  }, [trackedOrder?.trackingCode]);

  const handleTrack = async (e) => {
    e.preventDefault();
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
    try {
      const { data } = await api.put(`/deliveries/${trackedOrder._id}/cancel`);
      setTrackedOrder({ ...trackedOrder, status: data.data.status, timeline: data.data.timeline || trackedOrder.timeline });
      notify('Booking cancelled', 'success');
    } catch (err) {
      notify(err.response?.data?.error || 'Cancellation failed', 'error');
    }
  };

  return (
    <section className="xl:col-span-7 bg-white p-6 rounded-xl border border-slate-200 flex flex-col">
      <h2 className="text-base font-semibold text-slate-900 mb-1">Track & Manage Order</h2>
      <p className="text-xs text-slate-500 mb-5">Check real-time status, reschedule, or cancel an active booking.</p>

      <form onSubmit={handleTrack} className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input type="text" placeholder="Enter Tracking Code (e.g. DLV-482910)" className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none" value={trackInput} onChange={(e) => setTrackInput(e.target.value)} />
        </div>
        <button type="submit" className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium">Track</button>
      </form>

      {trackedOrder ? (
        <div className="border border-slate-200 rounded-xl p-5 space-y-5 bg-slate-50/70 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Tracking ID</p>
              <p className="font-mono text-lg font-bold text-slate-900">{trackedOrder.trackingCode}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[trackedOrder.status] || 'bg-slate-100'}`}>
              {trackedOrder.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm bg-white p-4 rounded-lg border border-slate-200">
            <div><p className="text-slate-400 text-xs">Route</p><p className="font-semibold text-slate-800">{trackedOrder.source} → {trackedOrder.destination}</p></div>
            <div><p className="text-slate-400 text-xs">Assigned Courier</p><p className="font-semibold text-slate-800">{trackedOrder.courierId?.name || 'N/A'} (₹{trackedOrder.cost})</p></div>
            <div><p className="text-slate-400 text-xs">Est. Delivery</p><p className="font-semibold text-slate-800">{new Date(trackedOrder.estimatedDelivery).toLocaleDateString('en-IN')}</p></div>
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
                    <p className="text-[11px] text-slate-400">{new Date(event.timestamp).toLocaleString('en-IN')}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {!['Delivered', 'Cancelled'].includes(trackedOrder.status) && (
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <form onSubmit={handleReschedule} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input type="text" placeholder="New destination" className="border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white" value={rescheduleDest} onChange={(e) => setRescheduleDest(e.target.value)} />
                <input type="date" className="border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} />
                <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium py-2">Reschedule Order</button>
              </form>
              <button onClick={handleCancel} className="w-full py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium">Cancel Booking</button>
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
  );
}