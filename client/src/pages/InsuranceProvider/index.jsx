import React, { useContext } from "react";
import Layout from "../../components/Layout";
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

  return <Layout component={null}/>;
};

export default InsuranceProvider;
