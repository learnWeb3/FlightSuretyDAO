import React from "react";
import Layout from "../../components/Layout";
import PageContent from "./PageContent";

const VotingProposals = ({ state, setState }) => {
  return <Layout component={PageContent} state={state} setState={setState} />;
};

export default VotingProposals;
