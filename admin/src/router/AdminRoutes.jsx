import AdminDashboard from "../components/AdminDashboard";
import Vendors from "../components/Vendors";

const Placeholder = ({ title }) => (
  <div className="p-8">
    <h1 className="text-3xl font-bold">{title}</h1>
  </div>
);

export const adminRoutes = [
  { path: "dashboard", element: <AdminDashboard /> },
  { path: "vendors", element: <Vendors /> },
  { path: "companies", element: <Placeholder title="Companies" /> },
];
