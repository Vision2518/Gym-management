import { RouterProvider } from "react-router-dom";
import "./App.css";
import { router } from "./router/IndexRouter";
import { useDispatch } from "react-redux";
import { setUser } from "./redux/features/authState";
import { useEffect } from "react";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        if (decoded.exp * 1000 > Date.now()) {
          dispatch(setUser({ email: decoded.email, role: decoded.role }));
        } else {
          localStorage.removeItem("authToken");
        }
      } catch {
        localStorage.removeItem("authToken");
      }
    }
  }, []);

  return <RouterProvider router={router} />;
}

export default App;