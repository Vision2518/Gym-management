import { FaTimes } from "react-icons/fa";

const Modal = ({
  show = false,
  onClose,
  onSubmit,
  title = "Modal",
  children,
  submitLabel = "Submit",
  submitLoadingLabel = "Submitting...",
  isSubmitting = false,
  footerContent = null,
  size = "md",
}) => {
  if (!show) return null;

  const sizeClasses = {
    sm: "sm:max-w-sm", md: "sm:max-w-md", lg: "sm:max-w-lg",
    xl: "sm:max-w-xl", "2xl": "sm:max-w-2xl", "3xl": "sm:max-w-3xl",
    "4xl": "sm:max-w-4xl", "5xl": "sm:max-w-5xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className={`inline-block align-bottom bg-white text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} w-full relative max-h-[95vh] border border-gray-200 rounded-2xl`}>
          {/* Header */}
          <div className="relative bg-white border-b border-gray-100">
            <div className="flex items-center justify-between px-8 py-6">
              <div className="flex items-center space-x-3">
                <div className="w-1 h-8 bg-purple-500 rounded-full"></div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 leading-tight">{title}</h3>
                  <div className="w-12 h-0.5 bg-purple-500 mt-1 rounded-full"></div>
                </div>
              </div>
              <button type="button" onClick={onClose} className="group p-3 rounded-xl focus:outline-none">
                <FaTimes className="h-5 w-5 text-purple-400 group-hover:text-purple-600 transition-all duration-500 hover:rotate-[360deg]" />
              </button>
            </div>
          </div>
          {/* Content + Form */}
          <form onSubmit={onSubmit}>
            <div className="px-8 py-6 overflow-y-auto max-h-[calc(95vh-200px)] space-y-4">
              {children}
            </div>
            <div className="bg-gray-50/50 px-8 py-6 border-t border-gray-100">
              {footerContent ?? (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  {isSubmitting ? submitLoadingLabel : submitLabel}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Modal;
