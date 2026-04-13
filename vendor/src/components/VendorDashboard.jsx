import { useGetVendorStatsQuery } from "../redux/features/authSlice";
import { useSelector } from "react-redux";
import { FaBuilding, FaUsers, FaChartLine, FaCalendarCheck } from "react-icons/fa";

const statCards = [
  { key: "assignedCompany", label: "Assigned Company", icon: <FaBuilding size={28} />, color: "from-blue-500 to-blue-700" },
  { key: "totalMembers", label: "Total Members", icon: <FaUsers size={28} />, color: "from-green-500 to-green-700" },
  { key: "activeSubscriptions", label: "Active Subscriptions", icon: <FaChartLine size={28} />, color: "from-purple-500 to-purple-700" },
  { key: "monthlyRevenue", label: "Monthly Revenue (Rs)", icon: <FaCalendarCheck size={28} />, color: "from-yellow-500 to-yellow-600" },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

const VendorDashboard = () => {
  const { data, isLoading, isError } = useGetVendorStatsQuery();
  const email = useSelector((state) => state.auth.email);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-8">

      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-10 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-8 shadow-2xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <p className="text-purple-200 text-lg font-medium">{getGreeting()},</p>
        <h1 className="text-4xl font-extrabold text-white mt-1">
          Welcome back, Vendor 👋
        </h1>
        <p className="text-purple-200 mt-2 text-sm">{email}</p>
        <p className="text-purple-100 mt-4 text-base max-w-xl">
          Here's what's happening with your assigned company and members today. Keep up the great work!
        </p>
        <div className="absolute right-8 top-6 text-8xl opacity-20 select-none text-white">
          <FaBuilding size={100} />
        </div>
      </div>

      {/* Stat Cards */}
      {isLoading ? (
        <p className="text-purple-200 text-center text-lg">Loading stats...</p>
      ) : isError ? (
        <p className="text-red-400 text-center text-lg">Failed to load stats.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map(({ key, label, icon, color }) => (
            <div
              key={key}
              className={`bg-gradient-to-br ${color} rounded-2xl p-6 shadow-xl text-white hover:scale-105 transition-transform duration-200`}
            >
              <div className="text-4xl mb-3">{icon}</div>
              <p className="text-sm font-medium opacity-80">{label}</p>
              <p className="text-5xl font-extrabold mt-1">
                {key === "monthlyRevenue" 
                  ? `Rs ${data?.[key]?.toLocaleString() || '0'}` 
                  : data?.[key] ?? 0
                }
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;