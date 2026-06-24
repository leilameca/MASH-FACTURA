export const TECHNICIAN_ROLE = 'tecnico';

export const technicianPaths = ['/orders', '/inventory', '/account'];
export const adminOnlyPaths = ['/employees', '/tarifario', '/production', '/payroll'];

export function isTechnician(role) {
  return role === TECHNICIAN_ROLE;
}

export function canAccessPath(role, path) {
  if (!isTechnician(role)) return true;
  const isAdminOnly = adminOnlyPaths.some((p) => path === p || path.startsWith(`${p}/`));
  if (isAdminOnly) return false;
  return technicianPaths.some((allowedPath) => path === allowedPath || path.startsWith(`${allowedPath}/`));
}

export function filterNavForRole(items, role) {
  if (!isTechnician(role)) return items;
  return items.filter((item) => canAccessPath(role, item.path));
}

export function defaultPathForRole(role) {
  return isTechnician(role) ? '/orders' : '/dashboard';
}
