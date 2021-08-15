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
import MuiAlert from "@material-ui/lab/Alert";
import {
  registerInsuranceCoverageAmendmentProposal,
  registerMembershipFeeAmendmentProposal,
} from "../../actions";

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
  fullWidth: {
    width: "100%",
  },
  fullHeight: {
    height: "100vh",
  },
}));
const ProposalRegistration = ({ type }) => {
  const {
    // contract
    appContract,
    // current address
    selectedAddress,
    // registration
    registration,
    // modal
    setModal,
    // alert
    setAlert,
    // data refresh
    refreshCounter,
    setRefreshCounter,
  } = useContext(Context);
  const matches = useMediaQuery("(max-width:600px)");
  const onlyLg = useMediaQuery("(min-width:1200px");
  const classes = useStyles();
  const [isAgreed, setAggreed] = useState(false);
  const [proposedValue, setProposedValue] = useState(null);
  const [errors, setErrors] = useState(false);
  const handleRegister = async () => {
    try {
      if (type === "insuranceCoverageRatioAmendmentProposal") {
        await registerInsuranceCoverageAmendmentProposal(
          appContract,
          selectedAddress,
          proposedValue
        );
      } else if (type === "membershipFeeAmendmentProposal") {
        await registerMembershipFeeAmendmentProposal(
          appContract,
          selectedAddress,
          proposedValue
        );
      }
      setModal({ displayed: false, content: null });
      setRefreshCounter(refreshCounter + 1);
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
    if (event.target.value === "") {
      setErrors(true);
    } else {
      setErrors(false);
    }
    setProposedValue(event.target.value);
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
              <Typography
                variant="h4"
                component="h1"
                className={classes.header}
                gutterBottom
              >
                Register a new
                {type === "membershipFeeAmendmentProposal"
                  ? " membership fee amendment "
                  : type === "insuranceCoverageRatioAmendmentProposal"
                  ? " insurance coverage ratio amendment "
                  : ""}
                proposal
              </Typography>
            </Grid>
            {registration?.isTokenHolderOldEnough ? (
              <>
                <Grid item xs={12}>
                  <TextField
                    error={errors}
                    onChange={handleChange}
                    className={classes.fullWidth}
                    required
                    id="proposedValue"
                    label="Proposed value"
                    helperText={
                      type === "membershipFeeAmendmentProposal"
                        ? "number value denominated in Eth required"
                        : type === "insuranceCoverageRatioAmendmentProposal"
                        ? "base 100 number value required"
                        : ""
                    }
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
                    variant="contained"
                    className={classes.fullWidth}
                    disabled={isAgreed && proposedValue ? false : true}
                    onClick={handleRegister}
                  >
                    REGISTER
                  </Button>
                </Grid>
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

export default ProposalRegistration;
