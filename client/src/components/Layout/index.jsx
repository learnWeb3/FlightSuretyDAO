import React, { useContext } from "react";
import { Grid, Hidden } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Context from "../../context/index";
import Modal from "../Modal/index";
import SnackBar from "../Snackbar/index";
import Menu from "../Menu";

const useStyles = makeStyles(() => ({
  container: {
    minHeight: "100vh",
  },
  mainContainer: {
    padding: 24,
    backgroundColor: "#F8F8F8",
  },
}));

const Layout = ({ component: Component, state, ...props }) => {
  const classes = useStyles();
  const {
    // modal
    modal,
    // snackbar
    alert,
  } = useContext(Context);
  return (
    <Grid container className={classes.container}>
      <Hidden mdDown={true}>
        <Grid item xs={3}>
          <Menu />
        </Grid>
      </Hidden>
      <Grid item xs={12} lg={9} className={classes.mainContainer}>
        <Component state={state} {...props} />
        {modal.displayed && (
          <Modal component={modal.content} {...modal.props} />
        )}
        {alert.displayed === true && <SnackBar />}
      </Grid>
    </Grid>
  );
};

export default Layout;
