import React, {useContext} from "react";
import { useProvider } from "../../hooks";
import Context from "../../context/index";

const Admin = ({ setState, state }) => {
  const {
    // contracts
    appContract,
    tokenContract,
    oracleContract,
    // data
    fundsIndicators,
    daoIndicators,
  } = useContext(Context);
  const { provider, selectedAddress } = useProvider(setState);
  return null;
};

export default Admin;
