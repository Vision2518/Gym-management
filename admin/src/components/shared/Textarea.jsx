const Textarea = ({
  label,
  placeholder,
  name,
  required = false,
  value,
  onChange,
  minHeight = "min-h-28",
}) => {
  return (
    <label className="flex flex-col text-left space-y-1.5">
      <span className="text-sm font-semibold text-gray-700 ml-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      <textarea
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all duration-200 placeholder:text-gray-400 text-gray-900 ${minHeight}`}
      />
    </label>
  );
};

export default Textarea;
