import React, { useContext, useEffect } from "react";
import { Button, Container, Grid, Hidden, Typography } from "@material-ui/core";
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
import { useHistory } from "react-router-dom";
import InsuranceProviderRegistration from "../../../components/InsuranceProviderRegistration/index.jsx/index";

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
  const history = useHistory();
  const classes = useStyles();
  const {
    // current Address
    selectedAddress,
    // contracts
    appContract,
    // alert
    setAlert,
    // data
    registration,
    // modal
    setModal,
    // data refresh
    refreshCounter,
    setRefreshCounter,
  } = useContext(Context);

  useEffect(() => {
    if (appContract && registration) {
      if (
        registration.isFundedInsuranceProvider &&
        !registration.isActivatedInsuranceProvider
      ) {
        setState({
          status: "error",
          code: 403,
          message:
            "Your address is already registered, please wait for your approval by the community",
        });
      } else {
        setState({ status: "loaded", code: null });
      }
    }
  }, [registration, appContract]);

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
      history.push("/oracle-provider");
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
    setModal({ displayed: true, content: InsuranceProviderRegistration });
  };

  return (
    <Container>
      <Grid container spacing={4}>
        {state.status === "loaded" && (
          <>
            <Hidden mdDown={true}>
              <Grid item lg={3}></Grid>
            </Hidden>
            <Grid xs={12} item lg={6} className={classes.flex}>
              <MuiAlert elevation={6} variant="filled" severity="info">
                Registering as a service provider for the flight surety funds
                require to lock up a membership fee, in exchange for your
                participation in the mutualised fund you will be rewarded with
                the FSS token giving you direct rights on the profits made by
                the community and gives you the opportunity to vote on various
                community driven proposals on a 1 token equal 1 vote basis
              </MuiAlert>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                className={classes.header}
              >
                Welcome to The FlightSurety DAO !
              </Typography>
              <SignUp width="50%" />
              {registration.isActivatedInsuranceProvider && (
                <Button
                  onClick={handleInsuranceProviderRegistration}
                  className={classes.button}
                  variant="contained"
                  color="primary"
                >
                  NEW INSURANCE PROVIDER
                </Button>
              )}

              {registration.isRegisteredInsuranceProvider &&
                !registration.isActivatedInsuranceProvider &&
                !registration.isFundedInsuranceProvider && (
                  <Button
                    onClick={handleInsuranceProviderRegistration}
                    className={classes.button}
                    variant="contained"
                    color="primary"
                  >
                    ACTIVATE MY ACCOUNT
                  </Button>
                )}

              {registration.isRegisteredInsuranceProvider &&
                !registration.isActivatedInsuranceProvider &&
                registration.isFundedInsuranceProvider && (
                  <MuiAlert elevation={6} variant="filled" severity="info">
                    Thanks for the funding of your account, please wait your
                    approval from the community before registering your flights
                  </MuiAlert>
                )}

              {!registration.isRegisteredInsuranceProvider &&
                !registration.isRegisteredOracleProvider && (
                  <Button
                    onClick={handleOracleProviderRegistration}
                    className={classes.button}
                    variant="contained"
                    color="primary"
                  >
                    ORACLE PROVIDER
                  </Button>
                )}
            </Grid>
            <Hidden mdDown={true}>
              <Grid item lg={3}></Grid>
            </Hidden>
          </>
        )}

        {state.status === "error" && (
          <Grid item xs={12}>
            <ErrorPage
              code={state.code}
              height="95vh"
              message={state.message}
            />
          </Grid>
        )}

        {state.status === "loading" && (
          <Grid item xs={12}>
            <LoadingAnimation />
          </Grid>
        )}
        {state.status === "nocontent" && (
          <Grid item xs={12}>
            <NoContent fontSize="6rem" message="Nothing just yet ..." />
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default PageContent;
