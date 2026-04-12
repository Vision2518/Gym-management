import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-8">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-purple-200 mb-4">Page Not Found</h2>
        <p className="text-purple-300 mb-8">The page you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate("/")}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;