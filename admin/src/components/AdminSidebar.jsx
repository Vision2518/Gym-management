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
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-6 text-2xl font-bold border-b border-gray-700">
        Admin Panel
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition-colors ${
                isActive ? "bg-blue-600" : "hover:bg-gray-700"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleSignout}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
