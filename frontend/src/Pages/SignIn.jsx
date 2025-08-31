import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../Components/AuthLayout";
import { loginHook } from "../utils/AuthHooks";
import { useAuthContext } from "../Context/authContext";
import InputForm from "../MainComponents/AdminHero/InputForm";
import LinkText from "../Atoms/LinkText";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const handleSubmit = async (e) => {
    e.preventDefault();
    await loginHook(email, password, navigate, login);
  };

  const fields = [
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
  ];
  return (
    <AuthLayout>
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
        Login
      </h2>

      <InputForm
        fields={fields}
        handleSubmit={handleSubmit}
        buttonText={"Login"}
      />

      <LinkText
        text={"Create One"}
        header={"Don’t have an account?"}
        path={"/register"}
        textColor={"text-cyan-600"}
      />

      <LinkText
        text={"forgot password ? "}
        path={"/enter-forgotten-email"}
        textColor={"text-red-600"}
      />
    </AuthLayout>
  );
};

export default SignIn;
