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
  pageContainer: {
    height: "90%",
  },
  flightContainer: { display: "flex", justifyContent: "center" },
  oracleProviderIndexContainer: {
    display: "flex",
    alignItems: "center",
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
                  .getActivatedOracleProvidersCount()
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

  return (
    <Container className={classes.pageContainer}>
      <Grid container spacing={4}>
        <Grid item xs={12} lg={6}>
          <Typography variant="h5" component="h1">
            Oracle provider dashboard
          </Typography>
        </Grid>

        <Grid
          item
          xs={12}
          lg={6}
          className={classes.oracleProviderIndexContainer}
        >
          {oracleIndexes && (
            <Chip
              variant="default"
              color="primary"
              label={`My indexes : ${oracleIndexes?.index1}-${oracleIndexes?.index2}-${oracleIndexes?.index3}`}
            />
          )}
        </Grid>

        {state.status === "loaded" && (
          <>
            <Grid item xs={12}>
              <MuiAlert elevation={6} variant="filled" severity="info">
                In this section you will find all the available flights
                registered on our smart contracts and secured by the ethereum
                network, you will be able to create a secure request updating
                the flight real data wired through our Oracle contract
              </MuiAlert>
            </Grid>
            <Grid item xs={12}>
              <FiltersArea />
            </Grid>

            <Grid item xs={12}>
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
                          realArrival,
                          realDeparture,
                          settled,
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
                          realArrival={realArrival}
                          realDeparture={realDeparture}
                          settled={realArrival > 0 && realDeparture > 0}
                          btnSubscribeInsuranceDisabled={true}
                          btnCreateRequestDisabled={false}
                          oracleRequestIsPresent={oracleRequestIsPresent}
                          oracleActivatedIndex={oracleActivatedIndex}
                          settlementResponses={settlementResponses}
                          settlementResponseCount={settlementResponseCount}
                          settlementConsensusTreshold={
                            settlementConsensusTreshold
                          }
                          settlementRequests={settlementRequests}
                        />
                      )
                    )
                ) : (
                  <LoadingAnimation />
                )}
              </Grid>
            </Grid>
          </>
        )}

        {state.status === "error" && (
          <Grid item xs={12}>
            <ErrorPage
              code={state.code}
              height="95vh"
              message={state.message}
            />
          </Grid>
        )}

        {state.status === "loading" && (
          <Grid item xs={12}>
            <LoadingAnimation />
          </Grid>
        )}

        {state.status === "nocontent" && (
          <Grid item xs={12}>
            <NoContent fontSize="6rem" message="Nothing just yet ..." />
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default PageContent;
