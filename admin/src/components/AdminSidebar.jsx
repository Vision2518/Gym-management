import { NavLink, useNavigate } from "react-router-dom";
import { useSignoutMutation } from "../redux/features/authSlice";
import { useDispatch } from "react-redux";
import { clearUser } from "../redux/features/authState";

const navItems = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "Vendors", path: "/admin/vendors" },
  { label: "Companies", path: "/admin/companies" },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [signout] = useSignoutMutation();

  const handleSignout = async () => {
    await signout();
    localStorage.removeItem("authToken");
    dispatch(clearUser());
    navigate("/");
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-950 text-white flex flex-col border-r border-white/5">
      <div className="p-8 text-2xl font-extrabold border-b border-white/5 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
        Admin Panel
      </div>
      <nav className="flex-1 p-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isActive
                  ? "bg-red-600 shadow-lg shadow-red-900/40"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-6 border-t border-white/5">
        <button
          onClick={handleSignout}
          className="w-full px-4 py-3 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-xl font-bold transition-all duration-200"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
