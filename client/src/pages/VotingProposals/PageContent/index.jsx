import React, { useContext, useEffect, useState } from "react";
import { Button, Container, Grid, Typography, Fab } from "@material-ui/core";
import Context from "../../../context/index";
import MyDataGrid from "../../../components/MyDataGrid";
import LoadingAnimation from "../../../components/LoadingAnimation";
import { ErrorPage } from "../../../components/Error";
import ProposalVote from "../../../components/ProposalVote/index.jsx/index";
import ProposalRegistration from "../../../components/ProposalRegistration/index";
import moment from "moment";

const PageContent = ({ state, setState }) => {
  const {
    // data
    registration,
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
    if (registration && settingsAmendmentProposal) {
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
  }, [registration, settingsAmendmentProposal]);

  const columns = [
    {
      field: "caller",
      headerName: "proposed by",
      width: 200,
      headerClassName: "fontBold",

      cellClassName: (params) => "noFocus",
    },
    {
      field: "proposalID",
      headerName: "proposal ID",
      width: 200,
      headerClassName: "fontBold",
    },
    {
      field: "proposedValue",
      headerName: "proposed value",
      width: 200,
      headerClassName: "fontBold",

      cellClassName: (params) => "noFocus",
    },
    {
      field: "timestamp",
      headerName: "date",
      width: 200,
      headerClassName: "fontBold",

      cellClassName: (params) => "noFocus",
    },
    {
      field: "currentVotes",
      headerName: "current votes",
      width: 200,
      headerClassName: "fontBold",

      cellClassName: (params) => "noFocus",
    },
    {
      field: "requiredVotes",
      headerName: "required votes",
      width: 200,
      headerClassName: "fontBold",

      cellClassName: (params) => "noFocus",
    },
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
          <Typography variant="h5" component="h1">
            Settings amendment proposals
          </Typography>
        </Grid>

        {registration.isTokenHolder && (
          <Grid item xs={12} lg={3}>
            <Fab
              id="membershipFeeAmendmentProposal"
              variant="extended"
              color="primary"
              onClick={handleClick}
            >
              PROPOSE A NEW FEE
            </Fab>
          </Grid>
        )}

        {registration.isTokenHolder && (
          <Grid item xs={12} lg={3}>
            <Fab
              id="insuranceCoverageRatioAmendmentProposal"
              variant="extended"
              color="primary"
              onClick={handleClick}
            >
              PROPOSE A NEW RATIO
            </Fab>
          </Grid>
        )}

        {formattedSettingsAmendmentProposal?.membershipFeeAmendmentProposals
          .length > 0 && (
          <Grid item xs={12}>
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
          </Grid>
        )}

        {formattedSettingsAmendmentProposal?.insuranceCoverageAmendmentProposals
          .length > 0 && (
          <Grid item xs={12}>
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
          </Grid>
        )}
      </Grid>
    </Container>
  ) : state.status === "error" ? (
    <Container>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <ErrorPage code={state.code} height="95vh" message={state.message} />
        </Grid>
      </Grid>
    </Container>
  ) : (
    state.status === "loading" && (
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <LoadingAnimation />
          </Grid>
        </Grid>
      </Container>
    )
  );
};

export default PageContent;
