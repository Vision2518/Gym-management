import { Outlet, Navigate } from "react-router-dom";

const AdminLayout = () => {
  // Check authentication
  const isAuthenticated = !!localStorage.getItem("authToken");

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-layout">
      <header>Admin Header</header>
      <main>
        <Outlet />
      </main>
      <footer>Admin Footer</footer>
    </div>
  );
};

export default AdminLayout;
