import React, { useContext } from "react";
import Context from "../../../context";
import { Button, Chip, Grid, useMediaQuery } from "@material-ui/core";
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
  const { oracleIndexes, setSelectedFlight, setSelectedInsurance, setModal, userTx } =
    useContext(Context);
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
      <Grid container>
        <Grid item xs={12} lg={8} className={classes.flightInfo}>
          {formattedEstimatedDeparture && formattedEstimatedArrival && (
            <>
              <TypoIcon
                text={formattedEstimatedDepartureDate}
                icon={CalendarTodayRoundedIcon}
              />
              <TypoIcon
                text={
                  formattedEstimatedDeparture + "-" + formattedEstimatedArrival
                }
                icon={ScheduleRoundedIcon}
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

        <Grid item xs={12} lg={4} className={classes.flightInfo}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Flight duration : ≈ {formattedFlightDuration} hours
          </Typography>
          {rate && (
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Flight rate : {ethRate} Eth
            </Typography>
          )}
          {!btnSubscribeInsuranceDisabled &&
            estimatedDeparture * 1000 > Date.now() && (
              <Button
                id={"subscribeInsurance" + cardID}
                variant="outlinedPrimary"
                color="secondary"
                variant="contained"
                fullWidth={matches}
                onClick={handleClick}
              >
                SUBSCRIBE INSURANCE
              </Button>
            )}


          {!btnClaimInsuranceDisabled && settled && (
            <Button
              id={"claimInsurance" + cardID}
              variant="outlinedPrimary"
              color="secondary"
              variant="contained"
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
                variant="outlinedPrimary"
                color="secondary"
                variant="contained"
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
