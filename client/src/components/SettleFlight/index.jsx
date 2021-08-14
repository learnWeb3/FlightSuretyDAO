import React, { useContext, useState, useEffect } from "react";
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
import { respondToRequest } from "../../actions";
import DateField from "../DateField/index";
import LinearProgressWithLabel from "../LinearProgressWithLabel/index";
import MuiAlert from "@material-ui/lab/Alert";

const useStyles = makeStyles(() => ({
  flex: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  overflow: {
    overflow: "auto",
    padding: 24,
  },
  overflowHeightLg: {
    maxHeight: "75vh",
  },
  overflowHeightMd: {
    height: "100vh",
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
const SettleFlight = () => {
  const {
    // contracts
    oracleContract,
    // current address
    selectedAddress,
    // data
    selectedFlight,
    userTx,
    // refresh
    refreshCounter,
    setRefreshCounter,
    // modal
    setModal,
    // alert
    setAlert,
  } = useContext(Context);
  const matches = useMediaQuery("(max-width:600px)");
  const onlyLg = useMediaQuery("(min-width:1200px");
  const classes = useStyles();
  const [isAgreed, setAggreed] = useState(false);

  const [formData, setFormData] = useState({
    realArrival: Date.now(),
    realDeparture: Date.now(),
  });

  useEffect(() => {
    if (selectedFlight) {
      setFormData({
        realArrival: parseInt(selectedFlight.estimatedArrival * 1000),
        realDeparture: parseInt(selectedFlight.estimatedDeparture * 1000),
        requestID: parseInt(
          selectedFlight.settlementRequests[
            selectedFlight.settlementRequests.length - 1
          ].requestID
        ),
      });
    }
  }, [userTx, selectedFlight]);

  const [isVoted, setIsVoted] = useState(null);

  useEffect(() => {
    userTx &&
      formData &&
      setIsVoted(
        userTx?.find(
          (tx) =>
            tx.eventName === "NewResponse" &&
            parseInt(tx.requestID) === formData.requestID
        )
          ? true
          : false
      );
  }, [userTx, formData]);

  const [errors, setErrors] = useState({
    realArrival: false,
    realDeparture: false,
  });

  const handleDepartureDateChange = (date) => {
    setFormData({ ...formData, realDeparture: date.getTime() });
  };

  const handleArrivalDateChange = (date) => {
    setFormData({ ...formData, realArrival: date.getTime() });
  };

  const handleSettle = async () => {
    try {
      const formattedRealDeparture = parseInt(
        formData.realDeparture.toString().slice(0, -3)
      );
      const formattedRealArrival = parseInt(
        formData.realArrival.toString().slice(0, -3)
      );
      const formattedRequestID = parseInt(formData.requestID);
      await respondToRequest(
        oracleContract,
        selectedAddress,
        formattedRequestID,
        formattedRealDeparture,
        formattedRealArrival
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
          <Grid
            container
            spacing={4}
            className={
              !onlyLg
                ? clsx(classes.overflow, classes.overflowHeightMd)
                : clsx(classes.overflow, classes.overflowHeightLg)
            }
          >
            {isVoted && (
              <Grid item xs={12}>
                <MuiAlert elevation={6} variant="filled" severity="info">
                  You have already shared your response
                </MuiAlert>
              </Grid>
            )}
            <Grid item xs={12}>
              <Typography
                variant="h4"
                component="h1"
                className={classes.header}
                gutterBottom
              >
                Provide flight settlement data
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
                Current flight informations
              </Typography>

              {selectedFlight && (
                <FlightCard
                  btnSubscribeInsuranceDisabled={true}
                  flightRef={selectedFlight.flightRef}
                  estimatedDeparture={selectedFlight.estimatedDeparture}
                  estimatedArrival={selectedFlight.estimatedArrival}
                  insuranceProvider={selectedFlight.insuranceProvider}
                  rate={selectedFlight.rate}
                  isLate={selectedFlight.isLate}
                  realArrival={selectedFlight.realArrival}
                  realDeparture={selectedFlight.realDeparture}
                  settled={selectedFlight.settled}
                  btnClaimInsuranceDisabled={true}
                  btnSubscribeInsuranceDisabled={true}
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
                Flight settlement consensus progress
              </Typography>
              <Paper className={classes.insurance}>
                <Grid item xs={12}>
                  <LinearProgressWithLabel
                    value={Math.ceil(
                      (selectedFlight?.settlementResponseCount * 100) / 5
                    )}
                  />
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="h5"
                component="h2"
                className={classes.header}
                gutterBottom
                color="textSecondary"
              >
                Flight settlement informations
              </Typography>
              <Paper className={classes.insurance}>
                <Grid item xs={12}>
                  <DateField
                    error={errors.realDeparture}
                    label={"Departure date"}
                    id={"departure-date"}
                    selectedDate={formData.realDeparture}
                    handleChange={handleDepartureDateChange}
                    required={true}
                    minDate={formData.realDeparture}
                  />
                </Grid>
                <Grid item xs={12}>
                  <DateField
                    label={"Arrival date"}
                    id={"arrival-date"}
                    selectedDate={formData.realArrival}
                    handleChange={handleArrivalDateChange}
                    required={true}
                    error={errors.realArrival}
                    minDate={formData.realArrival}
                  />
                </Grid>
                {!isVoted && (
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
                )}
              </Paper>
            </Grid>
            {!isVoted && (
              <Grid item xs={12} lg={6}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  className={classes.btnFullWidth}
                  disabled={!isAgreed}
                  onClick={handleSettle}
                >
                  SETTLE
                </Button>
              </Grid>
            )}

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

export default SettleFlight;
