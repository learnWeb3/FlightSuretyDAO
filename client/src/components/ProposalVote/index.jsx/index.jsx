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
  voteInsuranceCoverageAmendmentProposal,
  voteMembershipFeeAmendmentProposal,
} from "../../../actions";

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
const ProposalVote = ({ type, proposalID, proposedValue }) => {
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
  const [isVoted, setIsVoted] = useState(null);

  useEffect(() => {
    userTx &&
      setIsVoted(
        userTx?.find((tx) =>
          (tx.eventName === "NewVoteInsuranceCoverageAmendmentProposal" &&
            tx.voter.toLowerCase()  === selectedAddress.toLowerCase()  &&
            tx.proposalID  === proposalID ) ||
          (tx.eventName === "NewVoteMembershipFeeAmendmentProposal" &&
            tx.voter.toLowerCase()  === selectedAddress.toLowerCase()  &&
            tx.proposalID === proposalID)
            ? true
            : false
        )
      );
  }, [userTx]);

  const handleRegister = async () => {
    try {
      if (type === "membershipFeeAmendmentProposal") {
        await voteMembershipFeeAmendmentProposal(
          appContract,
          selectedAddress,
          proposalID
        );
      } else if (type === "insuranceCoverageRatioAmendmentProposal") {
        await voteInsuranceCoverageAmendmentProposal(
          appContract,
          selectedAddress,
          proposalID
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
      setModal({ displayed: false, content: null });
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
                  You have already voted up this proposal
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
                    {type === "membershipFeeAmendmentProposal"
                      ? " membership amendement proposal"
                      : type === "insuranceCoverageRatioAmendmentProposal"
                      ? " insurance coverage amendment proposal"
                      : ""}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    className={classes.fullWidth}
                    required
                    id="voter"
                    label="Voter address"
                    value={selectedAddress}
                    disabled={true}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    className={classes.fullWidth}
                    required
                    id="proposedValue"
                    label="Proposed value"
                    value={proposedValue}
                    disabled={true}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    className={classes.fullWidth}
                    required
                    id="proposalID"
                    label="Proposal ID"
                    value={proposalID}
                    disabled={true}
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
                        disabled={isAgreed ? false : true}
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

export default ProposalVote;
