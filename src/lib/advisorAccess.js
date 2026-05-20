const ADVISOR_ROLE_KEYS = new Set([
  'admin',
  'administrator',
  'berater',
  'advisor',
  'trainer',
  'coach',
  'service',
  'sales',
]);

const ROLE_LABELS = {
  admin: 'Admin',
  administrator: 'Admin',
  berater: 'Berater',
  advisor: 'Berater',
  trainer: 'Trainer',
  coach: 'Trainer',
  service: 'Service',
  sales: 'Sales',
};

function normalizeRole(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

function pushRole(target, value) {
  if (Array.isArray(value)) {
    value.forEach(item => pushRole(target, item));
    return;
  }

  if (value && typeof value === 'object') {
    pushRole(target, value.name || value.key || value.role || value.slug || value.id);
    return;
  }

  const normalized = normalizeRole(value);
  if (normalized) target.add(normalized);
}

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

export function hasAdvisorAccess(user) {
  if (!user) return false;
  if (user.is_admin === true || user.isAdmin === true) return true;

  return getAdvisorRoles(user).some(role => ADVISOR_ROLE_KEYS.has(role));
}

export function getAdvisorRoleLabel(user) {
  const role = getAdvisorRoles(user).find(item => ADVISOR_ROLE_KEYS.has(item));
  if (role) return ROLE_LABELS[role] || role;
  if (user?.is_admin === true || user?.isAdmin === true) return 'Admin';
  return 'Keine Beraterrolle';
}
