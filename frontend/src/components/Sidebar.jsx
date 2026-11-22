import { Package, ShieldCheck, Truck, LogOut, LayoutDashboard, X } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'customer', label: 'Dispatch & Track', icon: Package },
  { id: 'admin', label: 'Operations Console', icon: LayoutDashboard },
  { id: 'couriers', label: 'Courier Network', icon: Truck },
];

export default function Sidebar({ activeTab, setActiveTab, token, onLogout, open, onClose }) {
  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 lg:hidden" />}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-950 text-slate-300 flex flex-col justify-between border-r border-slate-800/80 transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-inner">
                DL
              </div>
              <div>
                <p className="text-sm font-semibold text-white tracking-tight">DeliveryEngine</p>
                <p className="text-[11px] text-slate-500">Logistics OS</p>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="p-3 space-y-1">
            <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Platform
            </p>
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); onClose(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    active
                      ? 'bg-blue-600/15 text-blue-400 ring-1 ring-inset ring-blue-500/30'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-slate-800/80 space-y-2">
          <div className="px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2.5">
            <ShieldCheck className={`w-4 h-4 ${token ? 'text-emerald-400' : 'text-slate-500'}`} />
            <div className="text-xs">
              <p className="text-slate-200 font-medium">{token ? 'Admin Session' : 'Guest Mode'}</p>
              <p className="text-[11px] text-slate-500">{token ? 'JWT Verified' : 'Public Portal'}</p>
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
    </>
  );
}