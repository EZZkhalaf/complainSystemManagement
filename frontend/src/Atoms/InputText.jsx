import React from "react";

const InputText = ({ type, setTarget, value, width }) => {
  return (
    <div className={`mb-6 ${width}`}>
      {!width && (
        <label
          htmlFor={type}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {type}
        </label>
      )}
      <input
        id={type}
        type={type}
        value={value}
        onChange={(e) => setTarget(e.target.value)}
        placeholder={`Enter ${type}`}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${width}`}
      />
    </div>
  );
};

export default InputText;
