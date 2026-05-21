import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedAdvisorRoute from '@/components/auth/ProtectedAdvisorRoute';

// Customer-facing pages
import HeroPage from '@/pages/HeroPage';
import ConsultationFlow from '@/pages/ConsultationFlow';
import RehasportFlow from '@/pages/rehasport/RehasportFlow';

// Advisor pages
import AdvisorLogin from '@/pages/berater/AdvisorLogin';
import RehasportAdvisorDashboard from '@/pages/berater/RehasportAdvisorDashboard';

// Advisor area (protected)
import AdvisorLayout from '@/components/layout/AdvisorLayout';
import LeadCockpit from '@/pages/LeadCockpit';
import CustomerList from '@/pages/CustomerList';
import ServiceCatalog from '@/pages/ServiceCatalog';
import TariffList from '@/pages/TariffList';
import TariffBuilder from '@/pages/TariffBuilder';
import ConsultationHistory from '@/pages/ConsultationHistory';
import Analytics from '@/pages/Analytics';
import Admin from '@/pages/Admin';
import RulesAdmin from '@/pages/RulesAdmin';

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
      {/* Customer-facing - no sidebar */}
      <Route path="/" element={<HeroPage />} />
      <Route path="/beratung/:type" element={<ConsultationFlow />} />
      <Route path="/rehasport" element={<RehasportFlow />} />

      {/* Advisor login */}
      <Route path="/berater/login" element={<AdvisorLogin />} />

      {/* Advisor area */}
      <Route element={<ProtectedAdvisorRoute />}>
        <Route element={<AdvisorLayout />}>
          <Route path="/berater" element={<Navigate to="/berater/dashboard" replace />} />
          <Route path="/berater/dashboard" element={<RehasportAdvisorDashboard />} />
          <Route path="/berater/leads" element={<LeadCockpit />} />
          <Route path="/berater/kunden" element={<CustomerList />} />
          <Route path="/berater/leistungen" element={<ServiceCatalog />} />
          <Route path="/berater/tarife" element={<TariffList />} />
          <Route path="/berater/baukasten" element={<TariffBuilder />} />
          <Route path="/berater/verlauf" element={<ConsultationHistory />} />
          <Route path="/berater/analytics" element={<Analytics />} />
          <Route path="/berater/admin" element={<Admin />} />
          <Route path="/berater/regeln" element={<RulesAdmin />} />
        </Route>
      </Route>

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
