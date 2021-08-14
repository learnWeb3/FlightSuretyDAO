import React from "react";
import Layout from "../../components/Layout";
// import Context from '../../context/index';
import PageContent from './PageContent/index';

const OracleProvider = ({ state, setState }) => {
  return <Layout component={PageContent} state={state} setState={setState}/>;
};

export default OracleProvider;
