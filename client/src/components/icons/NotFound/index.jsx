import React from "react";
import notFound from "./img/404.png";

const NotFound = ({ height, width }) => {
  return (
    <img
      src={notFound}
      alt="forbidden"
      style={{ height: height, width: width }}
    />
  );
};

export default NotFound;
