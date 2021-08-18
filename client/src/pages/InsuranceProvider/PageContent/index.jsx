import React, { useContext, useEffect } from "react";
import { Container, Grid, Typography, Fab } from "@material-ui/core";
import Context from "../../../context/index";
import MultiIndicatorPanel from "../../../components/MultiIndicatorPanel/index";
import IndicatorPanel from "../../../components/IndicatorPanel/index";
import FlightRegistration from "../../../components/FlightRegistration";
import { ErrorPage } from "../../../components/Error";
import LoadingAnimation from "../../../components/LoadingAnimation/index";
import NoContent from "../../../components/icons/NoContent";
import PieChart from "../../../components/PieChart/index";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles(() => ({
  pageContainer: {
    height: "90%",
  },
}));

const PageContent = ({ state, setState }) => {
  const classes = useStyles();
  const {
    // modal
    setModal,
    // data
    registration,
    daoIndicators,
    fundsIndicators,
    insuranceProvidersProfits,
    insuranceProvidersFlights,
  } = useContext(Context);

  const history = useHistory();

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

  return (
    <Container className={classes.pageContainer}>
      <Grid container spacing={4}>
        <Grid item xs={12} lg={6}>
          <Typography variant="h5" component="h1">
            Insurance provider dashboard
          </Typography>
        </Grid>

        {registration?.isActivatedInsuranceProvider && (
          <Grid item xs={12} lg={3}>
            <Fab
              variant="extended"
              color="primary"
              onClick={() => history.push("/register")}
            >
              REGISTER A NEW PROVIDER
            </Fab>
          </Grid>
        )}

        {registration?.isActivatedInsuranceProvider && (
          <Grid item xs={12} lg={3}>
            <Fab variant="extended" color="primary" onClick={handleClick}>
              REGISTER A NEW FLIGHT
            </Fab>
          </Grid>
        )}

        {state.status === "loaded" ? (
          <Grid item xs={12}>
            <Grid container spacing={4}>
              {fundsIndicators &&
              daoIndicators &&
              insuranceProvidersProfits &&
              insuranceProvidersFlights ? (
                <>
                  <IndicatorPanel
                    label="token supply"
                    value={fundsIndicators.tokenSupply}
                  />

                  <IndicatorPanel
                    label="Authorized flight delay (seconds)"
                    value={daoIndicators.authorizedFlightDelay}
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
                        value:
                          Math.round(
                            fundsIndicators.totalInsuranceDefaultRate * 100
                          ) / 100,
                        label: "total",
                      },
                      {
                        value:
                          Math.round(
                            fundsIndicators.myInsuranceDefaultRate * 100
                          ) / 100,
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
          </Grid>
        ) : state.status === "error" ? (
          <Grid item xs={12}>
            <ErrorPage
              code={state.code}
              height="100%"
              message={state.message}
            />
          </Grid>
        ) : state.status === "loading" ? (
          <Grid item xs={12}>
            <LoadingAnimation />
          </Grid>
        ) : (
          state.status === "nocontent" && (
            <Grid item xs={12}>
              <NoContent fontSize="6rem" message="Nothing just yet ..." />
            </Grid>
          )
        )}
      </Grid>
    </Container>
  );
};

export default PageContent;
