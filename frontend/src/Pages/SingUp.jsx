import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../Components/AuthLayout";
import { loginHook, registerHook } from "../utils/AuthHooks";
import { useAuthContext } from "../Context/authContext";
import { toast } from "react-toastify";
import InputForm from "../MainComponents/AdminHero/InputForm";
import LinkText from "../Atoms/LinkText";

const SingUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const { login } = useAuthContext();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("the passwords dont match ");
      return;
    } else if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    // console.log(email,password)
    await registerHook(name, email, password, navigate);
  };

  const fields = [
    {
      name: "name",
      label: "name",
      type: "name",
      value: name,
      setValue: setName,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      value: email,
      setValue: setEmail,
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      value: password,
      setValue: setPassword,
    },

    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "Password",
      value: confirmPassword,
      setValue: setConfirmPassword,
    },
  ];
  return (
    <AuthLayout>
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
        Register
      </h2>

      <InputForm
        fields={fields}
        handleSubmit={handleSubmit}
        buttonText={"Register"}
      />

      <LinkText
        text={"Login"}
        header={"already Have An Account ?"}
        path={"/login"}
        textColor={"text-cyan-600"}
      />
    </AuthLayout>
  );
};

export default SingUp;
