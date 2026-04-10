import AdminDashboard from "../components/AdminDashboard";
import Companies from "../components/Companies";
import Vendors from "../components/Vendors";

export const adminRoutes = [
  { path: "dashboard", element: <AdminDashboard /> },
  { path: "vendors", element: <Vendors /> },
  { path: "companies", element: <Companies /> },
];
