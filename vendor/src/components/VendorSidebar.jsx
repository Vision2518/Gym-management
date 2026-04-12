import { NavLink, useNavigate } from "react-router-dom";
import { useSignoutMutation } from "../redux/features/authSlice";
import { useDispatch } from "react-redux";
import { clearUser } from "../redux/features/authState";

const navItems = [
  { label: "Dashboard", path: "/vendor/dashboard" },
  { label: "My Profile", path: "/vendor/profile" },
];

const VendorSidebar = () => {
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
      <div className="p-8 text-2xl font-extrabold border-b border-white/5 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
        Vendor Panel
      </div>
      <nav className="flex-1 p-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isActive
                  ? "bg-purple-600 shadow-lg shadow-purple-900/40"
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
          className="w-full px-4 py-3 bg-purple-600/10 text-purple-500 hover:bg-purple-600 hover:text-white rounded-xl font-bold transition-all duration-200"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default VendorSidebar;