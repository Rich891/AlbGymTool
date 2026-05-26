import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { defaultLandingFor } from '@/lib/roleModel';

/**
 * Root-Redirect-Komponente (Sprint-1-AP-4).
 *
 * Wird in App.jsx (kommt in Welle 3) als '/' Route eingebaut. Lenkt den
 * User je nach Rolle auf das Default-Landing:
 *   - admin       -> /admin/dashboard
 *   - mitarbeiter -> /berater/heute
 *   - kunde       -> /kiosk
 *   - unauth      -> /login
 */
export default function RootRedirect() {
  const auth = useAuth();
  const { user } = auth;
  const isLoading = Boolean(auth.isLoadingAuth || auth.isLoadingPublicSettings);

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={defaultLandingFor(user)} replace />;
}
