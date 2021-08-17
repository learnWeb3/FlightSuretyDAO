import React, { useContext, useState } from "react";
import Context from "../../../context/index";
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
import {
  fetchCurrentMembershipFee,
  fundInsuranceProvider,
  registerInsuranceProvider,
} from "../../../actions";
import { useHistory } from "react-router-dom";

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
const InsuranceProviderRegistration = ({ type, votee }) => {
  const {
    // contract
    appContract,
    // current address
    selectedAddress,
    // registrations
    registration,
    // modal
    setModal,
    // alert
    setAlert,
    // data refresh
    refreshCounter,
    setRefreshCounter,
  } = useContext(Context);
  const classes = useStyles();
  const history = useHistory();
  const matches = useMediaQuery("(max-width:600px)");
  const onlyLg = useMediaQuery("(min-width:1200px");
  const [isAgreed, setAggreed] = useState(false);
  const [formData, setFormData] = useState({
    insuranceProviderAddress: "",
  });
  const [errors, setErrors] = useState({
    insuranceProviderAddress: false,
  });

  const handleActivate = async () => {
    try {
      const value = await fetchCurrentMembershipFee(
        appContract,
        selectedAddress
      );
      await fundInsuranceProvider(appContract, selectedAddress, value);

      setModal({ displayed: false, content: null });
      setAlert({
        displayed: true,
        message: "Your transaction has been processed successfully",
        type: "success",
      });
      setRefreshCounter(refreshCounter + 1);
      history.push("/insurance-provider");
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

  const handleRegister = async () => {
    try {
      const insuranceProviderAddress =
        formData.insuranceProviderAddress.toLowerCase();
      await registerInsuranceProvider(
        appContract,
        insuranceProviderAddress,
        selectedAddress
      );

      setModal({ displayed: false, content: null });
      setAlert({
        displayed: true,
        message: "Your transaction has been processed successfully",
        type: "success",
      });
      setRefreshCounter(refreshCounter + 1);
      history.push("/insurance-provider");
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

  const handleChange = (event) => {
    if (event.target.value === "") {
      setErrors({ insuranceProviderAddress: true });
    } else {
      setErrors({ insuranceProviderAddress: false });
    }
    setFormData({ insuranceProviderAddress: event.target.value });
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
            <Grid item xs={12}>
              {registration?.isRegisteredInsuranceProvider &&
                !registration?.isActivatedInsuranceProvider && (
                  <Typography
                    variant="h4"
                    component="h1"
                    className={classes.header}
                    gutterBottom
                  >
                    Activate my insurance provider account
                  </Typography>
                )}

              {registration?.isRegisteredInsuranceProvider &&
                registration?.isActivatedInsuranceProvider && (
                  <Typography
                    variant="h4"
                    component="h1"
                    className={classes.header}
                    gutterBottom
                  >
                    Register a new insurance provider
                  </Typography>
                )}
            </Grid>

            {registration?.isRegisteredInsuranceProvider &&
              registration?.isActivatedInsuranceProvider && (
                <Grid item xs={12}>
                  <TextField
                    error={errors.insuranceProviderAddress}
                    onChange={handleChange}
                    className={classes.fullWidth}
                    required
                    id="insuranceProviderAddress"
                    label="Insurance provider address"
                    helperText={
                      errors.insuranceProviderAddress ? "Required" : ""
                    }
                    value={formData.insuranceProviderAddress}
                  />
                </Grid>
              )}

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
              {registration?.isRegisteredInsuranceProvider &&
                registration?.isActivatedInsuranceProvider && (
                  <Button
                    variant="contained"
                    color="primary"
                    variant="contained"
                    className={classes.fullWidth}
                    disabled={
                      isAgreed && formData.insuranceProviderAddress
                        ? false
                        : true
                    }
                    onClick={handleRegister}
                  >
                    REGISTER
                  </Button>
                )}

              {registration?.isRegisteredInsuranceProvider &&
                !registration?.isActivatedInsuranceProvider && (
                  <Button
                    variant="contained"
                    color="primary"
                    variant="contained"
                    className={classes.fullWidth}
                    disabled={!isAgreed}
                    onClick={handleActivate}
                  >
                    ACTIVATE MY ACCOUNT
                  </Button>
                )}
            </Grid>

            <Grid item xs={12} lg={6}>
              <Button
                variant="contained"
                color="secondary"
                variant="contained"
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

export default InsuranceProviderRegistration;
