import React, { useEffect, useContext } from "react";
import { Container, Grid, Typography } from "@material-ui/core";
import Context from "../../../context/index";
import { makeStyles } from "@material-ui/core/styles";
import FlightCard from "../../../components/FlightCard";
import FiltersArea from "../../../components/FiltersArea";
import NoContent from "../../../components/icons/NoContent";
import LoadingAnimation from "../../../components/LoadingAnimation/index";
import { ErrorPage } from "../../../components/Error";
import MuiAlert from '@material-ui/lab/Alert';

const useStyles = makeStyles(() => ({
  flightContainer : {display: "flex", justifyContent: "center"},
  alert: {
    marginBottom: 24,
    marginTop: 24,
  }
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

  return state.status === "loaded" ? (
    <Container>
      <Typography variant="h4" component="h1">
        Insure my flight
      </Typography>

      <MuiAlert className={classes.alert} elevation={6} variant="filled" severity="info">
        In this section you will find all the available flights registered on our smart contracts and secured by the ethereum network
      </MuiAlert>

      <FiltersArea />
      <Grid container className={classes.flightContainer}>
        {flights ? (
          flights
            ?.filter(
              (flight) =>
                flight.estimatedDeparture * 1000 >= Date.now() ===
                isFilterFlightToActive
            )
            .map(
              ({
                flightID,
                flightRef,
                estimatedDeparture,
                estimatedArrival,
                insuranceProvider,
                rate,
              }) => (
                <FlightCard
                  key={flightID}
                  flightID={flightID}
                  flightRef={flightRef}
                  estimatedDeparture={estimatedDeparture}
                  estimatedArrival={estimatedArrival}
                  insuranceProvider={insuranceProvider}
                  rate={rate}
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
    </Container>
  ) : state.status === "error" ? (
    <ErrorPage code={state.code} height="100%" />
  ) : state.status === "loading" ? (
    <LoadingAnimation />
  ) : (
    state.status === "nocontent" && (
      <NoContent fontSize="6rem" message="Nothing just yet ..." />
    )
  );
};

export default PageContent;
