import React, { useState } from "react";

const ComponentState = ({ component: Component }) => {
  const [state, setState] = useState(null);
  return <Component state={state} setState={setState} />;
};

export default ComponentState;
