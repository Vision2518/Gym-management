import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <label className="flex flex-col text-left space-y-1.5 w-full">
      <span className="text-sm font-semibold text-gray-700 ml-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      <div className="relative w-full">
        <input
          type={inputType}
          placeholder={placeholder}
          id={id}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          className={`w-full bg-gray-50 rounded-lg border border-gray-200 outline-none ${isPassword ? "px-4 py-3 pr-12" : "px-4 py-3"}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
          </button>
        )}
      </div>
    </label>
  );
};

export default Input;
