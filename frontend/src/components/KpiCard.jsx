export default function KpiCard({ label, value, icon: Icon, iconBg, valueClass = 'text-slate-900' }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase">{label}</p>
        <p className={`text-2xl font-bold mt-1 ${valueClass}`}>{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}