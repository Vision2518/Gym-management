import { forwardRef, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Input = forwardRef(
  ({ label, name, type = "text", placeholder, value, onChange, required, ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="relative">
          <input
            ref={ref}
            name={name}
            type={inputType}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            className={`w-full rounded-xl border border-gray-200 focus:outline-none ${isPassword ? "px-4 py-3 pr-12" : "px-4 py-3"}`}
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
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
