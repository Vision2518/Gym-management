import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/hero.png";
import { useLoginMutation, useVendorLoginMutation } from "../redux/features/authSlice";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/features/authState";

const GymVendorLogin = ({ role = "admin" }) => {
  const isAdmin = role === "admin";
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });  const [showPassword, setShowPassword] = useState(false);
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
      if (!token) throw new Error("Invalid login response");

      localStorage.setItem("authToken", token);
      const decoded = JSON.parse(atob(token.split(".")[1]));
      dispatch(setUser({ email: decoded.email, role: decoded.role }));
      toast.success("Login successful");

      if (decoded.role === "super_admin") navigate("/admin/dashboard");
      else if (decoded.role === "vendor") navigate("/vendor/dashboard");
      else navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      const message = err?.data?.message || err?.message || "Login failed";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Visual/Branding */}
        <div className="md:w-1/2 bg-blue-600 p-12 text-white flex flex-col justify-center items-center">
          <img src={logo} alt="Gym" className="w-36" />
          <h1 className="text-4xl font-bold mb-6">{isAdmin ? "Admin" : "Gym Vendor"}</h1>
          <p className="text-blue-100 text-lg">
            Welcome back! Please login to access your {isAdmin ? "admin" : "vendor"} dashboard.
          </p>
          <div className="mt-8 hidden md:block">
            <div className="h-1 w-20 bg-blue-300 rounded" />
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-8 md:p-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {isAdmin ? "Admin Login" : "Vendor Login"}
          </h2>
          <p className="text-gray-500 mb-8">
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {isAdmin ? "Admin Email" : "Vendor Email"}
              </label>
              <input
                id="email"
                type="email"
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder={isAdmin ? "admin@gym.com" : "vendor@gym.com"}
                required
                value={formData.email}
                onChange={handleClick}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="mt-1 block w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                Remember me
              </label>
              <a href="#" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-blue-200 transition-all duration-300"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};
export default GymVendorLogin;
