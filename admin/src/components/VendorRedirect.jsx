import { useEffect } from "react";

const vendorDashboardUrl = import.meta.env.VITE_VENDOR_DASHBOARD_URL || "";

const VendorRedirect = () => {
  useEffect(() => {
    if (vendorDashboardUrl) {
      window.location.replace(vendorDashboardUrl);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6 text-center">
      <div className="max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 text-white shadow-2xl backdrop-blur-xl">
        <h1 className="text-2xl font-bold">Vendor App Redirect</h1>
        <p className="mt-3 text-sm text-slate-300">
          This admin deployment does not bundle the vendor app.
        </p>
        <p className="mt-2 text-sm text-slate-400">
          Set <code>VITE_VENDOR_DASHBOARD_URL</code> to redirect vendor users to the vendor dashboard.
        </p>
      </div>
    </div>
  );
};

export default VendorRedirect;
