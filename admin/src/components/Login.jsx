import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// import logo from "../assets/hero.png"; // ← Comment out if file missing
import {
  useLoginMutation,
  useVendorLoginMutation,
} from "../redux/features/authSlice";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/features/authState";
import { getErrorMessage } from "../utils/toastMessage";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdFitnessCenter } from "react-icons/md";

const vendorDashboardUrl = import.meta.env.VITE_VENDOR_DASHBOARD_URL || "";

const GymVendorLogin = ({ role = "admin" }) => {
  const isAdmin = role === "admin";
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const dispatch = useDispatch();
  const [login] = useLoginMutation();
  const [vendorLogin] = useVendorLoginMutation();

  // 🖼️ Safe logo handling - fallback if import fails
  const logoUrl = "../assets/hero.png"; // Adjust path as needed
  const [logoError, setLogoError] = useState(false);

  const handleClick = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const fn = isAdmin ? login : vendorLogin;
      const payload = await fn(formData).unwrap();
      const token = payload?.token;
      
      if (!token) {
        toast.error("Login failed. No access token was returned.");
        return;
      }

      if (rememberMe) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("vendorUsername", formData.email);
      } else {
        sessionStorage.setItem("authToken", token);
      }
      
      const decoded = JSON.parse(atob(token.split(".")[1]));
      dispatch(setUser({ email: decoded.email, role: decoded.role }));

      if (decoded.role === "super_admin") navigate("/admin/dashboard");
      else if (decoded.role === "vendor") {
        if (vendorDashboardUrl) {
          window.location.href = vendorDashboardUrl;
        } else {
          navigate("/vendor/dashboard");
        }
      } else {
        toast.error("Login failed. Unknown user role.");
      }
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Login failed. Please check your email and password.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden p-4">
      {/* ✨ Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-blue-900/20 animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* 🎴 Login Card */}
      <div className="relative max-w-5xl w-full bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/10 flex flex-col md:flex-row animate-fade-in-up">
        
        {/* 🎨 Left Side: Visual/Branding */}
        <div className="md:w-1/2 bg-gradient-to-br from-red-600 to-red-800 p-8 md:p-12 text-white flex flex-col justify-center items-center relative overflow-hidden group">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent animate-pulse-slow" />
          
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-700 delay-100" />
          
          <div className="relative z-10 text-center">
            {/* 🖼️ Safe Logo Render */}
            <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
              {!logoError ? (
                <img 
                  src={logoUrl} 
                  alt="Gym Logo" 
                  className="w-40 h-40 object-contain drop-shadow-2xl"
                  onError={() => setLogoError(true)}
                />
              ) : (
                // Fallback logo if image fails to load
                <div className="w-40 h-40 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                  <MdFitnessCenter className="w-20 h-20 text-white/90" />
                </div>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-red-100">
              {isAdmin ? "Admin Portal" : "Vendor Hub"}
            </h1>
            <p className="text-red-100/90 text-lg leading-relaxed max-w-xs mx-auto">
              Secure access to your {isAdmin ? "administrative" : "vendor"} dashboard. 
              Manage, monitor, and grow your fitness business.
            </p>
            
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {["🔐 Secure", "⚡ Fast", "📱 Responsive"].map((badge, i) => (
                <span 
                  key={i}
                  className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white/90 border border-white/20 hover:bg-white/20 transition-colors cursor-default"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 📝 Right Side: Form */}
        <div className="md:w-1/2 p-6 md:p-10 bg-white/5">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Welcome Back! 👋
              </h2>
              <p className="text-gray-400">
                Sign in to continue to your {isAdmin ? "admin" : "vendor"} dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
                  {isAdmin ? "Admin Email" : "Vendor Email"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MdEmail className="h-5 w-5 text-gray-500 group-focus-within:text-red-400 transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 
                             focus:ring-2 focus:ring-red-500/30 focus:border-red-500 outline-none transition-all duration-200
                             hover:border-white/20 hover:bg-white/10"
                    placeholder={isAdmin ? "admin@gym.com" : "vendor@gym.com"}
                    required
                    value={formData.email}
                    onChange={handleClick}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MdLock className="h-5 w-5 text-gray-500 group-focus-within:text-red-400 transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 
                             focus:ring-2 focus:ring-red-500/30 focus:border-red-500 outline-none transition-all duration-200
                             hover:border-white/20 hover:bg-white/10"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={handleClick}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <MdVisibilityOff className="h-5 w-5" />
                    ) : (
                      <MdVisibility className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <div className="w-5 h-5 border-2 border-white/20 rounded-md peer-checked:bg-red-600 peer-checked:border-red-600 
                                  transition-all duration-200 flex items-center justify-center">
                      {rememberMe && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors hover:underline"
                  onClick={(e) => { e.preventDefault(); toast.info("Password reset feature coming soon!"); }}
                >
                  Forgot password?
                </a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
                         text-white font-semibold py-4 rounded-xl shadow-lg shadow-red-900/30 
                         hover:shadow-red-900/50 hover:scale-[1.02] active:scale-[0.98] 
                         transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100
                         flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="px-4 text-sm text-gray-500">or continue with</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-4">
              {["Google", "GitHub"].map((provider) => (
                <button
                  key={provider}
                  type="button"
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 hover:bg-white/10 
                           border border-white/10 rounded-xl text-gray-300 font-medium 
                           transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => toast.info(`${provider} login coming soon!`)}
                >
                  {provider === "Google" ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/>
                      <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/>
                      <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/>
                      <path fill="#FBBC05" d="M5.277 14.332A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.003Z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  )}
                  {provider}
                </button>
              ))}
            </div>

            {/* Footer */}
            <p className="mt-8 text-center text-sm text-gray-500">
              By signing in, you agree to our{" "}
              <a href="#" className="text-red-400 hover:text-red-300 hover:underline">Terms</a>
              {" "}&{" "}
              <a href="#" className="text-red-400 hover:text-red-300 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>

      {/* ✨ CSS Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -10px) scale(1.1); }
          50% { transform: translate(10px, 20px) scale(0.95); }
          75% { transform: translate(-15px, 10px) scale(1.05); }
        }
        .animate-blob { animation: blob 12s infinite ease-in-out; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.3; }
        }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default GymVendorLogin;