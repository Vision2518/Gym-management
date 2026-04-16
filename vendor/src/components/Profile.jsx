import { useSelector } from "react-redux";

const Profile = () => {
  const token = localStorage.getItem("authToken");
  const decoded = token ? JSON.parse(atob(token.split(".")[1])) : {};
  const email = useSelector((state) => state.auth.email);

  const fields = [
    { label: "Email", value: decoded.email || email || "-" },
    { label: "Role", value: decoded.role || "-" },
    { label: "Company ID", value: decoded.company_id || "-" },
    { label: "Vendor ID", value: decoded.id || "-" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>
        <div className="bg-white/10 backdrop-blur rounded-2xl p-8 shadow-xl border border-white/5">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {decoded.email?.charAt(0)?.toUpperCase() || "V"}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{decoded.email || "Vendor"}</h2>
              <p className="text-purple-300 capitalize">{decoded.role}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {fields.map(({ label, value }) => (
              <div key={label}>
                <p className="text-sm text-purple-300 mb-1">{label}</p>
                <p className="text-white font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
