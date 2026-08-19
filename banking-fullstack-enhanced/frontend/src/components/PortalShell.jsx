import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const Icon = ({ name, className = "h-5 w-5" }) => {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    wallet: <><path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v12H5a3 3 0 0 1-3-3V6"/><path d="M16 13h4"/></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></>,
    chart: <><path d="M3 3v18h18"/><path d="m7 16 4-5 4 3 5-7"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.09A1.7 1.7 0 0 0 8.95 19.35a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.58 15 1.7 1.7 0 0 0 3 14H3v-4h.09A1.7 1.7 0 0 0 4.65 8.95a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.58 1.7 1.7 0 0 0 10 3h4a1.7 1.7 0 0 0 1.05 1.58 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06a1.7 1.7 0 0 0-.34 1.88A1.7 1.7 0 0 0 21 10v4a1.7 1.7 0 0 0-1.6 1Z"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    plus: <><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></>,
    minus: <><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/></>,
    transfer: <><path d="M17 3l4 4-4 4"/><path d="M3 7h18M7 21l-4-4 4-4"/><path d="M21 17H3"/></>,
    report: <><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></>,
  };
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name] || paths.dashboard}</svg>;
};

export default function PortalShell({ title, subtitle, roleLabel, navItems, children }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = (user?.fullName || user?.email || "U")
    .split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((x) => x[0]?.toUpperCase()).join("");

  const sidebar = (
    <aside className="h-full w-[276px] bg-[#08111f] text-white flex flex-col">
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center shadow-lg shadow-blue-900/30">
            <span className="text-white font-extrabold text-lg">BS</span>
          </div>
          <div>
            <p className="font-extrabold tracking-tight text-lg leading-none">Banking System</p>
            <p className="text-[10px] uppercase tracking-[.2em] text-slate-400 mt-1.5">Secure digital banking</p>
          </div>
        </div>
      </div>

      <div className="mx-4 mb-4 rounded-2xl border border-white/10 bg-white/[.045] px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-sm font-bold text-blue-200">{initials}</div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{user?.fullName || user?.email}</p>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider mt-0.5">{roleLabel}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto scrollbar-thin">
        <p className="px-3 mb-2 text-[10px] uppercase tracking-[.18em] text-slate-500 font-bold">Navigation</p>
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-950/25" : "text-slate-300 hover:text-white hover:bg-white/[.06]"}`}
            >
              <Icon name={item.icon} className="h-[18px] w-[18px]" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-white/10">
        <button onClick={logout} className="w-full rounded-xl border border-white/10 bg-white/[.04] hover:bg-red-500/10 hover:border-red-400/20 text-slate-300 hover:text-red-300 py-2.5 text-sm font-semibold transition-colors">
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#f5f7fb] lg:flex">
      <div className="hidden lg:block fixed inset-y-0 left-0 z-30">{sidebar}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-[276px]">{sidebar}</div>
        </div>
      )}

      <div className="flex-1 lg:ml-[276px] min-w-0">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
          <div className="h-[76px] px-4 sm:px-7 lg:px-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden h-10 w-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center">
                <span className="text-xl">☰</span>
              </button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 truncate">{title}</h1>
                <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">{subtitle || "Manage your banking securely in one place"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1.5 text-xs font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Secure session
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold">{initials}</div>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-7 lg:p-10 max-w-[1600px] mx-auto">{children}</main>
      </div>
    </div>
  );
}

export { Icon };
