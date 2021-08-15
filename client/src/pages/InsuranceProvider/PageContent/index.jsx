import React, { useContext, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  Button,
  Hidden,
  Paper,
} from "@material-ui/core";
import Context from "../../../context/index";
import MultiIndicatorPanel from "../../../components/MultiIndicatorPanel/index";
import IndicatorPanel from "../../../components/IndicatorPanel/index";
import FlightRegistration from "../../../components/FlightRegistration";
import { ErrorPage } from "../../../components/Error";
import LoadingAnimation from "../../../components/LoadingAnimation/index";
import NoContent from "../../../components/icons/NoContent";
import PieChart from "../../../components/PieChart/index";

const PageContent = ({ state, setState }) => {
  const {
    // modal
    setModal,
    // data
    registration,
    fundsIndicators,
    insuranceProvidersProfits,
    insuranceProvidersFlights,
  } = useContext(Context);

  useEffect(() => {
    registration &&
      fundsIndicators &&
      insuranceProvidersProfits &&
      insuranceProvidersFlights &&
      setState({ status: "loaded", code: null });
  }, [
    registration,
    fundsIndicators,
    insuranceProvidersProfits,
    insuranceProvidersFlights,
  ]);

  const handleClick = () => {
    setModal({ displayed: true, content: FlightRegistration });
  };

  return state.status === "loaded" ? (
    <Container>
      <Grid container spacing={4}>
        <Grid item xs={12} lg={6}>
          <Typography variant="h4" component="h1">
            Insurance provider dashboard
          </Typography>
        </Grid>
        <Hidden mdDown>
          <Grid item lg={3}></Grid>
        </Hidden>
        <Grid item xs={12} lg={3}>
          {registration?.isActivatedInsuranceProvider && (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleClick}
              fullWidth
            >
              REGISTER A NEW FLIGHT
            </Button>
          )}
        </Grid>
      </Grid>
      <Grid container spacing={4}>
        {fundsIndicators &&
        insuranceProvidersProfits &&
        insuranceProvidersFlights ? (
          <>
            <IndicatorPanel
              label="token supply"
              value={fundsIndicators.tokenSupply}
            />
            <IndicatorPanel
              label="days before token redeem"
              value={fundsIndicators.daysBeforeTokenRedeem}
            />
            <MultiIndicatorPanel
              label="registered flights"
              values={[
                {
                  value: fundsIndicators.totalRegisteredFlightsCount,
                  label: "total",
                },
                {
                  value: fundsIndicators.myRegisteredFlightsCount,
                  label: "me",
                },
              ]}
            />
            <MultiIndicatorPanel
              label="registered insurance"
              values={[
                {
                  value: fundsIndicators.totalRegisteredInsuranceCount,
                  label: "total",
                },
                {
                  value: fundsIndicators.myRegisteredInsuranceCount,
                  label: "me",
                },
              ]}
            />
            <MultiIndicatorPanel
              label="cumulated profits"
              values={[
                {
                  value: fundsIndicators.totalCumulatedProfits,
                  label: "total",
                },
                {
                  value: fundsIndicators.myCumulatedProfits,
                  label: "me",
                },
              ]}
            />
            <MultiIndicatorPanel
              label="payout ratio"
              values={[
                {
                  value: fundsIndicators.totalInsuranceDefaultRate,
                  label: "total",
                },
                {
                  value: fundsIndicators.myInsuranceDefaultRate,
                  label: "me",
                },
              ]}
            />

            <PieChart
              data={insuranceProvidersProfits}
              label="Profits / Insurance provider"
            />
            <PieChart
              data={insuranceProvidersFlights}
              label="Flights count / Insurance provider"
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
