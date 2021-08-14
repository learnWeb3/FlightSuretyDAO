import React from "react";
import { Chip, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

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
    settled,
    isLate,
    oracleActivatedIndex,
  },
}) => {
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

      {estimatedArrival * 1000 > Date.now() && (
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
        <Chip
          variant="outlined"
          color="secondary"
          label={"selected oracle index " + oracleActivatedIndex}
          className={classes.chip}
        />
      )}
    </Grid>
  );
};

export default FlightStatus;
