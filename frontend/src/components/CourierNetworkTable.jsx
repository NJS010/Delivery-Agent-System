import { CheckCircle2 } from 'lucide-react';

export default function CourierNetworkTable({ couriers }) {
  return (
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
                      <span key={loc} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{loc}</span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-3.5 text-right font-semibold text-slate-900">₹{c.basePrice}</td>
              </tr>
            ))}
            {!couriers.length && (
              <tr><td colSpan="3" className="px-6 py-6 text-center text-slate-400 text-xs">No couriers added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}