import { NavLink, useNavigate } from "react-router-dom";
import { useSignoutMutation } from "../redux/features/authSlice";
import { useDispatch } from "react-redux";
import { clearUser } from "../redux/features/authState";
import {
  MdDashboard,
  MdPeople,
  MdPayment,
  MdSchedule,
  MdCardMembership,
  MdPerson,
  MdLogout,
} from "react-icons/md";

const navItems = [
  { label: "Dashboard",  path: "/vendor/dashboard",  icon: <MdDashboard size={20} /> },
  { label: "Members",    path: "/vendor/members",    icon: <MdPeople size={20} /> },
  { label: "Plans",      path: "/vendor/plans",      icon: <MdCardMembership size={20} /> },
  { label: "Schedules",  path: "/vendor/schedules",  icon: <MdSchedule size={20} /> },
  { label: "Payments",   path: "/vendor/payments",   icon: <MdPayment size={20} /> },
  { label: "Profile",    path: "/vendor/profile",    icon: <MdPerson size={20} /> },
];

const VendorSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [signout] = useSignoutMutation();

  const handleSignout = async () => {
    await signout();
    localStorage.removeItem("authToken");
    localStorage.removeItem("vendorUsername");
    dispatch(clearUser());
    navigate("/");
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-950 text-white flex flex-col">
      <div className="p-8 text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
        Vendor Panel
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isActive
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4">
        <button
          onClick={handleSignout}
          className="w-full flex items-center gap-3 px-4 py-3 bg-purple-600/10 text-purple-400 hover:bg-purple-600 hover:text-white rounded-xl font-bold transition-all duration-200"
        >
          <MdLogout size={20} /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default VendorSidebar;
