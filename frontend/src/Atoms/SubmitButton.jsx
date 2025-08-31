const SubmitButton = ({ text, type }) => {
  return (
    <button
      type={type}
      className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
    >
      {text}
    </button>
  );
};

export default SubmitButton;
