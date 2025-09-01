import React from "react";

const InputWithLabel = ({
  title,
  type,
  name,
  value,
  id,
  onChange,
  isEditing,
  noEditValue,
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {title}
      </label>

      {isEditing ? (
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      ) : (
        <p className="mt-1 p-2 border border-gray-200 bg-gray-50 rounded">
          {noEditValue}
        </p>
      )}
    </div>
  );
};

export default InputWithLabel;
