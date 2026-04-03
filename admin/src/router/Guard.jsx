import { Navigate } from "react-router-dom";
const Guard = ({ children }) => {
  // Add your authentication logic here
  const isAuthenticated = !!localStorage.getItem("authToken"); // Example check

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default Guard;
