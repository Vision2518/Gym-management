import { createBrowserRouter } from "react-router-dom";
import VendorLayout from "../layout/VendorLayout.jsx";
import Login from "../components/Login";
import ErrorPage from "../components/ErrorPage";
import NotFoundPage from "../components/NotFoundPage";
import { vendorRoutes } from "./VendorRoutes";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
    errorElement: <ErrorPage />,
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