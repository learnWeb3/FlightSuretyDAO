import React, { useEffect, useContext, useState } from "react";
import { Chip, Container, Grid, Typography } from "@material-ui/core";
import Context from "../../../context/index";
import { makeStyles } from "@material-ui/core/styles";
import FlightCard from "../../../components/FlightCard";
import FiltersArea from "../../../components/FiltersArea";
import NoContent from "../../../components/icons/NoContent";
import LoadingAnimation from "../../../components/LoadingAnimation/index";
import { ErrorPage } from "../../../components/Error";
import MuiAlert from "@material-ui/lab/Alert";

const useStyles = makeStyles(() => ({
  flightContainer: { display: "flex", justifyContent: "center" },
  oracleProviderIndexContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  alert: {
    marginBottom: 24,
    marginTop: 24,
  },
}));

const PageContent = ({ state, setState }) => {
  const classes = useStyles();
  const {
    // data
    flights,
    oracleflightsRequestsforSettlementData,
    // filters
    isFilterFlightToActive,
  } = useContext(Context);

  const [formattedFlights, setFormattedFlights] = useState(null)

  useEffect(() => {
    if (flights && oracleflightsRequestsforSettlementData) {
      if (flights.length === 0) {
        setState({ status: "nocontent", code: null });
      } else {
        const _formattedFlights = flights.map((flight) => {
          const request = oracleflightsRequestsforSettlementData.find(
            (request) => request.flightID === flight.flightID
          );
          return {
            ...flight,
            oracleActivatedIndex: request ? request.activatedIndex : null,
            oracleRequestIsPresent: request ? true : false,
          };
        });
        setFormattedFlights(_formattedFlights);
        setState({ status: "loaded", code: null });
      }
    }
  }, [flights, oracleflightsRequestsforSettlementData]);

  return state.status === "loaded" ? (
    <Container>
      <Grid container>
        <Grid item xs={12} lg={6}>
          <Typography variant="h4" component="h1">
            Oracle provider metrics
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          lg={6}
          className={classes.oracleProviderIndexContainer}
        >
          <Chip
            variant="contained"
            color="secondary"
            label="Oracle index "
          />
        </Grid>
      </Grid>

      <MuiAlert
        className={classes.alert}
        elevation={6}
        variant="filled"
        severity="info"
      >
        In this section you will find all the available flights registered on
        our smart contracts and secured by the ethereum network, you will be
        able to create a secure request updating the flight real data wired
        through our Oracle contract
      </MuiAlert>

      <FiltersArea />
      <Grid container className={classes.flightContainer}>
        {formattedFlights ? (
          formattedFlights
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
                  oracleRequestIsPresent,
                  oracleActivatedIndex,
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
                  btnSubscribeInsuranceDisabled={true}
                  btnCreateRequestDisabled={false}
                  oracleRequestIsPresent={oracleRequestIsPresent}
                  oracleActivatedIndex={oracleActivatedIndex}
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
