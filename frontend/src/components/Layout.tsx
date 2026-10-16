import { BarChart3, Car, FileText, Home, Menu, Users, Gauge } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/vehiculos', icon: Car, label: 'Vehículos' },
  { to: '/recomendaciones', icon: Gauge, label: 'Recomendaciones' },
  { to: '/historial', icon: FileText, label: 'Historial' },
];

export function Layout({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="flex min-h-screen">
        <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-700/60 bg-slate-950 p-5 text-slate-100 transition-transform md:static md:translate-x-0`}>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="premium-kicker text-xs text-amber-400">Country</p>
              <h2 className="text-2xl font-black tracking-tight">Motors</h2>
            </div>
            <button className="rounded-lg border border-slate-700 p-2 md:hidden" onClick={() => setOpen(false)} aria-label="Cerrar menú">
              ✕
            </button>
          </div>

          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-slate-900 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300">Chevrolet</p>
            <p className="mt-2 text-lg font-semibold text-white">Sistema comercial</p>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 font-bold text-slate-900">A</div>
              <div>
                <p className="text-sm font-semibold text-white">Asesor principal</p>
                <p className="text-xs text-slate-400">Country Motors</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur-xl md:px-8">
            <div className="flex items-center gap-3">
              <button className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm md:hidden" onClick={() => setOpen(true)} aria-label="Abrir menú">
                <Menu size={18} />
              </button>
              <div>
                <p className="premium-kicker text-[10px] text-slate-400">Sistema web</p>
                <h1 className="text-lg font-bold text-slate-900">Recomendación de vehículos</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 md:flex">
                <BarChart3 size={16} className="text-amber-600" />
                Dashboard activo
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm text-white shadow-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 font-semibold text-slate-900">A</span>
                Asesor Demo
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8">
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
}
