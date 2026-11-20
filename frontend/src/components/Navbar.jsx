export default function Navbar({ activeTab, setActiveTab, token, onLogout }) {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
            DL
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Delivery Logistics Engine</h1>
            <p className="text-xs text-slate-500">Dispatch & Courier Management</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {['customer', 'admin', 'couriers'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium capitalize transition ${
                activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab === 'admin' ? 'Operations' : tab}
            </button>
          ))}
          {token && (
            <button
              onClick={onLogout}
              className="ml-2 px-3 py-1.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}