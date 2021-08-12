import React from "react";
import Layout from "../../components/Layout";
import PageContent from './PageContent/index';

const InsuranceProvider = ({ state, setState }) => {
  return <Layout component={PageContent} state={state} setState={setState}/>;
};

export default InsuranceProvider;
