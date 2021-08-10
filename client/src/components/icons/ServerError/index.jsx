import React from "react";
import serverError from "./img/500.png";

const ServerError = ({ height, width }) => {
  return (
    <img
      src={serverError}
      alt="server error"
      style={{ height: height, width: width }}
    />
  );
};

export default ServerError;
