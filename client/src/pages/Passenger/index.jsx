import React from "react";
import Layout from "../../components/Layout";
import PageContent from "./PageContent";

const Passenger = ({ state, setState }) => {
  return <Layout component={PageContent} state={state} setState={setState} />;
};

export default Passenger;
