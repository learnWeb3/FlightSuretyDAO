import React, { useContext, useState, useEffect } from "react";
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
import MuiAlert from "@material-ui/lab/Alert";
import {
  voteInsuranceProviderMembership,
  voteOracleProviderMembership,
} from "../../../actions";

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
const VoteMembership = ({ type, votee }) => {
  const {
    // contract
    appContract,
    // current address
    selectedAddress,
    // registration
    registration,
    // data
    userTx,
    // modal
    setModal,
    // alert
    setAlert,
    // data refresh
    refreshCounter,
    setRefreshCounter,
  } = useContext(Context);
  const classes = useStyles();
  const matches = useMediaQuery("(max-width:600px)");
  const onlyLg = useMediaQuery("(min-width:1200px");
  const [isAgreed, setAggreed] = useState(false);
  const [formData, setFormData] = useState({
    voter: selectedAddress,
    votee,
  });
  const [errors, setErrors] = useState({
    flightRef: false,
    estimatedDeparture: false,
    estimatedArrival: false,
    rate: false,
  });

  const [isVoted, setIsVoted] = useState(null);
  useEffect(() => {
    setIsVoted(
      userTx?.find((tx) =>
        (tx.eventName === "NewVoteInsuranceProvider" &&
          tx.voter.toLowerCase()  === selectedAddress.toLowerCase()  &&
          tx.votee.toLowerCase()  === votee.toLowerCase() ) ||
        (tx.eventName === "NewVoteOracleProvider" &&
          tx.voter.toLowerCase() === selectedAddress.toLowerCase()  &&
          tx.votee.toLowerCase()  === votee.toLowerCase() )
          ? true
          : false
      )
    );
  }, [userTx]);
  const handleRegister = async () => {
    try {
      if (type === "insuranceProvider") {
        await voteInsuranceProviderMembership(
          appContract,
          selectedAddress,
          formData.votee
        );
      } else if (type === "oracleProvider") {
        await voteOracleProviderMembership(
          appContract,
          selectedAddress,
          formData.votee
        );
      }
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

  const handleChange = (event) => {
    if (parseInt(event.target.value) === "") {
      setErrors({ ...errors, [event.target.id]: true });
    } else {
      setErrors({ ...errors, [event.target.id]: false });
    }
    setFormData({ ...formData, [event.target.id]: event.target.value });
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
                  You have already voted up this member
                </MuiAlert>
              </Grid>
            )}

            {registration?.isTokenHolderOldEnough ? (
              <>
                <Grid item xs={12}>
                  <Typography
                    variant="h4"
                    component="h1"
                    className={classes.header}
                    gutterBottom
                  >
                    Vote
                    {type === " insuranceProvider"
                      ? "insurance provider "
                      : " oracle provider "}
                    membership
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    error={errors.flightRef}
                    onChange={handleChange}
                    className={classes.fullWidth}
                    required
                    id="voter"
                    label="Voter address"
                    helperText={errors.voter ? "Required" : ""}
                    value={formData.voter}
                    disabled={true}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    error={errors.rate}
                    onChange={handleChange}
                    className={classes.fullWidth}
                    required
                    id="votee"
                    label="Votee address"
                    helperText={errors.votee ? "Required" : ""}
                    value={formData.votee}
                  />
                </Grid>

                {!isVoted && (
                  <>
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
                        variant="contained"
                        className={classes.fullWidth}
                        disabled={
                          isAgreed && formData.voter && formData.votee
                            ? false
                            : true
                        }
                        onClick={handleRegister}
                      >
                        VOTE
                      </Button>
                    </Grid>
                  </>
                )}
              </>
            ) : (
              <Grid item xs={12}>
                <MuiAlert elevation={6} variant="filled" severity="info">
                  Unfortunately you can not participate in community decisions
                  yet, please check our documentation in order to find out why.
                </MuiAlert>
              </Grid>
            )}

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

export default VoteMembership;
