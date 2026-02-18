import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { canAccess, getDefaultAdminPath } from "../utils/permissions";

const RequirePermission = ({ anyOf, adminOnly = false, children }) => {
  const location = useLocation();
  const employee = useSelector((state) => state.auth.employee);
  const permissions = employee?.pagePermissions || [];
  const designationCode = employee?.designationCode || "";

  const allowed = canAccess({ permissions, designationCode, anyOf, adminOnly });
  if (allowed) return children;

  const fallback = getDefaultAdminPath(permissions, designationCode);
  if (fallback === location.pathname) {
    return (
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        Access denied. Please contact an administrator.
      </div>
    );
  }

  return <Navigate to={fallback} replace />;
};

export default RequirePermission;
