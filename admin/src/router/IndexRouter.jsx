import { createBrowserRouter } from "react-router-dom";
import { adminRoutes } from "./AdminRoutes";
import { vendorRoutes } from "./VendorRoutes";
import AdminLayout from "../layout/AdminLayout";
import VendorLayout from "../layout/VendorLayout";
import Login from "../components/Login";
import Guard from "./Guard";
import ErrorPage from "../components/ErrorPage";
import NotFoundPage from "../components/NotFoundPage";

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
    children: vendorRoutes,
  },
  {
    path: "*",
    element: <NotFoundPage />,
    errorElement: <ErrorPage />,
  },
]);
