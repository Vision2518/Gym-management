import { useGetVendorStatsQuery } from "../redux/features/authSlice";
import { useSelector } from "react-redux";
import { FaBuilding, FaRupeeSign, FaRegHandPaper } from "react-icons/fa";
import {
  MdFitnessCenter,
  MdTrendingUp,
  MdPeople,
  MdWbCloudy,
  MdSunny,
  MdNightsStay,
} from "react-icons/md";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good Morning", icon: <MdWbCloudy size={24} /> };
  if (hour < 17) return { text: "Good Afternoon", icon: <MdSunny size={24} /> };
  return { text: "Good Evening", icon: <MdNightsStay size={24} /> };
};

const VendorDashboard = () => {
  const { data, isLoading, isError } = useGetVendorStatsQuery();
  const email = useSelector((state) => state.auth.email);
  const username = useSelector((state) => state.auth.username);
  const { text, icon: greetingIcon } = getGreeting();

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
      <div className="relative mb-10 overflow-hidden rounded-3xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-fuchsia-700 to-pink-700" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.05),transparent_60%)]" />
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -right-4 h-48 w-48 rounded-full bg-white/5" />
        <div className="absolute right-12 top-1/2 -translate-y-1/2 text-white opacity-10">
          <MdFitnessCenter size={160} />
        </div>

        <div className="relative px-10 py-10">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-purple-200">{greetingIcon}</span>
            <p className="text-base font-medium text-purple-200">{text}</p>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-extrabold leading-tight text-white">
              Welcome back, <span className="text-pink-300">{username || email}</span>
            </h1>
            <FaRegHandPaper className="text-white/90" size={28} />
          </div>
          <p className="mt-1 text-sm text-purple-200">{email}</p>

          <div className="mt-5 flex items-center gap-3">
            <div className="h-px w-8 rounded bg-pink-400/60" />
            <p className="max-w-md text-sm text-purple-100">
              Here's a snapshot of your gym's performance today. Stay on top of
              your members and revenue!
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
        </div>
      ) : isError ? (
        <p className="py-10 text-center text-lg text-red-400">
          Failed to load stats.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map(({ label, value, icon, bg, glow, badge }) => (
            <div
              key={label}
              className={`${bg} ${glow} cursor-default rounded-2xl p-6 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
            >
              <div
                className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${badge}`}
              >
                {icon}
              </div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest opacity-70">
                {label}
              </p>
              <p className="text-3xl font-extrabold leading-tight">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
