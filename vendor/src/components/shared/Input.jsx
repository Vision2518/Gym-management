import { forwardRef } from "react";

const Input = forwardRef(
  ({ label, name, type = "text", placeholder, value, onChange, required, ...rest }, ref) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        ref={ref}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
        {...rest}
      />
    </div>
  )
);

Input.displayName = "Input";

export default Input;