import React from "react";
import { Hidden, makeStyles, Grid } from "@material-ui/core";
import FlightRoundedIcon from "@material-ui/icons/FlightRounded";

const useStyles = makeStyles(() => ({
  flightIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
}));

const FlightIcon = () => {
  const classes = useStyles();
  return (
    <Hidden mdDown>
      <Grid item xs={12} lg={3} className={classes.flightIcon}>
        <FlightRoundedIcon fontSize="large" />
      </Grid>
    </Hidden>
  );
};

export default FlightIcon;
