import InputText from "../../Atoms/InputText";
import SubmitButton from "../../Atoms/SubmitButton";

const InputForm = ({ fields, handleSubmit, buttonText }) => {
  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      {fields.map((f, index) => (
        <InputText
          key={index}
          type={f.type}
          setTarget={f.setValue}
          value={f.value}
        />
      ))}
      <SubmitButton type={"submit"} text={buttonText} />
    </form>
  );
};

export default InputForm;
