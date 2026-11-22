import { ChevronLeft, ChevronRight } from 'lucide-react';
import { STATUS_STYLES } from '../constants';

export default function OrdersTable({ deliveries, loading, page, pagination, onPageChange, onComplete, onArchive }) {
  return (
    <>
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
              <tr><td colSpan="6" className="px-5 py-8 text-center text-slate-400">Loading shipments...</td></tr>
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
                        <button onClick={() => onComplete(d._id, true)} className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium">
                          On-Time
                        </button>
                        <button onClick={() => onComplete(d._id, false)} className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium">
                          Late
                        </button>
                      </>
                    )}
                    {!d.isArchived && ['Delivered', 'Cancelled'].includes(d.status) && (
                      <button onClick={() => onArchive(d._id)} className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-800 text-white text-xs font-medium">
                        Archive
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="px-5 py-8 text-center text-slate-400">No matching deliveries found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50">
        <span>Showing page <strong>{page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} total)</span>
        <div className="flex items-center gap-1">
          <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="p-1.5 rounded border border-slate-300 bg-white disabled:opacity-40 hover:bg-slate-100">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button disabled={page >= pagination.totalPages} onClick={() => onPageChange(page + 1)} className="p-1.5 rounded border border-slate-300 bg-white disabled:opacity-40 hover:bg-slate-100">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}