import React, { useContext, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import {
  Hidden,
  Grid,
  Typography,
  Paper,
  Button,
  FormControlLabel,
  Checkbox,
  useMediaQuery,
} from "@material-ui/core";
import FlightCard from "../FlightCard/index";
import Context from "../../context/index";
import { registerInsurance } from "../../actions";
import { useComponentState } from "../../hooks";

const useStyles = makeStyles(() => ({
  flex: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  overflow: {
    overflow: "auto",
    height: "100%",
    padding: 24,
  },
  root: {
    padding: 24,
  },
  insurance: {
    padding: 24,
  },
  flight: {
    marginBottom: 24,
  },
  btnFullWidth: {
    width: "100%",
  },
  fullHeight: {
    height: "100vh",
  },
}));
const InsuranceSubscription = () => {
  const {
    // contracts
    appContract,
    // current address
    selectedAddress,
    // data
    selectedFlight,
    // refresh
    refreshCounter,
    setRefreshCounter,
    // modal
    setModal,
    // alert
    setAlert,
  } = useContext(Context);
  const matches = useMediaQuery("(max-width:600px)");
  const classes = useStyles();
  const [isAgreed, setAggreed] = useState(false);
  const handleSubscribe = async () => {
    try {
      await registerInsurance(
        appContract,
        selectedAddress,
        selectedFlight.flightID,
        `${selectedFlight.rate}`
      );
      setModal({ displayed: false, content: null });
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

  const handleCancel = () => {
    setModal({ displayed: false, content: null });
  };
  return (
    <>
      <Hidden mdDown={true}>
        <Grid item lg={4}></Grid>
      </Hidden>
      <Grid item xs={12} lg={4} className={classes.flex}>
        <Paper
          className={
            matches ? clsx(classes.root, classes.fullHeight) : classes.root
          }
        >
          <Grid container spacing={4} className={classes.overflow}>
            <Grid item xs={12}>
              <Typography
                variant="h4"
                component="h1"
                className={classes.header}
                gutterBottom
              >
                Your insurance
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="h5"
                component="h2"
                className={classes.header}
                gutterBottom
                color="textSecondary"
              >
                Your flight
              </Typography>

              {selectedFlight && (
                <FlightCard
                  btnSubscribeInsuranceDisabled={true}
                  flightRef={selectedFlight.flightRef}
                  estimatedDeparture={selectedFlight.estimatedDeparture}
                  estimatedArrival={selectedFlight.estimatedArrival}
                  insuranceProvider={selectedFlight.insuranceProvider}
                  rate={selectedFlight.rate}
                />
              )}
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="h5"
                component="h2"
                className={classes.header}
                gutterBottom
                color="textSecondary"
              >
                Your insurance
              </Typography>

              <Paper className={classes.insurance}>
                <Typography
                  variant="body1"
                  component="p"
                  className={classes.header}
                  gutterBottom
                >
                  Insurance amount : {appContract.utils.fromWei(selectedFlight.rate)} Eth
                </Typography>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isAgreed}
                      onChange={() => setAggreed(!isAgreed)}
                      name="terms-of-use"
                      color="primary"
                    />
                  }
                  label="I have read and agree to the terms of use"
                />
              </Paper>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                className={classes.btnFullWidth}
                disabled={!isAgreed}
                onClick={handleSubscribe}
              >
                SUBSCRIBE
              </Button>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                className={classes.btnFullWidth}
                onClick={handleCancel}
              >
                CANCEL
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      <Hidden mdDown={true}>
        <Grid itemlg={4}></Grid>
      </Hidden>
    </>
  );
};

export default InsuranceSubscription;
