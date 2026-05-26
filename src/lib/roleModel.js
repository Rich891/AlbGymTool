// Single Source of Truth fuer das 3-Rollen-Modell und die 3 Welten.
// Wird von roleguards, Layouts, Routing und Pages konsumiert.
//
// Sprint-1-Scope: docs/sprint-1/00-scope.md (AP-1)
// Backward-Compat: bestehende Base44-User-Records koennen Role-Keys in
// vielen Feldern tragen (role / roles / app_role / app_roles / user_role /
// user_roles / permissions.roles / profile.role / profile.roles). Die
// alten 'coach'/'service'/'sales'-Keys werden auf 'mitarbeiter' gemappt.

export const ROLES = {
  ADMIN: 'admin',
  MITARBEITER: 'mitarbeiter',
  KUNDE: 'kunde',
};

export const ROLE_LABELS = {
  admin: 'Studioleiter',
  mitarbeiter: 'Mitarbeiter',
  kunde: 'Mitglied',
};

export const WORLDS = {
  ADMIN: 'admin',
  // Mitarbeiter-Welt — der Route-Prefix bleibt aus Pragmatismus /berater/*
  // (siehe Sprint-1-Scope, No-Go-Liste). Die Welt selbst heisst trotzdem
  // 'berater', damit URL-Prefix und WORLD-Key gleich klingen.
  BERATER: 'berater',
  KIOSK: 'kiosk',
};

export const WORLD_LABELS = {
  admin: 'Studio-Steuerung',
  berater: 'Beratung & Mitarbeiter',
  kiosk: 'Kiosk',
};

// Welche Rolle darf welche Welt aufrufen?
export const WORLD_ACCESS = {
  admin: ['admin', 'berater', 'kiosk'],
  mitarbeiter: ['berater', 'kiosk'],
  kunde: ['kiosk'],
};

export const DEFAULT_LANDING = {
  admin: '/admin/dashboard',
  mitarbeiter: '/berater/heute',
  kunde: '/kiosk',
};

// Mapping aller bekannten alten/aktuellen Base44-Role-Keys auf die 3 Zielrollen.
// Alle Keys sind lowercase.
const LEGACY_ROLE_MAP = {
  // Admin / Studioleitung
  admin: ROLES.ADMIN,
  administrator: ROLES.ADMIN,
  studioleitung: ROLES.ADMIN,
  studio_owner: ROLES.ADMIN,
  owner: ROLES.ADMIN,

  // Mitarbeiter-Varianten (alle laufen jetzt unter ROLES.MITARBEITER zusammen)
  mitarbeiter: ROLES.MITARBEITER,
  advisor: ROLES.MITARBEITER,
  berater: ROLES.MITARBEITER,
  trainer: ROLES.MITARBEITER,
  coach: ROLES.MITARBEITER,
  service: ROLES.MITARBEITER,
  sales: ROLES.MITARBEITER,
  empfang: ROLES.MITARBEITER,
  reception: ROLES.MITARBEITER,
  reha: ROLES.MITARBEITER,
  reha_mitarbeiter: ROLES.MITARBEITER,

  // Kunde / Mitglied
  kunde: ROLES.KUNDE,
  member: ROLES.KUNDE,
  mitglied: ROLES.KUNDE,
  customer: ROLES.KUNDE,
};

// Reihenfolge der Praezedenz: Admin schlaegt Mitarbeiter schlaegt Kunde.
// Damit gewinnt 'admin' immer, wenn ein User mehrere Rollen-Keys hat.
const ROLE_PRECEDENCE = {
  [ROLES.ADMIN]: 0,
  [ROLES.MITARBEITER]: 1,
  [ROLES.KUNDE]: 2,
};

function normalizeRoleKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

// Sammelt aus einem beliebigen Wert (string, array, object) alle plausiblen
// Role-Keys ein und legt sie als normalisierte Strings in den Set.
function collectRoleKeys(target, value) {
  if (value === null || value === undefined) return;

  if (Array.isArray(value)) {
    value.forEach(item => collectRoleKeys(target, item));
    return;
  }

  if (typeof value === 'object') {
    collectRoleKeys(
      target,
      value.name || value.key || value.role || value.slug || value.id,
    );
    return;
  }

  const normalized = normalizeRoleKey(value);
  if (normalized) target.add(normalized);
}

// Greift in alle bekannten Felder des Base44-User-Objekts und liefert eine
// flache, normalisierte Key-Liste zurueck. Wird absichtlich tolerant gegen
// unbekannte Felder gehalten.
function extractAllRoleKeys(user) {
  const keys = new Set();
  if (!user || typeof user !== 'object') return keys;

  collectRoleKeys(keys, user.role);
  collectRoleKeys(keys, user.roles);
  collectRoleKeys(keys, user.app_role);
  collectRoleKeys(keys, user.app_roles);
  collectRoleKeys(keys, user.user_role);
  collectRoleKeys(keys, user.user_roles);
  collectRoleKeys(keys, user.permissions?.roles);
  collectRoleKeys(keys, user.profile?.role);
  collectRoleKeys(keys, user.profile?.roles);

  return keys;
}

/**
 * Loest die kanonische Rolle eines Users auf eine der 3 ROLES auf.
 * Backward-compat: alte Keys (coach/service/sales/trainer/...) werden
 * auf 'mitarbeiter' gemappt. Boolean-Flags is_admin / isAdmin gelten als
 * harte Admin-Markierung.
 *
 * @param {object|null|undefined} user
 * @returns {string} eine der ROLES-Konstanten
 */
export function resolveUserRole(user) {
  if (!user || typeof user !== 'object') return ROLES.KUNDE;

  // Boolean-Admin-Flag schlaegt alles
  if (user.is_admin === true || user.isAdmin === true) return ROLES.ADMIN;

  const rawKeys = extractAllRoleKeys(user);
  if (rawKeys.size === 0) return ROLES.KUNDE;

  // Auf die 3 Zielrollen mappen und nach Praezedenz sortieren
  let best = null;
  for (const key of rawKeys) {
    const mapped = LEGACY_ROLE_MAP[key];
    if (!mapped) continue;
    if (best === null || ROLE_PRECEDENCE[mapped] < ROLE_PRECEDENCE[best]) {
      best = mapped;
    }
  }

  return best ?? ROLES.KUNDE;
}

/**
 * Prueft, ob ein User Zugriff auf eine bestimmte Welt hat.
 * @param {object|null|undefined} user
 * @param {string} world  z.B. 'admin' | 'berater' | 'kiosk'
 * @returns {boolean}
 */
export function userCanAccessWorld(user, world) {
  const role = resolveUserRole(user);
  return WORLD_ACCESS[role]?.includes(world) ?? false;
}

/**
 * Liefert das Default-Landing-Ziel pro User.
 * Fallback fuer unauth oder unbekannte Rolle: '/login'.
 * @param {object|null|undefined} user
 * @returns {string}
 */
export function defaultLandingFor(user) {
  if (!user) return '/login';
  return DEFAULT_LANDING[resolveUserRole(user)] ?? '/login';
}

/**
 * True, wenn der User die Admin-Rolle hat.
 * @param {object|null|undefined} user
 * @returns {boolean}
 */
export function isAdmin(user) {
  return resolveUserRole(user) === ROLES.ADMIN;
}

/**
 * True, wenn der User mind. Mitarbeiter-Rechte hat (Mitarbeiter ODER Admin).
 * @param {object|null|undefined} user
 * @returns {boolean}
 */
export function isMitarbeiter(user) {
  const role = resolveUserRole(user);
  return role === ROLES.ADMIN || role === ROLES.MITARBEITER;
}

/**
 * True, wenn der User die Kunden-Rolle hat (kein Mitarbeiter / kein Admin).
 * @param {object|null|undefined} user
 * @returns {boolean}
 */
export function isKunde(user) {
  return resolveUserRole(user) === ROLES.KUNDE;
}

/**
 * Anzeigelabel fuer die Rolle (deutsch).
 * @param {object|null|undefined} user
 * @returns {string}
 */
export function roleLabelFor(user) {
  return ROLE_LABELS[resolveUserRole(user)] ?? ROLE_LABELS[ROLES.KUNDE];
}
