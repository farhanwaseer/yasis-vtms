import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

import PageNotFound from "./pages/PageNotFound";
import Login from "./pages/Login";
import AdminLayout from "./pages/AdminLayout";
import RequireAuth from "./components/RequireAuth";
import RequirePermission from "./components/RequirePermission";
import { OPERATION_PAGE_KEYS } from "./utils/permissions";
import Dashboard from "./pages/Admin/Dashboard";
import Vehicles from "./pages/Admin/Vehicles";
import Bins from "./pages/Admin/Bins";
import Management from "./pages/Admin/Management";
import Attendance from "./pages/Admin/Attendance";
import Operations from "./pages/Admin/Operations";
import Locations from "./pages/Admin/Locations";
import Users from "./pages/Admin/Users";

function App() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<PageNotFound />} />

            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route
                index
                element={
                  <RequirePermission anyOf={["DASHBOARD"]}>
                    <Dashboard />
                  </RequirePermission>
                }
              />
              <Route
                path="manage-vehicles"
                element={
                  <RequirePermission adminOnly>
                    <Vehicles />
                  </RequirePermission>
                }
              />
              <Route
                path="manage-users"
                element={
                  <RequirePermission anyOf={["USERS_PAGE"]}>
                    <Users />
                  </RequirePermission>
                }
              />
              <Route
                path="manage-locations"
                element={
                  <RequirePermission anyOf={["LOCATION_PAGE"]}>
                    <Locations />
                  </RequirePermission>
                }
              />
              <Route
                path="manage-operations"
                element={
                  <RequirePermission anyOf={OPERATION_PAGE_KEYS}>
                    <Operations />
                  </RequirePermission>
                }
              />
              <Route
                path="manage-attendance"
                element={
                  <RequirePermission anyOf={["ATTENDANCE_PAGE"]}>
                    <Attendance />
                  </RequirePermission>
                }
              />
              <Route
                path="manage-management"
                element={
                  <RequirePermission anyOf={["MANAGEMENT_PAGE"]}>
                    <Management />
                  </RequirePermission>
                }
              />
              <Route
                path="manage-bins"
                element={
                  <RequirePermission anyOf={["BIN_PAGE"]}>
                    <Bins />
                  </RequirePermission>
                }
              />
            </Route>
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;


