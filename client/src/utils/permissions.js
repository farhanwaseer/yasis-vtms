export const ADMIN_DESIGNATION_CODES = ["ADMIN", "VTMS_OFFICER"];

export const OPERATION_PAGE_KEYS = [
  "FORK_OPERATION_PAGE",
  "FLAP_OPERATION_PAGE",
  "BULK_OPERATION_PAGE",
  "ARM_ROLLER_OPERATION_PAGE",
  "GATE_OPERATION_PAGE",
  "GTS_OPERATION_PAGE",
  "LFS_OPERATION_PAGE",
];

export const ADMIN_ROUTE_PERMISSIONS = [
  { path: "/admin", anyOf: ["DASHBOARD"] },
  { path: "/admin/manage-management", anyOf: ["MANAGEMENT_PAGE"] },
  { path: "/admin/manage-users", anyOf: ["USERS_PAGE"] },
  { path: "/admin/manage-operations", anyOf: OPERATION_PAGE_KEYS },
  { path: "/admin/manage-attendance", anyOf: ["ATTENDANCE_PAGE"] },
  { path: "/admin/manage-locations", anyOf: ["LOCATION_PAGE"] },
  { path: "/admin/manage-bins", anyOf: ["BIN_PAGE"] },
  { path: "/admin/manage-vehicles", adminOnly: true },
];

export const normalizePermissions = (permissions) =>
  Array.isArray(permissions) ? permissions : [];

export const isAdminDesignation = (designationCode) =>
  ADMIN_DESIGNATION_CODES.includes(String(designationCode || "").toUpperCase());

export const hasAnyPermission = (permissions, requiredAny) => {
  if (!requiredAny || requiredAny.length === 0) return true;
  const normalized = normalizePermissions(permissions);
  return requiredAny.some((key) => normalized.includes(key));
};

export const canAccess = ({ permissions, designationCode, anyOf, adminOnly }) => {
  if (isAdminDesignation(designationCode)) return true;
  if (adminOnly) return false;
  return hasAnyPermission(permissions, anyOf);
};

export const getDefaultAdminPath = (permissions, designationCode) => {
  for (const entry of ADMIN_ROUTE_PERMISSIONS) {
    if (canAccess({ permissions, designationCode, ...entry })) return entry.path;
  }
  return "/login";
};
