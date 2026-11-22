import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const STYLES = {
  success: { wrap: 'bg-slate-900 text-white border-slate-800', icon: CheckCircle2, color: 'text-emerald-400' },
  error: { wrap: 'bg-red-950 text-red-50 border-red-900', icon: AlertCircle, color: 'text-red-400' },
  info: { wrap: 'bg-slate-900 text-white border-slate-800', icon: Info, color: 'text-blue-400' },
};

export default function Toast({ toast, onClose }) {
  if (!toast) return null;
  const { wrap, icon: Icon, color } = STYLES[toast.type] || STYLES.info;

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl max-w-sm ${wrap}`}>
      <Icon className={`w-4 h-4 shrink-0 ${color}`} />
      <p className="text-xs font-medium leading-snug">{toast.text}</p>
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-white">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}