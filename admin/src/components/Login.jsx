import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import logo from "../assets/hero.png";
import {
  useLoginMutation,
  useVendorLoginMutation,
} from "../redux/features/authSlice";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/features/authState";
import { getErrorMessage } from "../utils/toastMessage";

const GymVendorLogin = ({ role = "admin" }) => {
  const isAdmin = role === "admin";
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const [login] = useLoginMutation();
  const [vendorLogin] = useVendorLoginMutation();

  const handleClick = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fn = isAdmin ? login : vendorLogin;
      const payload = await fn(formData).unwrap();
      const token = payload?.token;
      if (!token) {
        toast.error("Login failed. No access token was returned.");
        return;
      }

      localStorage.setItem("authToken", token);
      const decoded = JSON.parse(atob(token.split(".")[1]));
      dispatch(setUser({ email: decoded.email, role: decoded.role }));

      if (decoded.role === "super_admin") navigate("/admin/dashboard");
      else if (decoded.role === "vendor") navigate("/vendor/dashboard");
      else toast.error("Login failed. Unknown user role.");
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Login failed. Please check your email and password."),
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <div className="max-w-4xl w-full bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Visual/Branding */}
        <div className="md:w-1/2 bg-red-600 p-12 text-white flex flex-col justify-center items-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          <img src={logo} alt="Gym" className="w-36" />
          <h1 className="text-4xl font-bold mb-6">
            {isAdmin ? "Admin" : "Gym Vendor"}
          </h1>
          <p className="text-blue-100 text-lg">
            Welcome back! Please login to access your{" "}
            {isAdmin ? "admin" : "vendor"} dashboard.
          </p>
          <div className="mt-8 hidden md:block">
            <div className="h-1 w-20 bg-white/30 rounded" />
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-8 md:p-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isAdmin ? "Admin Login" : "Vendor Login"}
          </h2>
          <p className="text-blue-200/60 mb-8">
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-blue-100 mb-2 ml-1">
                {isAdmin ? "Admin Email" : "Vendor Email"}
              </label>
              <input
                id="email"
                type="email"
                className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all placeholder:text-gray-500"
                placeholder={isAdmin ? "admin@gym.com" : "vendor@gym.com"}
                required
                value={formData.email}
                onChange={handleClick}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-blue-100 mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="mt-1 block w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all placeholder:text-gray-500"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleClick}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5 text-blue-200/50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-blue-200/50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-blue-100/70 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-white/10 bg-white/5 text-red-600 focus:ring-red-500 mr-2"
                />
                Remember me
              </label>
              <a
                href="#"
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-red-900/40 hover:scale-[1.02] active:scale-95 transition-all duration-300"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default GymVendorLogin;
