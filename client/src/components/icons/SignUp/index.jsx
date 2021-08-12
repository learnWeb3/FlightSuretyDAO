import React from "react";
import signUp from "./img/sign_up.png";

const SignUp = ({ height, width }) => {
  return (
    <img src={signUp} alt="register" style={{ height: height, width: width }} />
  );
};

export default SignUp;
