import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  History,
  IdCard,
  LogOut,
  PlayCircle,
  ScanLine,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getAdvisorRoleLabel } from '@/lib/advisorAccess';
import WorldSwitcher from './WorldSwitcher';

/**
 * Mitarbeiter-Layout — Welt "Beratung & Mitarbeiter" (Sprint-1-AP-2 / AP-7).
 *
 * Refactor in Sprint 1:
 *   - Admin-Items (Tarife, Regeln, Analytics, Krankenkassen, Admin) raus —
 *     gehoeren in /admin/* und werden vom AdminLayout angezeigt.
 *   - Neuer Eintrag "Heute" als erster Sidebar-Eintrag (Tagesfokus).
 *   - Verbleibende Items neu sortiert:
 *       Heute · Personen · Leads · Rezepte · Beratung · Verlauf
 *   - WorldSwitcher (rechts oben) — nur fuer Admin sichtbar.
 *   - Header-Title "Beratung & Mitarbeiter".
 *
 * Backward-Compat:
 *   - Logout, User-Menue, vorhandene Sub-Komponenten und Routes-Embedding via
 *     <Outlet /> bleiben unveraendert.
 *   - Bestehende Pages (PersonenCockpit, LeadCockpit, PrescriptionIntake,
 *     ConsultationFlow, ConsultationHistory) rendern weiter, sofern sie
 *     von AdvisorLayout eingebettet werden (siehe App.jsx in Welle 3).
 */
const NAV = [
  { label: 'Heute', path: '/berater/heute', icon: CalendarDays },
  { label: 'Personen', path: '/berater/personen', icon: IdCard },
  { label: 'Leads', path: '/berater/leads', icon: UserPlus },
  { label: 'Rezepte', path: '/berater/rezepte', icon: ScanLine },
  { label: 'Beratung', path: '/berater/beratung', icon: PlayCircle },
  { label: 'Verlauf', path: '/berater/verlauf', icon: History },
];

export default function AdvisorLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-16 lg:w-56 bg-card border-r border-border flex flex-col flex-shrink-0">
        <div className="p-3 lg:p-4 border-b border-border">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            <span className="hidden lg:block">Zur App</span>
          </Link>
        </div>

        <div className="hidden lg:block px-4 pt-4 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Beratung & Mitarbeiter
          </p>
        </div>

        <nav className="flex-1 py-3 space-y-1 px-2">
          {NAV.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium
                  ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden lg:block">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-2 lg:p-4 border-t border-border space-y-3">
          <div className="hidden lg:block text-xs text-muted-foreground leading-relaxed">
            <p className="font-bold text-foreground truncate">{user?.full_name || user?.email || 'Berater'}</p>
            <p>{getAdvisorRoleLabel(user)}</p>
          </div>
          <button
            onClick={() => logout(true)}
            className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className="hidden lg:block">Abmelden</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Welt
            </p>
            <h1 className="text-base lg:text-lg font-black text-foreground truncate">
              Beratung & Mitarbeiter
            </h1>
          </div>
          <WorldSwitcher currentWorld="berater" />
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
