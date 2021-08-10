import React, { useContext } from "react";
import Layout from "../../components/Layout";
import Context from "../../context/index";

const Passenger = ({ state, setState }) => {
  const {
    // contracts
    appContract,
    // data
    flights,
    selectedFlight,
    setSelectedFlight,
  } = useContext(Context);

  return <Layout component={null} />;
};

export default Passenger;
