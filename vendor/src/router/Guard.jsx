import { Navigate } from "react-router-dom";

const Guard = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
      return <Navigate to="/" replace />;
    }
    return children;
  } catch {
    return <Navigate to="/" replace />;
  }
};

export default Guard;