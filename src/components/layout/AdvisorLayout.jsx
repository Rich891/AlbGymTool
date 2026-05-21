import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  History,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Target,
  UserPlus,
  Users,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getAdvisorRoleLabel } from '@/lib/advisorAccess';

const NAV = [
  { label: 'Dashboard', path: '/berater/dashboard', icon: LayoutDashboard },
  { label: 'Leads', path: '/berater/leads', icon: UserPlus },
  { label: 'Verlauf', path: '/berater/verlauf', icon: History },
  { label: 'CRM-Kunden', path: '/berater/kunden', icon: Users },
  { label: 'Leistungen', path: '/berater/leistungen', icon: BookOpen },
  { label: 'Tarife', path: '/berater/tarife', icon: Package },
  { label: 'Regeln', path: '/berater/regeln', icon: Target },
  { label: 'Analytics', path: '/berater/analytics', icon: BarChart3 },
  { label: 'Admin', path: '/berater/admin', icon: Settings },
];

export default function AdvisorLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-16 lg:w-56 bg-card border-r border-border flex flex-col flex-shrink-0">
        <div className="p-3 lg:p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            <span className="hidden lg:block">Zur App</span>
          </Link>
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

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
