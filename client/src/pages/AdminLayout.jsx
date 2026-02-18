import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Nav } from "../components/Navbar";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* <Nav /> */}
      <div className="flex min-h-[calc(100vh-80px)]">
        <Sidebar />
        <div className="flex-1 px-8 py-5">
          <Nav />
          <div >
          {/* <div className="mt-8 bg-white p-6 rounded-lg shadow"> */}
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
