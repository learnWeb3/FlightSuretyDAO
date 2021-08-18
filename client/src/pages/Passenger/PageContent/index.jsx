import React, { useEffect, useContext } from "react";
import { Container, Grid, Typography } from "@material-ui/core";
import Context from "../../../context/index";
import { makeStyles } from "@material-ui/core/styles";
import FlightCard from "../../../components/FlightCard";
import FiltersArea from "../../../components/FiltersArea";
import NoContent from "../../../components/icons/NoContent";
import LoadingAnimation from "../../../components/LoadingAnimation/index";
import { ErrorPage } from "../../../components/Error";
import MuiAlert from "@material-ui/lab/Alert";

const useStyles = makeStyles(() => ({
  pageContainer: {
    height: "90%",
  },
  flightContainer: { display: "flex", justifyContent: "center" },
}));

const PageContent = ({ state, setState }) => {
  const classes = useStyles();
  const {
    // data
    flights,
    // filters
    isFilterFlightToActive,
  } = useContext(Context);

  useEffect(() => {
    flights?.length === 0
      ? setState({ status: "nocontent", code: null })
      : setState({ status: "loaded", code: null });
  }, [flights]);

  return (
    <Container className={classes.pageContainer}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Typography variant="h5" component="h1">
            Insure my flight
          </Typography>
        </Grid>
        {state.status === "loaded" ? (
          <>
            <Grid item xs={12}>
              <MuiAlert elevation={6} variant="filled" severity="info">
                In this section you will find all the available flights
                registered on our smart contracts and secured by the ethereum
                network
              </MuiAlert>
            </Grid>
            <Grid item xs={12}>
              <FiltersArea />
            </Grid>
            <Grid item xs={12}>
              <Grid container className={classes.flightContainer}>
                {flights ? (
                  flights
                    ?.filter(
                      (flight) =>
                        flight.estimatedDeparture * 1000 >= Date.now() ===
                        isFilterFlightToActive
                    )
                    .map(
                      (
                        {
                          flightID,
                          flightRef,
                          estimatedDeparture,
                          estimatedArrival,
                          insuranceProvider,
                          rate,
                          insuredValue,
                        },
                        index
                      ) => (
                        <FlightCard
                          key={flightID + index}
                          cardID={flightID + index}
                          flightID={flightID}
                          flightRef={flightRef}
                          estimatedDeparture={estimatedDeparture}
                          estimatedArrival={estimatedArrival}
                          insuranceProvider={insuranceProvider}
                          rate={rate}
                          insuredValue={insuredValue}
                          btnClaimInsuranceDisabled={true}
                        />
                      )
                    )
                ) : (
                  <LoadingAnimation />
                )}

                {flights?.filter(
                  (flight) =>
                    flight.estimatedDeparture * 1000 >= Date.now() ===
                    isFilterFlightToActive
                ).length === 0 && (
                  <NoContent width="100%" message="Nothing just yet ..." />
                )}
              </Grid>
            </Grid>
          </>
        ) : state.status === "error" ? (
          <Grid item xs={12}>
            <ErrorPage
              code={state.code}
              height="95vh"
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
