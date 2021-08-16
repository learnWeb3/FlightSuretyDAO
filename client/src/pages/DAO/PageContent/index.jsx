import React, { useContext, useEffect } from "react";
import { Container, Grid, Typography } from "@material-ui/core";
import Context from "../../../context/index";
import { makeStyles } from "@material-ui/core/styles";
import MultiIndicatorPanel from "../../../components/MultiIndicatorPanel/index";
import IndicatorPanel from "../../../components/IndicatorPanel/index";
import NoContent from "../../../components/icons/NoContent";
import LoadingAnimation from "../../../components/LoadingAnimation/index";
import { ErrorPage } from "../../../components/Error";

const useStyles = makeStyles(() => ({
  header: {
    marginBottom: 32,
  },
}));

const PageContent = ({ state, setState }) => {
  const classes = useStyles();
  const {
    // data
    daoIndicators,
  } = useContext(Context);

  useEffect(() => {
    daoIndicators && setState({ status: "loaded", code: null });
  }, [daoIndicators]);

  return state.status === "loaded" ? (
    <Container>
      <Typography variant="h5" component="h1" className={classes.header}>
        FlightSurety DAO dashboard
      </Typography>
      <Grid container spacing={4}>
        {daoIndicators ? (
          <>
            <IndicatorPanel
              label="token supply"
              value={daoIndicators.tokenSupply}
            />
            <IndicatorPanel
              label="days before token redeem"
              value={daoIndicators.daysBeforeTokenRedeem}
            />
            <IndicatorPanel
              label="current membership fee"
              value={daoIndicators.currentMembershipFee}
            />
            <IndicatorPanel
              label="insurance coverage ratio"
              value={daoIndicators.currentInsuranceCoverageRatio}
            />
               <IndicatorPanel
              label="Proposal validity duration (block number)"
              value={daoIndicators.proposalValidityDuration}
            />
            <IndicatorPanel
              label="Minimum same answers before flight data update"
              value={daoIndicators.acceptedAnswerTreshold}
            />
            <IndicatorPanel
              label="Minimum holding duration before vote (block number)"
              value={daoIndicators.tokenHoldingMinimumBlock}
            />
            <IndicatorPanel
              label="Authorized flight delay (seconds)"
              value={daoIndicators.authorizedFlightDelay}
            />

            <MultiIndicatorPanel
              label="oracle providers"
              values={[
                {
                  value: daoIndicators.oracleRegisteredProvidersCount,
                  label: "registered",
                },
                {
                  value: daoIndicators.oracleActivatedProvidersCount,
                  label: "activated",
                },
              ]}
            />
            <MultiIndicatorPanel
              label="insurance providers"
              values={[
                {
                  value: daoIndicators.insuranceRegisteredProvidersCount,
                  label: "registered",
                },
                {
                  value: daoIndicators.insuranceActivatedProvidersCount,
                  label: "activated",
                },
              ]}
            />
            <MultiIndicatorPanel
              label="settings amendment proposals"
              values={[
                {
                  value: daoIndicators.feeSettingsAmendmentProposalCount,
                  label: "fee",
                },
                {
                  value: daoIndicators.coverageSettingsAmendmentProposalCount,
                  label: "me",
                },
              ]}
            />
          </>
        ) : (
          <LoadingAnimation />
        )}
      </Grid>
    </Container>
  ) : state.status === "error" ? (
    <ErrorPage code={state.code} height="100%"  message={state.message}/>
  ) : state.status === "loading" ? (
    <LoadingAnimation />
  ) : (
    state.status === "nocontent" && (
      <NoContent fontSize="6rem" message="Nothing just yet ..." />
    )
  );
};

export default PageContent;
