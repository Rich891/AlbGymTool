import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Clock,
  CreditCard,
  Heart,
  LayoutDashboard,
  LogOut,
  Package,
  RefreshCw,
  Settings2,
  Users,
} from 'lucide-react';
import WorldSwitcher from './WorldSwitcher';
import { useAuth } from '@/lib/AuthContext';
import { roleLabelFor } from '@/lib/roleModel';

/**
 * Admin-Layout fuer die Studio-Steuerung (Sprint-1-AP-2 / AP-6).
 *
 * - Sidebar mit 10 Admin-Items (siehe NAV-Konstante).
 * - Header oben: Welt-Titel "Studio-Steuerung" + WorldSwitcher (nur fuer Admin
 *   sichtbar; siehe WorldSwitcher.jsx).
 * - Content-Bereich via <Outlet />.
 * - Farbschema: neutrales Slate-Dunkelblau in der Sidebar, hellerer Slate fuer
 *   den Content-Background — bewusst kontrastreich zur Markengruen-Beraterwelt.
 *
 * Responsive:
 *   - sidebar collapsed auf <lg (nur Icons, w-16)
 *   - voll ausgeklappt ab lg (w-56, mit Labels)
 */
const NAV = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Mitarbeiter', path: '/admin/mitarbeiter', icon: Users },
  { label: 'Arbeitszeiten', path: '/admin/arbeitszeiten', icon: Clock },
  { label: 'Kurse', path: '/admin/kurse', icon: Calendar },
  { label: 'Leistungen', path: '/admin/leistungen', icon: Package },
  { label: 'Tarife', path: '/admin/tarife', icon: CreditCard },
  { label: 'Krankenkassen', path: '/admin/krankenkassen', icon: Heart },
  { label: 'Regeln', path: '/admin/regeln', icon: Settings2 },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { label: 'Sync', path: '/admin/sync', icon: RefreshCw },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-16 lg:w-60 bg-slate-900 text-slate-100 border-r border-slate-800 flex flex-col flex-shrink-0">
        <div className="p-3 lg:p-4 border-b border-slate-800">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            <span className="hidden lg:block">Zur App</span>
          </Link>
        </div>

        <div className="hidden lg:block px-4 pt-4 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Studio-Steuerung
          </p>
        </div>

        <nav className="flex-1 py-3 space-y-1 px-2 overflow-y-auto">
          {NAV.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium
                  ${
                    isActive
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden lg:block">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-2 lg:p-4 border-t border-slate-800 space-y-3">
          <div className="hidden lg:block text-xs text-slate-400 leading-relaxed">
            <p className="font-bold text-slate-100 truncate">
              {user?.full_name || user?.email || 'Studioleitung'}
            </p>
            <p>{roleLabelFor(user)}</p>
          </div>
          <button
            onClick={() => logout(true)}
            className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className="hidden lg:block">Abmelden</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Welt
            </p>
            <h1 className="text-base lg:text-lg font-black text-slate-900 truncate">
              Studio-Steuerung
            </h1>
          </div>
          <WorldSwitcher currentWorld="admin" />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
