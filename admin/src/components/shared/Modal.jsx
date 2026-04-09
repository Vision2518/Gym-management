import { FaTimes } from "react-icons/fa";

const Modal = ({ title, onClose, onSubmit, children, submitLabel = "Submit" }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <FaTimes />
        </button>
        <h2 className="text-xl font-bold text-white mb-6">{title}</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Modal;
