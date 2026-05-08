import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import ConsultationFlow from '@/pages/ConsultationFlow';
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
        <div className="flex flex-col items-center gap-4">
          <img 
            src="https://media.base44.com/images/public/user_69ebb5f9878e5267e7fcc9b3/96b390eb9_AlbGymLogomark.png" 
            alt="AlbGym" 
            className="w-16 h-16 object-contain animate-pulse"
          />
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/beratung/:type" element={<ConsultationFlow />} />
        <Route path="/kunden" element={<CustomerList />} />
        <Route path="/leistungskatalog" element={<ServiceCatalog />} />
        <Route path="/tarife" element={<TariffList />} />
        <Route path="/tarif-baukasten" element={<TariffBuilder />} />
        <Route path="/beratungsverlauf" element={<ConsultationHistory />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/regeln" element={<RulesAdmin />} />
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
  )
}

export default App