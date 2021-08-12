import React, { useContext, useState } from "react";
import Context from "../../context/index";
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
  TextField,
  useMediaQuery,
} from "@material-ui/core";
import { registerFlight } from "../../actions";
import DateField from "../DateField";

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
  fullWidth: {
    width: "100%",
  },
  fullHeight: {
    height: "100vh",
  },
}));
const FlightRegistration = () => {
  const { appContract, selectedAddress, setModal, setAlert } =
    useContext(Context);
  const matches = useMediaQuery("(max-width:600px)");
  const classes = useStyles();
  const [isAgreed, setAggreed] = useState(false);
  const [formData, setFormData] = useState({
    flightRef: null,
    estimatedDeparture: Date.now(),
    estimatedArrival: Date.now(),
    rate: null,
  });

  const [errors, setErrors] = useState({
    flightRef: false,
    estimatedDeparture: false,
    estimatedArrival: false,
    rate: false,
  });
  const handleRegister = async () => {
    try {
      const { flightRef, estimatedDeparture, estimatedArrival, rate } =
        formData;
      await registerFlight(appContract, selectedAddress, {
        flightRef,
        estimatedDeparture,
        estimatedArrival,
        rate,
      });
      setAlert({
        displayed: true,
        message: "Your transaction has been processed successfully",
        type: "success",
      });
    } catch (error) {
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

  const handleChange = (event) => {
    if (event.target.id === "rate") {
      if (parseInt(event.target.value) > 1) {
        setErrors({ ...errors, [event.target.id]: true });
      } else {
        setErrors({ ...errors, [event.target.id]: false });
      }
    }
    setFormData({ ...formData, [event.target.id]: event.target.value });
  };

  const handleDepartureDateChange = (date) => {
    setFormData({ ...formData, estimatedDeparture: date.getTime() });
  };

  const handleArrivalDateChange = (date) => {
    setFormData({ ...formData, estimatedArrival: date.getTime() });
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
                Register a new flight
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                error={errors.flightRef}
                onChange={handleChange}
                className={classes.fullWidth}
                required
                id="flightRef"
                label="Flight reference"
              />
            </Grid>
            <Grid item xs={12}>
              <DateField
                error={errors.stimatedDeparture}
                label={"Departure date"}
                id={"departure-date"}
                selectedDate={formData.estimatedDeparture}
                handleChange={handleDepartureDateChange}
                required={true}
              />
            </Grid>
            <Grid item xs={12}>
              <DateField
                label={"Arrival date"}
                id={"arrival-date"}
                selectedDate={formData.estimatedArrival}
                handleChange={handleArrivalDateChange}
                required={true}
                error={errors.estimatedArrival}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                error={errors.rate}
                onChange={handleChange}
                className={classes.fullWidth}
                required
                id="rate"
                label="Rate in Eth"
                helperText={errors.rate ? "Must be less than 1 eth" : ""}
              />
            </Grid>

            <Grid item xs={12}>
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
            </Grid>

            <Grid item xs={12} lg={6}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                className={classes.fullWidth}
                disabled={
                  isAgreed &&
                  formData.rate &&
                  formData.estimatedArrival &&
                  formData.flightRef &&
                  formData.estimatedDeparture
                    ? false
                    : true
                }
                onClick={handleRegister}
              >
                REGISTER
              </Button>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                className={classes.fullWidth}
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

export default FlightRegistration;