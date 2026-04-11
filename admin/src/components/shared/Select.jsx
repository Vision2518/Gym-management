const Select = ({
  label,
  name,
  options,
  value,
  onChange,
  required = false,
}) => {
  return (
    <label className="flex flex-col text-left space-y-1.5">
      <span className="text-sm font-semibold text-gray-700 ml-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all duration-200 text-gray-900"
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt.id || opt.value} value={opt.id || opt.value}>
            {opt.name || opt.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default Select;
