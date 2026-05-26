// Sprint-1-Welle-3: Routing-Refactor (siehe docs/sprint-1/00-scope.md, AP-3/AP-7).
//
// Was sich geaendert hat (Migrations-Map):
//
//   Public / Customer-Flows (unveraendert, kein Layout-Wrapper):
//     /hero                            -> HeroPage (frueher '/')
//     /beratung/:type                  -> ConsultationFlow
//     /rehasport                       -> RehasportFlow
//
//   Auth:
//     /login                           -> AdvisorLogin (NEU — kanonische URL)
//     /berater/login                   -> AdvisorLogin (Backward-Compat-Alias,
//                                                       HeroPage + ProtectedAdvisorRoute linken
//                                                       weiter dorthin)
//
//   Root-Redirect:
//     /                                -> RootRedirect (rollenbasiertes Landing)
//
//   Admin-Welt (ProtectedWorldRoute world='admin', nur Admin):
//     /admin/dashboard                 -> AdminDashboard
//     /admin/mitarbeiter               -> AdminMitarbeiter
//     /admin/arbeitszeiten             -> AdminArbeitszeiten
//     /admin/kurse                     -> AdminKurse
//     /admin/leistungen                -> AdminLeistungen
//     /admin/tarife                    -> TariffBuilder (existing)
//     /admin/krankenkassen             -> InsuranceManager (existing, aus /berater verschoben)
//     /admin/regeln                    -> RulesAdmin (existing)
//     /admin/analytics                 -> Analytics (existing)
//     /admin/sync                      -> AdminSync
//
//   Mitarbeiter-Welt (ProtectedWorldRoute world='berater', Admin + Mitarbeiter):
//     /berater/heute                   -> BeraterHeute (NEU, AP-5)
//     /berater/personen                -> PersonenCockpit (existing)
//     /berater/personen/:id            -> PersonenAkte (zentrale Personenakte)
//     /berater/leads                   -> /berater/personen (Legacy-Redirect)
//     /berater/rezepte                 -> PrescriptionIntake (existing)
//     /berater/beratung                -> ConsultationFlow (existing)
//     /berater/verlauf                 -> ConsultationHistory (existing)
//     /berater/kunden                  -> CustomerList (existing, behalten als Legacy-Cockpit;
//                                                      No-Go: bestehende funktionierende Pages bleiben)
//
//   Kiosk-Welt (CustomerKioskLayout, KEIN Auth-Guard — anonym OK):
//     /kiosk                           -> KioskPlaceholder
//
//   Backward-Compat-Redirects (alte Bookmarks am Leben halten):
//     /berater                         -> /berater/heute   (alt: /berater/dashboard)
//     /berater/dashboard               -> /berater/heute   (alt: RehasportAdvisorDashboard)
//     /berater/leistungen              -> /admin/leistungen
//     /berater/tarife                  -> /admin/tarife
//     /berater/baukasten               -> /admin/tarife
//     /berater/analytics               -> /admin/analytics
//     /berater/admin                   -> /admin/dashboard
//     /berater/regeln                  -> /admin/regeln
//
// Wichtige Architektur-Notizen:
//   - <ProtectedAdvisorRoute> ist NICHT mehr im Routing. Die Komponente lebt
//     weiter (No-Go: nichts loeschen), wird aber durch <ProtectedWorldRoute>
//     ersetzt.
//   - AdvisorLayout/AdminLayout/CustomerKioskLayout rendern <Outlet /> intern,
//     daher als Eltern-Route eingehangen.
//   - RehasportAdvisorDashboard ist als Komponente nicht mehr Default-Landing,
//     aber Import bleibt nicht in App.jsx — die Page wird durch Redirect aus
//     dem Routing entfernt.

import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedWorldRoute from '@/components/auth/ProtectedWorldRoute';

// Public / Customer-Facing
import HeroPage from '@/pages/HeroPage';
import ConsultationFlow from '@/pages/ConsultationFlow';
import RehasportFlow from '@/pages/rehasport/RehasportFlow';

// Auth + Root-Redirect
import AdvisorLogin from '@/pages/berater/AdvisorLogin';
import RootRedirect from '@/pages/RootRedirect';

// Layouts (Outlet-basiert)
import AdminLayout from '@/components/layout/AdminLayout';
import AdvisorLayout from '@/components/layout/AdvisorLayout';
import CustomerKioskLayout from '@/components/layout/CustomerKioskLayout';

// Mitarbeiter-Welt Pages
import BeraterHeute from '@/pages/berater/BeraterHeute';
import PersonenCockpit from '@/pages/PersonenCockpit';
import PersonenAkte from '@/pages/PersonenAkte';
import PrescriptionIntake from '@/pages/PrescriptionIntake';
import CustomerList from '@/pages/CustomerList';
import ConsultationHistory from '@/pages/ConsultationHistory';

// Admin-Welt Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminMitarbeiter from '@/pages/admin/AdminMitarbeiter';
import AdminArbeitszeiten from '@/pages/admin/AdminArbeitszeiten';
import AdminKurse from '@/pages/admin/AdminKurse';
import AdminLeistungen from '@/pages/admin/AdminLeistungen';
import AdminSync from '@/pages/admin/AdminSync';
import TariffBuilder from '@/pages/TariffBuilder';
import InsuranceManager from '@/pages/berater/InsuranceManager';
import RulesAdmin from '@/pages/RulesAdmin';
import Analytics from '@/pages/Analytics';

// Kiosk-Welt
import KioskPlaceholder from '@/pages/KioskPlaceholder';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <img
            src="https://media.base44.com/images/public/user_69ebb5f9878e5267e7fcc9b3/96b390eb9_AlbGymLogomark.png"
            alt="AlbGym"
            className="w-20 h-20 object-contain animate-pulse"
          />
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    else if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  return (
    <Routes>
      {/* Root-Redirect: rollenbasiertes Default-Landing */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public / Customer-Facing Flows — unangetastet, ohne Layout-Wrapper */}
      <Route path="/hero" element={<HeroPage />} />
      <Route path="/beratung/:type" element={<ConsultationFlow />} />
      <Route path="/rehasport" element={<RehasportFlow />} />

      {/* Auth-Routen — KEIN ProtectedWorldRoute-Wrapper, sonst Redirect-Loop */}
      <Route path="/login" element={<AdvisorLogin />} />
      <Route path="/berater/login" element={<AdvisorLogin />} />

      {/* Kiosk-Welt: KEIN Auth-Guard (anonyme User OK). Sprint-1: 1 Skeleton-Route. */}
      <Route element={<CustomerKioskLayout />}>
        <Route path="/kiosk" element={<KioskPlaceholder />} />
      </Route>

      {/* Admin-Welt: nur Admin */}
      <Route element={
        <ProtectedWorldRoute world="admin">
          <AdminLayout />
        </ProtectedWorldRoute>
      }>
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/mitarbeiter" element={<AdminMitarbeiter />} />
        <Route path="/admin/arbeitszeiten" element={<AdminArbeitszeiten />} />
        <Route path="/admin/kurse" element={<AdminKurse />} />
        <Route path="/admin/leistungen" element={<AdminLeistungen />} />
        <Route path="/admin/tarife" element={<TariffBuilder />} />
        <Route path="/admin/krankenkassen" element={<InsuranceManager />} />
        <Route path="/admin/regeln" element={<RulesAdmin />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/sync" element={<AdminSync />} />
      </Route>

      {/* Mitarbeiter-Welt: Admin + Mitarbeiter */}
      <Route element={
        <ProtectedWorldRoute world="berater">
          <AdvisorLayout />
        </ProtectedWorldRoute>
      }>
        <Route path="/berater" element={<Navigate to="/berater/heute" replace />} />
        <Route path="/berater/heute" element={<BeraterHeute />} />
        <Route path="/berater/personen" element={<PersonenCockpit />} />
        <Route path="/berater/personen/:id" element={<PersonenAkte />} />
        <Route path="/berater/leads" element={<Navigate to="/berater/personen" replace />} />
        <Route path="/berater/rezepte" element={<PrescriptionIntake />} />
        <Route path="/berater/beratung" element={<ConsultationFlow />} />
        <Route path="/berater/verlauf" element={<ConsultationHistory />} />
        {/* Legacy: CustomerList bleibt erreichbar (No-Go: bestehende Pages nicht loeschen) */}
        <Route path="/berater/kunden" element={<CustomerList />} />
      </Route>

      {/* Backward-Compat-Redirects fuer alte Berater-URLs (Sprint-1-AP-7). */}
      {/* Bewusst OHNE Layout-Wrapper / Guard — Navigate feuert sofort. */}
      <Route path="/berater/dashboard" element={<Navigate to="/berater/heute" replace />} />
      <Route path="/berater/leistungen" element={<Navigate to="/admin/leistungen" replace />} />
      <Route path="/berater/tarife" element={<Navigate to="/admin/tarife" replace />} />
      <Route path="/berater/baukasten" element={<Navigate to="/admin/tarife" replace />} />
      <Route path="/berater/analytics" element={<Navigate to="/admin/analytics" replace />} />
      <Route path="/berater/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/berater/regeln" element={<Navigate to="/admin/regeln" replace />} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
