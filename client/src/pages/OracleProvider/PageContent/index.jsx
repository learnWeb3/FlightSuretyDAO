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
import {
  fetchFlightSettlementResponses,
  fetchFlightSettlementRequests,
} from "../../../actions";

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
    // contract
    oracleContract,
    // current address
    selectedAddress,
    // data
    registration,
    flights,
    oracleflightsRequestsforSettlementData,
    oracleIndexes,
    // filters
    isFilterFlightToActive,
  } = useContext(Context);

  const [formattedFlights, setFormattedFlights] = useState(null);

  useEffect(() => {
    console.log(oracleIndexes);
    if (
      (oracleContract && flights && oracleflightsRequestsforSettlementData,
      flights && registration)
    ) {
      if (!registration?.isActivatedOracleProvider) {
        setState({
          status: "error",
          code: 403,
          message:
            "You must be an activated oracle provider to acces this page",
        });
      } else {
        if (flights.length === 0) {
          setState({ status: "nocontent", code: null });
        } else {
          const formatAndSetFlights = async () => {
            const _formattedFlights = await Promise.all(
              flights.map(async (flight) => {
                const request = oracleflightsRequestsforSettlementData.find(
                  (request) => request.flightID === flight.flightID
                );
                const oracleActivatedIndex = request
                  ? request.activatedIndex
                  : null;
                const oracleRequestIsPresent = request ? true : false;
                const settlementRequests = await fetchFlightSettlementRequests(
                  oracleContract,
                  flight.flightID
                ).then((requests) =>
                  requests.sort((a, b) => a.blockNumber - b.blockNumber)
                );
                const settlementResponses =
                  await fetchFlightSettlementResponses(
                    oracleContract,
                    flight.flightID
                  ).then((responses) =>
                    responses.sort((a, b) => a.blockNumber - b.blockNumber)
                  );
                const settlementConsensusTreshold = await oracleContract.methods
                  .ACCEPTED_ANSWER_TRESHOLD()
                  .call({ from: selectedAddress });
                const settlementResponseCount = settlementResponses.length;
                return {
                  ...flight,
                  oracleActivatedIndex,
                  oracleRequestIsPresent,
                  settlementResponses,
                  settlementRequests,
                  settlementResponseCount,
                  settlementConsensusTreshold,
                };
              })
            );
            setFormattedFlights(_formattedFlights);
            setState({ status: "loaded", code: null });
          };
          formatAndSetFlights();
        }
      }
    }
  }, [
    oracleContract,
    flights,
    oracleflightsRequestsforSettlementData,
    oracleIndexes,
    registration,
  ]);

  return state.status === "loaded" ? (
    <Container>
      <Grid container>
        <Grid item xs={12} lg={6}>
          <Typography variant="h4" component="h1">
            Oracle provider dashboard
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
            color="primary"
            label={`Oracle indexes : ${oracleIndexes?.index1}-${oracleIndexes?.index2}-${oracleIndexes?.index3}`}
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
                  oracleActivatedIndex,
                  oracleRequestIsPresent,
                  settlementResponses,
                  settlementResponseCount,
                  settlementConsensusTreshold,
                  settlementRequests,
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
                  settlementResponses={settlementResponses}
                  settlementResponseCount={settlementResponseCount}
                  settlementConsensusTreshold={settlementConsensusTreshold}
                  settlementRequests={settlementRequests}
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
    <ErrorPage code={state.code} height="100%" message={state.message} />
  ) : state.status === "loading" ? (
    <LoadingAnimation />
  ) : (
    state.status === "nocontent" && (
      <NoContent fontSize="6rem" message="Nothing just yet ..." />
    )
  );
};

export default PageContent;
