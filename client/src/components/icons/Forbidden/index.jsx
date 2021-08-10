import React from "react";
import forbidden from "./img/403.png";

const Forbidden = ({height, width}) => {
  return (
    <img
      src={forbidden}
      alt="forbidden"
      style={{ height: height, width: width }}
    />
  );
};

export default Forbidden;
