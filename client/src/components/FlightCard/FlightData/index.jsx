import React, { useContext } from "react";
import Context from "../../../context";
import { Button, Grid, useMediaQuery } from "@material-ui/core";
import { Typography } from "@material-ui/core";
import TypoIcon from "./TypoIcon";
import FlightRoundedIcon from "@material-ui/icons/FlightRounded";
import ScheduleRoundedIcon from "@material-ui/icons/ScheduleRounded";
import CalendarTodayRoundedIcon from "@material-ui/icons/CalendarTodayRounded";
import BusinessRoundedIcon from "@material-ui/icons/BusinessRounded";
import { makeStyles } from "@material-ui/core/styles";
import SettleFlight from "../../SettleFlight/index";
import InsuranceSubscription from "../../InsuranceSubscription/index";
import InsuranceClaim from "../../InsuranceClaim/index";

const useStyles = makeStyles(() => ({
  flightInfo: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "start",
  },
  chip: {
    marginRight: 16,
    marginBottom: 24,
  },
}));

const FlightData = ({
  insuranceID,
  flightData: {
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
  },
}) => {
  const {
    oracleIndexes,
    setSelectedFlight,
    setSelectedInsurance,
    setModal,
    userTx,
  } = useContext(Context);
  const matches = useMediaQuery("(max-width:600px)");
  const classes = useStyles();

  const handleClick = (event) => {
    if (event.target.parentElement) {
      const mappingIdToUserAction = {
        ["subscribeInsurance" + cardID]: () =>
          setSelectedFlight({
            flightID,
            flightRef,
            estimatedDeparture,
            estimatedArrival,
            insuranceProvider,
            rate,
          }),
        ["claimInsurance" + cardID]: () =>
          setSelectedInsurance({
            insuranceID,
            flightID,
            flightRef,
            estimatedDeparture,
            estimatedArrival,
            insuranceProvider,
            rate,
            isLate,
            realArrival,
            realDeparture,
            settled,
          }),
        ["requestFlightSettlement" + cardID]: () =>
          setSelectedFlight({
            flightID,
            flightRef,
            estimatedDeparture,
            estimatedArrival,
            insuranceProvider,
            rate,
            realArrival,
            realDeparture,
            settled,
            settlementResponses,
            settlementResponseCount,
            settlementConsensusTreshold,
            settlementRequests,
          }),
      };
      const mappingIdToModalContent = {
        ["subscribeInsurance" + cardID]: () =>
          setModal({
            displayed: true,
            content: InsuranceSubscription,
          }),
        ["claimInsurance" + cardID]: () =>
          setModal({
            displayed: true,
            content: InsuranceClaim,
          }),
        ["requestFlightSettlement" + cardID]: () =>
          setModal({
            displayed: true,
            content: SettleFlight,
          }),
      };
      const id = event.target.parentElement.id;
      if (id) {
        mappingIdToUserAction[id]();
        mappingIdToModalContent[id]();
      }
    }
  };

  return (
    <Grid item xs={12}>
      <Grid container spacing={4}>
        <Grid item xs={12} lg={6} className={classes.flightInfo}>
          {formattedEstimatedDeparture && formattedEstimatedArrival && (
            <>
              <TypoIcon
                text={formattedEstimatedDepartureDate}
                icon={CalendarTodayRoundedIcon}
              />

              {flightRef && (
                <TypoIcon text={flightRef} icon={FlightRoundedIcon} />
              )}
              {insuranceProvider && (
                <TypoIcon
                  text={
                    insuranceProvider.slice(0, 3) +
                    "..." +
                    insuranceProvider.slice(-3, -1)
                  }
                  icon={BusinessRoundedIcon}
                />
              )}
            </>
          )}
        </Grid>

        <Grid item xs={12} lg={6} className={classes.flightInfo}>
          <TypoIcon
            text={formattedEstimatedDeparture + "-" + formattedEstimatedArrival}
            icon={ScheduleRoundedIcon}
          />
          <Typography variant="body2" gutterBottom>
            Flight duration : ≈ {formattedFlightDuration.toString().slice(0, 4)}{" "}
            hours
          </Typography>
          {rate && (
            <Typography variant="body2" gutterBottom>
              Flight rate : {ethRate} Eth
            </Typography>
          )}
        </Grid>

        <Grid item xs={12} lg={6}>
          {!btnSubscribeInsuranceDisabled &&
            estimatedDeparture * 1000 > Date.now() && (
              <Button
                id={"subscribeInsurance" + cardID}
                color="primary"
                variant="outlined"
                fullWidth={matches}
                onClick={handleClick}
              >
                SUBSCRIBE INSURANCE
              </Button>
            )}

          {!btnClaimInsuranceDisabled && !settled && isLate && (
            <Button
              id={"claimInsurance" + cardID}
              color="primary"
              variant="outlined"
              fullWidth={matches}
              onClick={handleClick}
            >
              CLAIM INSURANCE
            </Button>
          )}

          {!btnCreateRequestDisabled &&
            oracleRequestIsPresent &&
            oracleActivatedIndex &&
            Object.values(oracleIndexes).includes(oracleActivatedIndex) && (
              <Button
                id={"requestFlightSettlement" + cardID}
                color="primary"
                variant="outlined"
                fullWidth={matches}
                onClick={handleClick}
              >
                PROVIDE SETTLEMENT DATA
              </Button>
            )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default FlightData;
