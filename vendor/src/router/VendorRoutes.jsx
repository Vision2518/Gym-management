import VendorDashboard from "../components/VendorDashboard";
import Profile from "../components/Profile";
import Members from "../components/Members";
import Plans from "../components/Plans";
import Schedules from "../components/Schedules";
import Payments from "../components/Payments";

export const vendorRoutes = [
  { path: "dashboard",  element: <VendorDashboard /> },
  { path: "members",    element: <Members /> },
  { path: "plans",      element: <Plans /> },
  { path: "schedules",  element: <Schedules /> },
  { path: "payments",   element: <Payments /> },
  { path: "profile",    element: <Profile /> },
];
