import { useGetVendorStatsQuery } from "../redux/features/authSlice";
import { useSelector } from "react-redux";
import { FaBuilding, FaUsers, FaDumbbell, FaRupeeSign } from "react-icons/fa";
import { MdFitnessCenter, MdTrendingUp, MdPeople, MdAccountBalance } from "react-icons/md";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good Morning", emoji: "🌤️" };
  if (hour < 17) return { text: "Good Afternoon", emoji: "☀️" };
  return { text: "Good Evening", emoji: "🌙" };
};

const VendorDashboard = () => {
  const { data, isLoading, isError } = useGetVendorStatsQuery();
  const email = useSelector((state) => state.auth.email);
  const { text, emoji } = getGreeting();

  const statCards = [
    {
      label: "Assigned Company",
      value: data?.assignedCompany || "-",
      icon: <FaBuilding size={24} />,
      bg: "bg-gradient-to-br from-violet-600 to-violet-800",
      glow: "shadow-violet-900/40",
      badge: "bg-violet-500/30",
    },
    {
      label: "Total Members",
      value: data?.totalMembers ?? 0,
      icon: <MdPeople size={24} />,
      bg: "bg-gradient-to-br from-emerald-500 to-emerald-700",
      glow: "shadow-emerald-900/40",
      badge: "bg-emerald-500/30",
    },
    {
      label: "Active Members",
      value: data?.activeSubscriptions ?? 0,
      icon: <MdTrendingUp size={24} />,
      bg: "bg-gradient-to-br from-sky-500 to-sky-700",
      glow: "shadow-sky-900/40",
      badge: "bg-sky-500/30",
    },
    {
      label: "Monthly Revenue",
      value: `Rs ${Number(data?.monthlyRevenue || 0).toLocaleString()}`,
      icon: <FaRupeeSign size={22} />,
      bg: "bg-gradient-to-br from-amber-500 to-orange-600",
      glow: "shadow-amber-900/40",
      badge: "bg-amber-500/30",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-8">

      {/* Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-10 shadow-2xl">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-fuchsia-700 to-pink-700" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.05),transparent_60%)]" />

        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 -right-4 w-48 h-48 bg-white/5 rounded-full" />

        {/* Gym icon watermark */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-10 text-white">
          <MdFitnessCenter size={160} />
        </div>

        {/* Content */}
        <div className="relative px-10 py-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{emoji}</span>
            <p className="text-purple-200 text-base font-medium">{text}</p>
          </div>
          <h1 className="text-4xl font-extrabold text-white leading-tight">
            Welcome back, <span className="text-pink-300">Vendor</span> 👋
          </h1>
          <p className="text-purple-200 mt-1 text-sm">{email}</p>

          <div className="mt-5 flex items-center gap-3">
            <div className="h-px w-8 bg-pink-400/60 rounded" />
            <p className="text-purple-100 text-sm max-w-md">
              Here's a snapshot of your gym's performance today. Stay on top of your members and revenue!
            </p>
          </div>

          {/* Quick badges */}
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { icon: <FaUsers size={13} />, label: "Members Management" },
              { icon: <FaDumbbell size={13} />, label: "Plans & Schedules" },
              { icon: <MdAccountBalance size={13} />, label: "Payments & Billing" },
            ].map(({ icon, label }) => (
              <span key={label} className="flex items-center gap-2 bg-white/10 backdrop-blur text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/10">
                {icon} {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isError ? (
        <p className="text-red-400 text-center text-lg py-10">Failed to load stats.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map(({ label, value, icon, bg, glow, badge }) => (
            <div key={label} className={`${bg} rounded-2xl p-6 shadow-xl ${glow} text-white hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-default`}>
              <div className={`w-11 h-11 ${badge} rounded-xl flex items-center justify-center mb-4`}>
                {icon}
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">{label}</p>
              <p className="text-3xl font-extrabold leading-tight">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
