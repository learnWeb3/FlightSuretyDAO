import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import ComponentState from "./hoc/ComponentState/index";

ReactDOM.render(
  <ComponentState component={App} />,
  document.getElementById("root")
);
