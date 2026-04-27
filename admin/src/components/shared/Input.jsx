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
    <label className="flex flex-col text-left space-y-1.5 w-full">
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
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 outline-none"
        {...rest}
      />
    </label>
  );
};

export default Input;