import { createBrowserRouter } from "react-router-dom";
import { adminRoutes } from "./AdminRoutes";
import AdminLayout from "../layout/AdminLayout";
import VendorLayout from "../layout/VendorLayout";
import Login from "../components/Login";
import ErrorPage from "../components/ErrorPage";
import NotFoundPage from "../components/NotFoundPage";
import VendorRedirect from "../components/VendorRedirect";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login role="admin" />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor-login",
    element: <Login role="vendor" />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: adminRoutes,
  },
  {
    path: "/vendor",
    element: <VendorLayout />,
    errorElement: <ErrorPage />,
    children: [{ path: "*", element: <VendorRedirect /> }],
  },
  {
    path: "*",
    element: <NotFoundPage />,
    errorElement: <ErrorPage />,
  },
]);
