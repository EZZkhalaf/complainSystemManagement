import InputText from "../../Atoms/InputText";
import SubmitButton from "../../Atoms/SubmitButton";

const InputForm = ({
  fields,
  handleSubmit,
  buttonText,
  cancelButton,
  onClickCancel,
  css,
  submitButtonCss,
}) => {
  return (
    <form onSubmit={(e) => handleSubmit(e)} className={`${css}`}>
      {fields.map((f, index) => (
        <InputText
          key={index}
          type={f.type}
          setTarget={f.setValue}
          value={f.value}
        />
      ))}
      <SubmitButton
        type={"submit"}
        text={buttonText}
        submitButtonCss={submitButtonCss}
      />
      {cancelButton && (
        <button
          type="button"
          onClick={onClickCancel}
          className="bg-red-600 text-white px-3 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      )}
    </form>
  );
};

export default InputForm;
