import VendorDashboard from "../components/VendorDashboard";
import Profile from "../components/Profile";

export const vendorRoutes = [
  { path: "dashboard", element: <VendorDashboard /> },
  { path: "profile", element: <Profile /> },
];