import React from "react";
import metamask from './img/metamask_logo.png'

const MetamaskIcon = ({height, width}) => {
  return <img src={metamask} alt="metamask logo" style={{height: height, width: width}} />;
};

export default MetamaskIcon;
