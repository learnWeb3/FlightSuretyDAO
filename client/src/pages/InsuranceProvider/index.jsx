import React, { useContext } from "react";
import Context from "../../context/index";

const InsuranceProvider = ({ state, setState }) => {
  const {
    // contracts
    appContract,
    tokenContract,
    oracleContract,
    // data
    flights,
    insuranceProvidersProfits,
    fundsIndicators,
    setFundsIndicators,
  } = useContext(Context);

  return null;
};

export default InsuranceProvider;
