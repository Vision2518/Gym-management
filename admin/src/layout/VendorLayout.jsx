import { Outlet, Navigate } from "react-router-dom";

const VendorLayout = () => {
  const isAuthenticated = !!localStorage.getItem("authToken");

  if (!isAuthenticated) {
    return <Navigate to="/vendor-login" replace />;
  }

  return (
    <div className="vendor-layout">
      <header>Vendor Header</header>
      <main>
        <Outlet />
      </main>
      <footer>Vendor Footer</footer>
    </div>
  );
};

export default VendorLayout;
