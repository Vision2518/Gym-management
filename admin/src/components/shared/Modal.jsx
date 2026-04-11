import { FaTimes } from "react-icons/fa";

const DetailsModal = ({
  show = false,
  onClose,
  title = "Details",
  children,
  footerContent = null,
  size = "md",
}) => {
  if (!show) return null;

  const sizeClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
    "3xl": "sm:max-w-3xl",
    "4xl": "sm:max-w-4xl",
    "5xl": "sm:max-w-5xl",
    "6xl": "sm:max-w-6xl",
    "7xl": "sm:max-w-7xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Modal container */}
        <div
          className={`inline-block align-bottom bg-white text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} w-full relative max-h-[95vh] border border-gray-200`}
        >
          {/* Modern Header */}
          <div className="relative bg-white border-b border-gray-100">
            <div className="flex items-center justify-between px-8 py-6">
              <div className="flex items-center space-x-3">
                <div className="w-1 h-8 bg-red-500 rounded-full"></div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                    {title}
                  </h3>
                  <div className="w-12 h-0.5 bg-red-500 mt-1 rounded-full"></div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="group p-3  rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              >
                <FaTimes className="h-5 w-5 text-red-400 group-hover:text-red-600 transition-all duration-500 transform hover:rotate-[360deg]" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6 overflow-y-auto max-h-[calc(95vh-140px)]">
            {children}
          </div>

          {/* Optional footer */}
          {footerContent && (
            <div className="bg-gray-50/50 px-8 py-6 border-t border-gray-100">
              {footerContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;
