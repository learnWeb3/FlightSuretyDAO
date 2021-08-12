import React, { useContext, useEffect, useState } from "react";
import { Button, Container, Grid, Typography } from "@material-ui/core";
import Context from "../../../context/index";
import { makeStyles } from "@material-ui/core/styles";
import MyDataGrid from "../../../components/MyDataGrid";
import LoadingAnimation from "../../../components/LoadingAnimation";
import NoContent from "../../../components/icons/NoContent";
import { ErrorPage } from "../../../components/Error";
import ProposalVote from "../../../components/ProposalVote/index.jsx/index";
import ProposalRegistration from "../../../components/ProposalRegistration/index";
import moment from "moment";

const useStyles = makeStyles(() => ({
  header: {
    marginBottom: 32,
  },
}));

const PageContent = ({ state, setState }) => {
  const classes = useStyles();
  const {
    // data
    settingsAmendmentProposal,
    // modal
    setModal,
  } = useContext(Context);

  const [
    formattedSettingsAmendmentProposal,
    setFormattedSettingsAmendmentProposal,
  ] = useState(null);

  const handleClickMembershipFeeAmendmentProposalsDataGrid = ({
    row: { proposalID, proposedMembershipFee },
  }) => {
    setModal({
      displayed: true,
      content: ProposalVote,
      props: {
        type: "membershipFeeAmendmentProposal",
        proposalID: proposalID,
        proposedValue: proposedMembershipFee,
      },
    });
  };

  const handleClickInsuranceCoverageRatioAmendmentProposalsDataGrid = ({
    row: { proposalID, insuranceCoverage },
  }) => {
    setModal({
      displayed: true,
      content: ProposalVote,
      props: {
        type: "insuranceCoverageRatioAmendmentProposal",
        proposalID: proposalID,
        proposedValue: insuranceCoverage,
      },
    });
  };

  useEffect(() => {
    if (settingsAmendmentProposal) {
      if (settingsAmendmentProposal) {
        const _formattedSettingsAmendmentProposal = {
          membershipFeeAmendmentProposals:
            settingsAmendmentProposal.membershipFeeAmendmentProposals.map(
              (proposal) => ({
                ...proposal,
                timestamp: moment(proposal.timestamp * 1000)
                  .format("MMMM Do YYYY h:mm:ss a")
                  .toString(),
                proposedValue: proposal.proposedMembershipFee,
              })
            ),
          insuranceCoverageAmendmentProposals:
            settingsAmendmentProposal.insuranceCoverageAmendmentProposals.map(
              (proposal) => ({
                ...proposal,
                timestamp: moment(proposal.timestamp * 1000)
                  .format("MMMM Do YYYY h:mm:ss a")
                  .toString(),
                proposedValue: proposal.insuranceCoverage,
              })
            ),
        };
        setFormattedSettingsAmendmentProposal(
          _formattedSettingsAmendmentProposal
        );
        setState({ status: "loaded", code: null });
      } else {
        setState({ status: "nocontent", code: null });
      }
    }
  }, [settingsAmendmentProposal]);

  const columns = [
    { field: "caller", headerName: "proposed by", width: 200 },
    { field: "proposalID", headerName: "proposal ID", width: 200 },
    { field: "proposedValue", headerName: "proposed value", width: 200 },
    { field: "timestamp", headerName: "date", width: 200 },
    { field: "currentVotes", headerName: "current votes", width: 200 },
    { field: "requiredVotes", headerName: "required votes", width: 200 },
  ];

  const handleClick = (event) => {
    const type = event.target.parentElement.id;
    if (type) {
      setModal({
        displayed: true,
        content: ProposalRegistration,
        props: { type },
      });
    }
  };

  return state.status === "loaded" ? (
    <Container>
      <Grid container spacing={4}>
        <Grid item xs={12} lg={6}>
          <Typography variant="h4" component="h8" className={classes.header}>
            Settings amendment proposals
          </Typography>
        </Grid>
        <Grid item xs={12} lg={3}>
          <Button
            id="membershipFeeAmendmentProposal"
            variant="contained"
            color="primary"
            size="large"
            onClick={handleClick}
            fullWidth
          >
            PROPOSE A NEW FEE
          </Button>
        </Grid>

        <Grid item xs={12} lg={3}>
          <Button
            id="insuranceCoverageRatioAmendmentProposal"
            variant="contained"
            color="primary"
            size="large"
            onClick={handleClick}
            fullWidth
          >
            PROPOSE A NEW RATIO
          </Button>
        </Grid>
      </Grid>

      {formattedSettingsAmendmentProposal?.membershipFeeAmendmentProposals
        .length > 0 ? (
        <Grid container>
          <MyDataGrid
            handleClick={handleClickMembershipFeeAmendmentProposalsDataGrid}
            header="Membership fee amendment proposals"
            rows={
              formattedSettingsAmendmentProposal.membershipFeeAmendmentProposals
            }
            columns={columns}
          />
        </Grid>
      ) : (
        <NoContent fontSize="6rem" message="Nothing just yet ..." />
      )}

      {formattedSettingsAmendmentProposal?.insuranceCoverageAmendmentProposals
        .length > 0 ? (
        <Grid container>
          <MyDataGrid
            handleClick={
              handleClickInsuranceCoverageRatioAmendmentProposalsDataGrid
            }
            header="Insurance coverage amendement proposals"
            rows={
              formattedSettingsAmendmentProposal.insuranceCoverageAmendmentProposals
            }
            columns={columns}
          />
        </Grid>
      ) : (
        <NoContent fontSize="6rem" message="Nothing just yet ..." />
      )}
    </Container>
  ) : state.status === "error" ? (
    <ErrorPage code={state.code} height="100%" />
  ) : (
    state.status === "loading" && <LoadingAnimation />
  );
};

export default PageContent;
