import { createBrowserRouter } from "react-router-dom";
import { adminRoutes } from "./AdminRoutes";
import AdminLayout from "../layout/AdminLayout";
import Login from "../components/Login";
import ErrorPage from "../components/ErrorPage";
import NotFoundPage from "../components/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: adminRoutes,
  },
  {
    path: "*",
    element: <NotFoundPage />,
    errorElement: <ErrorPage />,
  },
]);
