const STEPS = ['Booked', 'In Transit', 'Delivered'];

export default function OrderStepper({ status }) {
  if (status === 'Cancelled') {
    return (
      <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
        This shipment was cancelled and will not be dispatched.
      </div>
    );
  }

  const currentIdx = status === 'Delivered' ? 2 : status === 'Rescheduled' || status === 'In Transit' ? 1 : 0;

  return (
    <div className="flex items-center justify-between px-2 py-1">
      {STEPS.map((label, idx) => {
        const done = idx <= currentIdx;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full text-[11px] font-semibold flex items-center justify-center transition ${
                  done ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {idx + 1}
              </span>
              <span className={`text-xs font-medium ${done ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-3 rounded ${idx < currentIdx ? 'bg-blue-600' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}