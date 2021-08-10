import { Grid, Hidden } from "@material-ui/core";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import NoContent from "../icons/NoContent";

const useStyles = makeStyles(() => ({
  container: {
    minHeight: "100vh",
  },
  menuLeft: {
    backgroundColor: "#64A7E7",
  },
  flex: {
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  }
}));

const Layout = ({ component: Component, props }) => {
  const classes = useStyles();
  return (
    <Grid container className={classes.container}>
      <Hidden mdDown={true}>
        <Grid item xs={3} className={classes.menuLeft}></Grid>
      </Hidden>

      <Grid item xs={12} lg={9} className={!Component ? classes.flex : null}>
        {Component ? (
          <Component {...props} />
        ) : (
          <NoContent height="30rem" message="Nothing just yet ..."  />
        )}
      </Grid>
    </Grid>
  );
};

export default Layout;
