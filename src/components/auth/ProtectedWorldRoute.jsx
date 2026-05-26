import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { userCanAccessWorld, defaultLandingFor } from '@/lib/roleModel';

/**
 * Roleguard pro Welt (Sprint-1-AP-3).
 *
 * Verwendung in App.jsx (kommt in Welle 3):
 *   <Route element={<ProtectedWorldRoute world="admin"><AdminLayout /></ProtectedWorldRoute>}>
 *     ...
 *   </Route>
 *
 * Verhalten:
 *   - solange Auth laedt: null (kein Flash auf Login-Seite)
 *   - kein User: Redirect /login
 *   - User hat Welt nicht: Redirect auf eigenes Default-Landing
 *   - sonst: children rendern
 */
export default function ProtectedWorldRoute({ world, children }) {
  const auth = useAuth();
  const { user } = auth;
  // useAuth liefert isLoadingAuth + isLoadingPublicSettings (siehe AuthContext.jsx).
  // Wir warten auf beide, damit nicht waehrend des Public-Settings-Checks
  // schon ein Redirect feuert.
  const isLoading = Boolean(auth.isLoadingAuth || auth.isLoadingPublicSettings);

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!userCanAccessWorld(user, world)) {
    return <Navigate to={defaultLandingFor(user)} replace />;
  }
  return children;
}
