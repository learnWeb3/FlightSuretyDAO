import React, { useContext } from "react";
import { Grid, Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import moment from "moment";
import FlightIcon from "./FlightIcon/index";
import FlightStatus from "./FlightStatus/index";
import FlightData from "./FlightData";
import Context from "../../context";

const useStyles = makeStyles(() => ({
  root: {
    width: "100%",
  },
  card: {
    padding: 24,
  },
}));

const FlightCard = ({
  flightID,
  cardID,
  btnSubscribeInsuranceDisabled = false,
  btnClaimInsuranceDisabled = true,
  btnCreateRequestDisabled = true,
  flightRef,
  estimatedDeparture,
  estimatedArrival,
  insuranceProvider,
  rate,
  insuredValue,
  isLate = null,
  realArrival = null,
  realDeparture = null,
  settled = null,
  oracleRequestIsPresent = null,
  oracleActivatedIndex = null,
  settlementResponses = null,
  settlementResponseCount = null,
  settlementConsensusTreshold = null,
  settlementRequests=null,
  insuranceID=null
}) => {
  const { appContract } = useContext(Context);
  const classes = useStyles();
  const ethRate = appContract.utils.fromWei(rate, "ether");
  const formattedEstimatedDepartureDate = moment(estimatedDeparture * 1000)
    .format("MMMM Do YYYY")
    .toString();
  const formattedEstimatedDeparture = moment(estimatedDeparture * 1000)
    .format("h:mm")
    .toString();
  const formattedEstimatedArrival = moment(estimatedArrival * 1000)
    .format("h:mm")
    .toString();
  const formattedFlightDuration = moment
    .duration(estimatedArrival * 1000 - estimatedDeparture * 1000)
    .asHours();

  return (
    <Grid item xs={12}>
      <Paper className={classes.card}>
        <Grid container>
          <FlightIcon />

          <Grid item xs={12} lg={9}>
            <Grid container>
              <FlightStatus
                flightData={{
                  // flight data
                  estimatedDeparture,
                  estimatedArrival,
                  insuredValue,
                  settled,
                  isLate,
                  // user actions
                  oracleActivatedIndex,
                  btnCreateRequestDisabled,
                  oracleRequestIsPresent,
                }}
              />

              <FlightData
                insuranceID={insuranceID}
                flightData={{
                  // id
                  cardID,
                  // formatted data
                  formattedEstimatedDepartureDate,
                  formattedEstimatedDeparture,
                  formattedEstimatedArrival,
                  formattedFlightDuration,
                  ethRate,
                  settled,
                  oracleActivatedIndex,
                  // raw flight data
                  flightID,
                  // user actions
                  btnSubscribeInsuranceDisabled,
                  btnClaimInsuranceDisabled,
                  btnCreateRequestDisabled,
                  oracleRequestIsPresent,
                  settlementResponses,
                  settlementResponseCount,
                  settlementConsensusTreshold,
                  settlementRequests,
                  // flightData
                  flightRef,
                  insuranceProvider,
                  rate,
                  estimatedDeparture,
                  estimatedArrival,
                  realArrival,
                  realDeparture,
                  isLate,
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
};

export default FlightCard;
