const Input = ({
  label,
  type = "text",
  placeholder,
  id,
  name,
  required = false,
  value,
  onChange,
  ...rest
}) => {
  return (
    <label className="flex flex-col text-left space-y-1.5">
      <span className="text-sm font-semibold text-gray-700 ml-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        id={id}
        name={name}
        required={required}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all duration-200 placeholder:text-gray-400 text-gray-900"
        value={value}
        onChange={onChange}
        {...rest}
      />
    </label>
  );
};

export default Input;
