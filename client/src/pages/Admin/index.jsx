import React from "react";
import Layout from "../../components/Layout";
import PageContent from "./PageContent";

const Admin = ({ setState, state }) => {
  return <Layout component={PageContent} state={state} setState={setState} />;
};

export default Admin;
