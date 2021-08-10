import React, { useEffect, useContext } from "react";
import Layout from "../../components/Layout";
import Context from "../../context/index";

const DAO = ({ state, setState }) => {
  const {
    // contracts
    appContract,
    tokenContract,
    oracleContract,
    // data
    currentMembershipApplications,
    settingsAmendmentProposal,
    daoIndicators,
  } = useContext(Context);

  return <Layout component={null}/>;
};

export default DAO;
