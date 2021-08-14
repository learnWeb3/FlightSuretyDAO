import React, { useContext } from "react";
import { Chip, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Context from "../../../context";

const useStyles = makeStyles(() => ({
  chip: {
    marginRight: 16,
    marginBottom: 24,
  },
}));

const FlightStatus = ({
  flightData: {
    estimatedDeparture,
    estimatedArrival,
    insuredValue,
    settled,
    isLate,
    oracleActivatedIndex,
    btnCreateRequestDisabled,
    oracleRequestIsPresent,
  },
}) => {
  const { appContract } = useContext(Context);
  const classes = useStyles();
  return (
    <Grid item xs={12}>
      {estimatedDeparture * 1000 > Date.now() && (
        <Chip
          variant="outlined"
          color="secondary"
          label="pending departure"
          className={classes.chip}
        />
      )}

    {estimatedDeparture * 1000 < Date.now() && estimatedArrival * 1000 > Date.now() && (
        <Chip
          variant="outlined"
          color="secondary"
          label="ongoing"
          className={classes.chip}
        />
      )}


      {estimatedArrival * 1000 < Date.now() && (
        <Chip
          variant="outlined"
          color="secondary"
          label="pending settlement"
          className={classes.chip}
        />
      )}

      {settled && isLate && (
        <Chip
          variant="outlined"
          color="secondary"
          label="pending claim"
          className={classes.chip}
        />
      )}

      {oracleActivatedIndex && (
        <>
          <Chip
            variant="outlined"
            color="secondary"
            label={"selected oracle index " + oracleActivatedIndex}
            className={classes.chip}
          />
          <Chip
            variant="outlined"
            color="secondary"
            label={"accepted answer consensus ratio : 5"}
            className={classes.chip}
          />
        </>
      )}

      {appContract && insuredValue && (
        <Chip
          variant="outlined"
          color="secondary"
          label={
            "current insured value : " +
            appContract?.utils.fromWei(insuredValue, "ether") +
            " Eth"
          }
          className={classes.chip}
        />
      )}

      {!btnCreateRequestDisabled &&
        !oracleRequestIsPresent &&
        estimatedArrival * 1000 < Date.now() && (
          <Chip
            variant="outlined"
            color="secondary"
            label="pending settlement request"
            className={classes.chip}
          />
        )}
    </Grid>
  );
};

export default FlightStatus;
