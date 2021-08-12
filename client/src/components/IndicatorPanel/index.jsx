import React from "react";
import { Grid, Typography } from "@material-ui/core";
import { Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  indicatorPanel: {
    padding: 24,
    height: 200,
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  indicatorLabel: {
    position: "absolute",
    top: 24,
    left: 24,
  },
}));

const IndicatorPanel = ({ loaded, label, value }) => {
  const classes = useStyles();
  return (
    <Grid item xs={12} lg={4}>
      <Paper className={classes.indicatorPanel}>
        {label && (
          <Typography
            variant="body1"
            component="p"
            color="textSecondary"
            className={classes.indicatorLabel}
          >
            {label?.toUpperCase()}
          </Typography>
        )}
        <Typography variant="h4" component="p" gutterBottom>
          {value}
        </Typography>
      </Paper>
    </Grid>
  );
};

export default IndicatorPanel;
