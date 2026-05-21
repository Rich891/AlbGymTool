import React from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getAdvisorRoleLabel, hasAdvisorAccess } from '@/lib/advisorAccess';

export default function ProtectedAdvisorRoute() {
  const location = useLocation();
  const {
    user,
    isAuthenticated,
    isLoadingAuth,
    isLoadingPublicSettings,
    logout,
  } = useAuth();

  if (isLoadingAuth || isLoadingPublicSettings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <div>
            <p className="font-black text-foreground uppercase tracking-wide">Beraterzugang wird geprueft</p>
            <p className="text-sm text-muted-foreground mt-1">Base44-Session und Rolle werden geladen.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/berater/login" replace state={{ from: location.pathname }} />;
  }

  if (!hasAdvisorAccess(user)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Zugriff gesperrt</p>
          <h1 className="text-2xl font-black text-foreground uppercase mb-3">Keine Beraterrolle</h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Dein Base44-Konto ist angemeldet, hat aber keine freigegebene Rolle fuer den internen Bereich.
          </p>
          <div className="rounded-xl bg-secondary/70 px-4 py-3 text-sm text-muted-foreground mb-6">
            Aktuelle Rolle: <span className="font-bold text-foreground">{getAdvisorRoleLabel(user)}</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="flex-1 h-12 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all flex items-center justify-center gap-2 font-bold"
            >
              <ArrowLeft className="w-4 h-4" /> Zur App
            </Link>
            <button
              onClick={() => logout(true)}
              className="flex-1 h-12 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all flex items-center justify-center gap-2 font-bold"
            >
              <LogOut className="w-4 h-4" /> Abmelden
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
