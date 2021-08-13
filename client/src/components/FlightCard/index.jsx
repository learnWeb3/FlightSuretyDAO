import React, { useContext } from "react";
import {
  Button,
  Typography,
  Grid,
  Paper,
  useMediaQuery,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import FlightRoundedIcon from "@material-ui/icons/FlightRounded";
import BusinessRoundedIcon from "@material-ui/icons/BusinessRounded";
import ScheduleRoundedIcon from "@material-ui/icons/ScheduleRounded";
import CalendarTodayRoundedIcon from "@material-ui/icons/CalendarTodayRounded";
import clsx from "clsx";
import moment from "moment";
import Context from "../../context/index";
import InsuranceSubscription from "../InsuranceSubscription/index";
import InsuranceClaim from "../InsuranceClaim/index";

const useStyles = makeStyles(() => ({
  root: {
    width: "100%",
  },
  card: {
    padding: 24,
  },
  flex: {
    display: "flex",
    alignItems: "center",
  },
  flexColumn: {
    alignItems: "start",
    flexDirection: "column",
  },
  labelIcon: {
    marginBottom: "0.35em",
    "& svg": {
      marginRight: ".35em",
    },
  },
  justifyContent: {
    justifyContent: "center",
  },
  padding: {
    padding: 24,
  },
  btnFullWidth: {
    width: "100%",
  },
}));

const FlightCard = ({
  btnSubscribeInsuranceDisabled = false,
  btnClaimInsuranceDisabled = true,
  flightID,
  flightRef,
  estimatedDeparture,
  estimatedArrival,
  insuranceProvider,
  rate,
  isLate = null,
  realArrival = null,
  realDeparture = null,
  settled = null,
}) => {
  const { appContract, setSelectedFlight, setSelectedInsurance, setModal } =
    useContext(Context);
  const classes = useStyles();
  const matches = useMediaQuery("(max-width:600px)");
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

  const handleClick = (event) => {
    if (event.target.parentElement) {
      const mappingIdToUserAction = {
       ["subscribeInsurance"+flightID]: () =>
          setSelectedFlight({
            flightID,
            flightRef,
            estimatedDeparture,
            estimatedArrival,
            insuranceProvider,
            rate,
          }),
        ["claimInsurance"+flightID]: () =>
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
      };
      const mappingIdToModalContent = {
        ["subscribeInsurance"+flightID]: () =>
          setModal({
            displayed: true,
            content: InsuranceSubscription,
          }),
          ["claimInsurance"+flightID]: () =>
          setModal({
            displayed: true,
            content: InsuranceClaim,
          }),
      };
      const id = event.target.parentElement.id;
      mappingIdToUserAction[id]();
      mappingIdToModalContent[id]();
    }
  };
  return (
    <Grid item xs={12}>
      <Paper className={classes.card}>
        <Grid container>
          <Grid
            item
            xs={12}
            lg={2}
            className={clsx(
              classes.flex,
              classes.justifyContent,
              classes.padding
            )}
          >
            <FlightRoundedIcon fontSize="large" />
          </Grid>
          <Grid item xs={12} lg={5}>
            {estimatedDeparture && estimatedArrival && (
              <>
                <div className={clsx(classes.flex, classes.labelIcon)}>
                  <CalendarTodayRoundedIcon fontSize="small" />
                  <Typography variant="body1">
                    {formattedEstimatedDepartureDate}
                  </Typography>
                </div>
                <div className={clsx(classes.flex, classes.labelIcon)}>
                  <ScheduleRoundedIcon fontSize="small" />
                  <Typography variant="body1">
                    {formattedEstimatedDeparture} - {formattedEstimatedArrival}
                  </Typography>
                </div>
                {flightRef && (
                  <div className={clsx(classes.flex, classes.labelIcon)}>
                    <FlightRoundedIcon fontSize="small" />
                    <Typography variant="body2">{flightRef}</Typography>
                  </div>
                )}
                {insuranceProvider && (
                  <div className={clsx(classes.flex, classes.labelIcon)}>
                    <BusinessRoundedIcon fontSize="small" />
                    <Typography variant="body2">{insuranceProvider}</Typography>
                  </div>
                )}
              </>
            )}
          </Grid>
          <Grid
            item
            xs={12}
            lg={5}
            className={clsx(classes.flex, classes.flexColumn)}
          >
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Flight duration : ≈ {formattedFlightDuration} hours
            </Typography>
            {rate && (
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Flight rate : {ethRate} Eth
              </Typography>
            )}
            {!btnSubscribeInsuranceDisabled && (
              <Button
                id={"subscribeInsurance"+flightID}
                variant="outlinedPrimary"
                color="secondary"
                size="large"
                className={matches && classes.btnFullWidth}
                onClick={handleClick}
              >
                GET INSURANCE
              </Button>
            )}

            {!btnClaimInsuranceDisabled && settled && (
              <Button
                id={"claimInsurance"+flightID}
                variant="outlinedPrimary"
                color="secondary"
                size="large"
                className={matches && classes.btnFullWidth}
                onClick={handleClick}
              >
                CLAIM INSURANCE
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
};

export default FlightCard;
