import React from "react";
import { Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import MenuLink from "./MenuLink";

const useStyles = makeStyles(() => ({
  navlink: {
    display: "flex",
    alignItems: "center",
    paddingLeft: 24,
    paddingRight: 24,
    color: "#FFF",
    textDecoration: "none",
    listStyleType: "none",
  },
  menuLeft: {
    display: "block",
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    width: "25%",
    padding: 24,
    backgroundColor: "#64A7E7",
  },
}));

const Menu = () => {
  const classes = useStyles();
  const links = [
    { to: "/me", label: "My activity", order: 0 },
    { to: "/passenger", label: "Subscribe an insurance", order: 1 },
    { to: "/oracle-provider", label: "Oracle providers metrics", order: 2 },
    {
      to: "/insurance-provider",
      label: "Insurance provider metrics",
      order: 3,
    },
    { to: "/admin", label: "Admin Dashboard", order: 4 },
    { to: "/dao", label: "Community metrics", order: 5 },
    { to: "/membership", label: "Current membership applications", order: 6 },
    { to: "/proposals", label: "Current setting proposals", order: 7 },
    { to: "/register", label: "Register as a service provider", order: 7 },
  ].sort((a, b) => a.order - b.order);
  return (
    <Grid container className={classes.menuLeft}>
      <Typography variant="h4" component="li" className={classes.navlink}>
        The FlightSurety DAO
      </Typography>

      {links.map(({ order, to, label }) => (
        <MenuLink key={order} to={to} label={label} />
      ))}
    </Grid>
  );
};

export default Menu;
