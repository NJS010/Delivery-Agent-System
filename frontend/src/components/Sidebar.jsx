import { Package, ShieldCheck, Truck, LogOut, LayoutDashboard } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, token, onLogout }) {
  const navItems = [
    { id: 'customer', label: 'Dispatch & Track', icon: Package },
    { id: 'admin', label: 'Operations Console', icon: LayoutDashboard },
    { id: 'couriers', label: 'Courier Network', icon: Truck },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between min-h-screen shrink-0">
      <div>
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
            DL
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">DeliveryEngine</p>
            <p className="text-[11px] text-slate-400">Logistics OS v1.0</p>
          </div>
        </div>

        <nav className="p-4 space-y-1.5">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Workspace
          </p>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="px-3 py-2 rounded-lg bg-slate-800/60 flex items-center gap-2.5">
          <ShieldCheck className={`w-4 h-4 ${token ? 'text-emerald-400' : 'text-slate-500'}`} />
          <div className="text-xs">
            <p className="text-white font-medium">{token ? 'Admin Session' : 'Guest Mode'}</p>
            <p className="text-slate-400">{token ? 'Full Access' : 'Customer Only'}</p>
          </div>
        </div>

        {token && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}