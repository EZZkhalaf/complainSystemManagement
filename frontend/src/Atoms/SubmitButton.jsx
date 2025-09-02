const SubmitButton = ({ text, type, submitButtonCss, onClick }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${
        submitButtonCss
          ? "bg-blue-600 text-white px-3 py-2 rounded hover:bg-green-700"
          : "w-full  text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
      }`}
    >
      {text}
    </button>
  );
};

export default SubmitButton;
