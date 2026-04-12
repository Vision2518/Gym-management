import { forwardRef } from "react";

const Textarea = forwardRef(
  ({ label, name, placeholder, value, onChange, required, rows = 4, ...rest }, ref) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <textarea
        ref={ref}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none"
        {...rest}
      />
    </div>
  )
);

Textarea.displayName = "Textarea";

export default Textarea;