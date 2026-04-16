import { Outlet, Navigate } from "react-router-dom";
import VendorSidebar from "../components/VendorSidebar";

const VendorLayout = () => {
  const isAuthenticated = !!localStorage.getItem("authToken");

  if (!isAuthenticated) {
    return <Navigate to="/vendor-login" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <VendorSidebar />
      <main className="flex-1 bg-gray-100 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default VendorLayout;