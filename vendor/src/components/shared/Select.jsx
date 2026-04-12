import { forwardRef } from "react";

const Select = forwardRef(
  ({ label, name, options, value, onChange, required, placeholder = "Select an option", ...rest }, ref) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        ref={ref}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  )
);

Select.displayName = "Select";

export default Select;