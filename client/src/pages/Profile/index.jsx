import React, { useContext } from "react";
import Context from "../../context/index";
import Layout from "../../components/Layout";
import PageContent from "./PageContent";

const Profile = ({ setState, state }) => {
  const { userTx } = useContext(Context);
  return <Layout component={PageContent} state={state} setState={setState} />;
};

export default Profile;
