import React, { useEffect, useContext } from "react";
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

  return null;
};

export default DAO;
