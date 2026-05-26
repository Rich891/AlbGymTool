// Backward-Compat-Schicht ueber roleModel.js (Sprint-1-AP-1).
// Diese Datei existierte vorher als eigenstaendige Rollen-Logik. Ihre
// bestehenden Exporte werden jetzt als Wrapper um das neue zentrale
// roleModel weitergefuehrt, damit bestehende Caller (ProtectedAdvisorRoute,
// AdvisorLayout, AdvisorLogin) ohne Aenderung weiterlaufen.
//
// Neuer Code sollte direkt aus '@/lib/roleModel' importieren.

import {
  ROLES,
  ROLE_LABELS,
  isAdmin as isAdminRole,
  isMitarbeiter,
  resolveUserRole,
} from './roleModel';

// Liste aller Role-Keys, die als "Berater-Zugang" gelten.
// Wird ausschliesslich aus Backward-Compat exportiert. Neuer Code prueft
// stattdessen isMitarbeiter(user) / isAdmin(user) direkt.
const ADVISOR_ROLE_KEYS = new Set([
  'admin',
  'administrator',
  'studioleitung',
  'studio_owner',
  'owner',
  'mitarbeiter',
  'berater',
  'advisor',
  'trainer',
  'coach',
  'service',
  'sales',
  'empfang',
  'reception',
  'reha',
  'reha_mitarbeiter',
]);

// Labels fuer alte Role-Keys (nur fuer Anzeige bei Legacy-Callern).
// Neuer Code nutzt ROLE_LABELS aus roleModel.
const LEGACY_ROLE_LABELS = {
  admin: 'Admin',
  administrator: 'Admin',
  studioleitung: 'Studioleitung',
  studio_owner: 'Studioleitung',
  owner: 'Studioleitung',
  mitarbeiter: 'Mitarbeiter',
  berater: 'Berater',
  advisor: 'Berater',
  trainer: 'Trainer',
  coach: 'Trainer',
  service: 'Service',
  sales: 'Sales',
  empfang: 'Empfang',
  reception: 'Empfang',
  reha: 'Reha',
  reha_mitarbeiter: 'Reha-Mitarbeiter',
};

function normalizeRole(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

function pushRole(target, value) {
  if (value === null || value === undefined) return;
  if (Array.isArray(value)) {
    value.forEach(item => pushRole(target, item));
    return;
  }
  if (typeof value === 'object') {
    pushRole(target, value.name || value.key || value.role || value.slug || value.id);
    return;
  }
  const normalized = normalizeRole(value);
  if (normalized) target.add(normalized);
}

/**
 * Liefert alle Role-Keys eines Users als normalisierte Liste.
 * Backward-compat: bestehende Caller verlassen sich auf diese Funktion,
 * darum bleibt sie 1:1 erhalten.
 * @param {object|null|undefined} user
 * @returns {string[]}
 */
export function getAdvisorRoles(user) {
  const roles = new Set();
  pushRole(roles, user?.role);
  pushRole(roles, user?.roles);
  pushRole(roles, user?.app_role);
  pushRole(roles, user?.app_roles);
  pushRole(roles, user?.user_role);
  pushRole(roles, user?.user_roles);
  pushRole(roles, user?.permissions?.roles);
  pushRole(roles, user?.profile?.role);
  pushRole(roles, user?.profile?.roles);
  return [...roles];
}

/**
 * True, wenn der User Zugang zur Mitarbeiter-/Admin-Oberflaeche hat.
 * Wrapper um isMitarbeiter(user) aus roleModel.
 * @param {object|null|undefined} user
 * @returns {boolean}
 */
export function hasAdvisorAccess(user) {
  if (!user) return false;
  // Boolean-Admin-Flag bleibt als Trumpf erhalten (war auch vorher so).
  if (user.is_admin === true || user.isAdmin === true) return true;
  return isMitarbeiter(user);
}

/**
 * Anzeigelabel fuer die Rolle des Users. Bevorzugt die neuen 3-Rollen-Labels
 * aus roleModel, faellt aber bei Legacy-Usern (alte Keys wie 'trainer') auf
 * das jeweilige Detail-Label zurueck, damit die UI nicht aerger wirkt.
 * @param {object|null|undefined} user
 * @returns {string}
 */
export function getAdvisorRoleLabel(user) {
  if (!user) return 'Keine Beraterrolle';
  if (user.is_admin === true || user.isAdmin === true) return ROLE_LABELS[ROLES.ADMIN];

  // Wenn der User in roleModel als mitarbeiter/admin/kunde aufloest, nutzen
  // wir das neue Label. Das gibt konsistente Bezeichnungen
  // ("Studioleiter" / "Mitarbeiter" / "Mitglied") in der gesamten UI.
  const resolved = resolveUserRole(user);
  if (resolved && ROLE_LABELS[resolved]) {
    // Wenn der User KEINE bekannte Mitarbeiter-Rolle hat, dann ist er Kunde —
    // wir wollen aber das bestehende "Keine Beraterrolle"-Label behalten,
    // damit ProtectedAdvisorRoute weiter aussagekraeftig bleibt.
    if (resolved === ROLES.KUNDE && !hasAdvisorAccess(user)) {
      // Versuche, ein detailliertes Legacy-Label aus den Keys zu rekonstruieren
      const role = getAdvisorRoles(user).find(item => ADVISOR_ROLE_KEYS.has(item));
      if (role) return LEGACY_ROLE_LABELS[role] || role;
      return 'Keine Beraterrolle';
    }
    return ROLE_LABELS[resolved];
  }

  // Letzter Fallback (sollte nicht greifen): Legacy-Label finden.
  const role = getAdvisorRoles(user).find(item => ADVISOR_ROLE_KEYS.has(item));
  if (role) return LEGACY_ROLE_LABELS[role] || role;
  return 'Keine Beraterrolle';
}

// Re-Exports fuer neue Caller, die lieber aus advisorAccess importieren
// (z.B. weil sie schon dort sind und nicht zweiteilen wollen). Neuer Code
// sollte aber bevorzugt direkt aus roleModel importieren.
export { isAdminRole as isAdmin, isMitarbeiter, resolveUserRole };
