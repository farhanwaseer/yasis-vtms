import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import logo from "../assets/logo.png"; // Assuming you have a logo image in the assets folder
import {
  FaTruck,
  FaUsers,
  FaMapMarkerAlt,
  FaHeartbeat,
  FaCalendarAlt,
  FaShieldAlt,
  FaTrash,

} from "react-icons/fa"; // Importing some icons for the sidebar items
import { LogOut } from "lucide-react";
import { logout } from "../store/authSlice";
import { canAccess, OPERATION_PAGE_KEYS } from "../utils/permissions";

const adminMenu = [
  {
    name: "Dashboard",
    path: "/admin",
    icon: "D",
    exact: true,
    requiredAny: ["DASHBOARD"],
  },
  {
    name: "Vehicles",
    path: "manage-vehicles",
    icon: FaTruck,
    adminOnly: true,
  },
  {
    name: "Users",
    path: "manage-users",
    icon: FaUsers,
    requiredAny: ["USERS_PAGE"],
  },
  {
    name: "Locations",
    path: "manage-locations",
    icon: FaMapMarkerAlt,
    requiredAny: ["LOCATION_PAGE"],
  },
  {
    name: "Operations",
    path: "manage-operations",
    icon: FaHeartbeat,
    requiredAny: OPERATION_PAGE_KEYS,
  },
  {
    name: "Attendance",
    path: "manage-attendance",
    icon: FaCalendarAlt,
    requiredAny: ["ATTENDANCE_PAGE"],
  },
  {
    name: "Management",
    path: "manage-management",
    icon: FaShieldAlt,
    requiredAny: ["MANAGEMENT_PAGE"],
  },
  {
    name: "Bins",
    path: "manage-bins",
    icon: FaTrash,
    requiredAny: ["BIN_PAGE"],
  },
];

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const employee = useSelector((state) => state.auth.employee);
  const permissions = employee?.pagePermissions || [];
  const designationCode = employee?.designationCode || "";

  const visibleMenu = adminMenu.filter((item) =>
    canAccess({
      permissions,
      designationCode,
      anyOf: item.requiredAny,
      adminOnly: item.adminOnly,
    }),
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <div className="sticky top-0 h-screen w-72 overflow-y-auto bg-white shadow-lg">
      {/* Logo */}
      <div className=" flex items-center  justify-items-start p-1">
        <img src={logo} alt="Logo" className="h-32.5  w-35  opacity-100" />
      </div>

      {/* Menu List */}
      <div className=" space-y-6 px-6">
        {visibleMenu.map((item, index) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={index}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center text-sm font-medium  hover:py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-[#0060B9] px-4 py-2 text-white"
                    : "text-[#9197B3] hover:bg-[#0060B9]/10  hover:text-[#0060B9]"
                }`
              }
            >
              <div className={`w-6 h-6 mr-3 rounded-md flex items-center justify-center  bg-[#0060B9]  text-white text-xs`}>
                {typeof Icon === "string" ? Icon : Icon && <Icon />}
              </div>

              <span>{item.name}</span>
            </NavLink>
          );
        })}

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center text-sm font-medium text-[#9197B3] hover:bg-[#0060B9]/10 hover:text-[#0060B9] rounded-lg transition-all duration-200"
        >
          <div className="w-6 h-6 mr-3 rounded-md flex items-center justify-center bg-[#0060B9] text-white text-xs">
            <LogOut size={14} />
          </div>
          <span>LogOut</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
