import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2, Lock, LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getAdvisorRoleLabel, hasAdvisorAccess } from '@/lib/advisorAccess';

export default function AdvisorLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    isAuthenticated,
    isLoadingAuth,
    isLoadingPublicSettings,
    logout,
    navigateToLogin,
  } = useAuth();

  // Sprint-1-AP-4: nach erfolgreichem Login NICHT mehr hart auf
  // /berater/dashboard navigieren. Stattdessen entweder die ursprueglich
  // gewuenschte URL (location.state.from) ansteuern oder auf '/' gehen —
  // dort uebernimmt RootRedirect die rollenbasierte Default-Landing-Logik
  // (admin -> /admin/dashboard, mitarbeiter -> /berater/heute, kunde -> /kiosk).
  const targetPath = location.state?.from || '/';
  const isLoading = isLoadingAuth || isLoadingPublicSettings;
  const hasAccess = hasAdvisorAccess(user);

  useEffect(() => {
    if (!isLoading && isAuthenticated && hasAccess) {
      navigate(targetPath, { replace: true });
    }
  }, [hasAccess, isAuthenticated, isLoading, navigate, targetPath]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-foreground uppercase mb-2">Berater-Bereich</h1>
          <p className="text-muted-foreground">Anmeldung ueber Base44-Konto</p>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card p-6 flex items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-primary" /> Session wird geprueft...
          </div>
        ) : isAuthenticated && !hasAccess ? (
          <div className="space-y-5">
            <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-destructive font-bold">Keine freigegebene Beraterrolle.</p>
                <p className="text-xs text-muted-foreground mt-1">Aktuelle Rolle: {getAdvisorRoleLabel(user)}</p>
              </div>
            </div>
            <button
              onClick={() => logout(true)}
              className="w-full h-14 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary font-black text-base uppercase tracking-wide transition-all"
            >
              Anderes Konto verwenden
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-foreground">Sicherer interner Zugang</p>
                <p className="text-xs text-muted-foreground mt-1">Das alte Frontend-Passwort wurde entfernt. Rollen werden ueber die Base44-Session geprueft.</p>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => navigateToLogin()}
              className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" /> Mit Base44 anmelden
            </motion.button>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6">
          Nur fuer autorisierte Berater, Trainer und Admins
        </p>
      </motion.div>
    </div>
  );
}
