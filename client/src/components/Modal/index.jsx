import React from "react";
import { Grid, makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  root: {
    position: "fixed",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  overlay: {
    backgroundColor: "rgba(0,0,0, .66)",
    position: "fixed",
    zIndex: 2,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
  },
}));

const Modal = ({ component: Component, ...props }) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Grid container className={classes.overlay}>
        {Component && <Component {...props} />}
      </Grid>
    </div>
  );
};

export default Modal;
