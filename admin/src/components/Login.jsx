import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import logo from "../assets/hero.png";

const GymVendorLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleClick = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Login UI validated (mock)");
    navigate("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Visual/Branding */}
        <div className="md:w-1/2 bg-blue-600 p-12 text-white flex flex-col justify-center items-center">
          <img src={logo} alt="Gym Vendor" className="w-36" />
          <h1 className="text-4xl font-bold mb-6">Gym Vendor</h1>
          <p className="text-blue-100 text-lg">
            Welcome back! Please login to access your vendor dashboard and
            manage your services.
          </p>
          <div className="mt-8 hidden md:block">
            <div className="h-1 w-20 bg-blue-300 rounded" />
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-8 md:p-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Vendor Login
          </h2>
          <p className="text-gray-500 mb-8">
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Vendor Email
              </label>
              <input
                id="email"
                type="email"
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="vendor@gym.com"
                required
                value={formData.email}
                onChange={handleClick}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={handleClick}
              />
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

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?
            <a
              href="#"
              className="ml-1 text-blue-600 font-medium hover:underline"
            >
              Create Account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
export default GymVendorLogin;
