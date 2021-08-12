import React, { useContext, useEffect } from "react";
import { Button, Grid, Hidden, Typography } from "@material-ui/core";
import Context from "../../../context/index";
import { makeStyles } from "@material-ui/core/styles";
import SignUp from "../../../components/icons/SignUp/index";
import MuiAlert from "@material-ui/lab/Alert";
import {
  fetchCurrentMembershipFee,
  registerInsuranceProvider,
  registerOracleProvider,
} from "../../../actions";
import { ErrorPage } from "../../../components/Error";
import LoadingAnimation from "../../../components/LoadingAnimation";
import NoContent from "../../../components/icons/NoContent/index";

const useStyles = makeStyles(() => ({
  flex: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
  },
  button: {
    marginTop: "2rem",
    marginBottom: "2rem",
    width: "75%",
  },
  header: {
    marginTop: "2rem",
    marginBottom: "2rem",
    textAlign: "center",
  },
}));

const PageContent = ({ state, setState }) => {
  const classes = useStyles();
  const {
    // current Address
    selectedAddress,
    // contracts
    appContract,
    // alert
    setAlert,
    // data refresh
    refreshCounter,
    setRefreshCounter,
  } = useContext(Context);

  useEffect(() => {
    appContract && setState({ status: "loaded", code: null });
  }, [appContract]);

  const handleOracleProviderRegistration = async () => {
    try {
      const value = await fetchCurrentMembershipFee(
        appContract,
        selectedAddress
      );
      await registerOracleProvider(appContract, selectedAddress, value);
      setAlert({
        displayed: true,
        message: "Your transaction has been processed successfully",
        type: "success",
      });
      setRefreshCounter(refreshCounter + 1);
    } catch (error) {
      console.log(error);
      setAlert({
        displayed: true,
        message:
          "Sorry we were unable to process your transaction please try again or contact the support team",
        type: "error",
      });
    }
  };

  const handleInsuranceProviderRegistration = async () => {
    try {
      const value = await fetchCurrentMembershipFee(
        appContract,
        selectedAddress
      );
      await registerInsuranceProvider(appContract, selectedAddress, value);
      setAlert({
        displayed: true,
        message: "Your transaction has been processed successfully",
        type: "success",
      });
      setRefreshCounter(refreshCounter + 1);
    } catch (error) {
      console.log(error);
      setAlert({
        displayed: true,
        message:
          "Sorry we were unable to process your transaction please try again or contact the support team",
        type: "error",
      });
    }
  };

  return state.status === "loaded" ? (
    <Grid container spacing={4}>
      <Hidden mdDown={true}>
        <Grid item lg={3}></Grid>
      </Hidden>
      <Grid xs={12} item lg={6} className={classes.flex}>
        <MuiAlert elevation={6} variant="filled" severity="info">
          Registering as a service provider for the flight surety funds require
          to lock up a membership fee, in exchange for your participation in the
          mutualised fund you will be rewarded with the FSS token giving you
          direct rights on the profits made by the community and gives you the
          opportunity to vote on various community driven proposals on a 1 token
          equal 1 vote basis
        </MuiAlert>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          className={classes.header}
        >
          Welcome to The FlighSurety DAO !
        </Typography>
        <SignUp width="50%" />
        <Button
          onClick={handleInsuranceProviderRegistration}
          className={classes.button}
          variant="contained"
          color="primary"
        >
          INSURANCE PROVIDER
        </Button>
        <Button
          onClick={handleOracleProviderRegistration}
          className={classes.button}
          variant="contained"
          color="primary"
        >
          ORACLE PROVIDER
        </Button>
      </Grid>
      <Hidden mdDown={true}>
        <Grid item lg={3}></Grid>
      </Hidden>
    </Grid>
  ) : state.status === "error" ? (
    <ErrorPage code={state.code} height="100%" />
  ) : state.status === "loading" ? (
    <LoadingAnimation />
  ) : (
    state.status === "nocontent" && (
      <NoContent fontSize="6rem" message="Nothing just yet ..." />
    )
  );
};

export default PageContent;
