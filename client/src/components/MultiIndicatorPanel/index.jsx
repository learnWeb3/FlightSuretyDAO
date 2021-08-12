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
  item: {
    display: "flex",
    alignItems: "center",
  },
}));

const MultiIndicatorPanel = ({ label, values }) => {
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
        {values.map((value, index) => (
          <Grid container key={`indicator-${label}-${index}`}>
            <Grid item xs={6} className={classes.item}>
              <Typography variant="body1" component="p"  color="textSecondary" gutterBottom>
                {value.label.toUpperCase()}
              </Typography>
            </Grid>
            <Grid item xs={6} className={classes.item}>
              {value.value ? (
                <Typography variant="h4" component="p" gutterBottom>
                  {value.value}
                </Typography>
              ) : (
                <Typography variant="h5" component="p" gutterBottom>
                  {"N/A"}
                </Typography>
              )}
            </Grid>
          </Grid>
        ))}
      </Paper>
    </Grid>
  );
};

export default MultiIndicatorPanel;
