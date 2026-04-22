import { useGetDashboardStatsQuery } from "../redux/features/authSlice";
import { useSelector } from "react-redux";
import {
  FaBuilding,
  FaHandshake,
  FaUsers,
  FaRupeeSign,
  FaDumbbell,
  FaRegHandPaper,
} from "react-icons/fa";

const statCards = [
  {
    key: "totalCompanies",
    label: "Total Companies",
    icon: <FaBuilding size={28} />,
    color: "from-blue-500 to-blue-700",
  },
  {
    key: "totalVendors",
    label: "Total Vendors",
    icon: <FaHandshake size={28} />,
    color: "from-purple-500 to-purple-700",
  },
  {
    key: "totalMembers",
    label: "Total Members",
    icon: <FaUsers size={28} />,
    color: "from-green-500 to-green-700",
  },
  {
    key: "totalRevenue",
    label: "Total Revenue (Rs)",
    icon: <FaRupeeSign size={28} />,
    color: "from-yellow-500 to-yellow-600",
  },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

const AdminDashboard = () => {
  const { data, isLoading, isError } = useGetDashboardStatsQuery();
  const email = useSelector((state) => state.auth.email);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8">
      <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-2xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <p className="text-lg font-medium text-blue-200">{getGreeting()},</p>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="text-4xl font-extrabold text-white">
            Welcome back, Super Admin
          </h1>
          <FaRegHandPaper className="text-white/90" size={28} />
        </div>
        <p className="mt-2 text-sm text-blue-200">{email}</p>
        <p className="mt-4 max-w-xl text-base text-blue-100">
          Here's what's happening across your gym network today. Keep up the
          great work managing your companies and vendors!
        </p>
        <div className="absolute right-8 top-6 select-none text-white opacity-20">
          <FaDumbbell size={100} />
        </div>
      </div>

      {isLoading ? (
        <p className="text-center text-lg text-blue-200">Loading stats...</p>
      ) : isError ? (
        <p className="text-center text-lg text-red-400">Failed to load stats.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map(({ key, label, icon, color }) => (
            <div
              key={key}
              className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-xl transition-transform duration-200 hover:scale-105`}
            >
              <div className="mb-3 text-4xl">{icon}</div>
              <p className="text-sm font-medium opacity-80">{label}</p>
              <p className="mt-1 text-5xl font-extrabold">{data?.[key] ?? 0}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
