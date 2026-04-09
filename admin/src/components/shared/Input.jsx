const Input = ({ label, type = "text", placeholder, id, name, required = false, value, onChange }) => {
  return (
    <label className="flex flex-col text-left">
      <span>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        id={id}
        name={name}
        required={required}
        className="border p-2 rounded"
        value={value}
        onChange={onChange}
      />
    </label>
  );
};

export default Input;
