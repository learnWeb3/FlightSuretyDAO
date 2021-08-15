import React, { useContext, useState, useEffect } from "react";
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import MenuLink from "./MenuLink";
import Context from "../../context/index";
import TypoIcon from "../FlightCard/FlightData/TypoIcon/index";
import FlightRoundedIcon from "@material-ui/icons/FlightRounded";

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
  const { registration } = useContext(Context);
  const classes = useStyles();
  const [links, setLinks] = useState(null);
  useEffect(() => {
    registration &&
      setLinks(
        [
          {
            to: "/me",
            label: "My activity",
            order: 0,
            display:
              registration.isActivatedInsuranceProvider ||
              registration.isActivatedOracleProvider ||
              registration.isTokenHolder,
          },
          {
            to: "/passenger",
            label: "Subscribe an insurance",
            order: 1,
            display: true,
          },
          {
            to: "/oracle-provider",
            label: "Oracle providers dashboard",
            order: 2,
            display: registration.isActivatedOracleProvider,
          },
          {
            to: "/insurance-provider",
            label: "Insurance provider dashboard",
            order: 3,
            display: registration.isActivatedInsuranceProvider,
          },
          {
            to: "/admin",
            label: "Admin Dashboard",
            order: 4,
            display: registration.isOwner,
          },
          { to: "/dao", label: "Community dashboard", order: 5, display: true },
          {
            to: "/membership",
            label: "Current membership applications",
            order: 6,
            display: registration.isTokenHolder,
          },
          {
            to: "/proposals",
            label: "Current setting proposals",
            order: 7,
            display: registration.isTokenHolder,
          },
          {
            to: "/register",
            label: "Register as a service provider",
            order: 7,
            display:
              !registration.isActivatedInsuranceProvider &&
              !registration.isActivatedOracleProvider,
          },
        ].sort((a, b) => a.order - b.order)
      );
  }, [registration]);
  return (
    <Grid container className={classes.menuLeft}>
      <TypoIcon
        text={"FlightSurety DAO"}
        variant={"h5"}
        icon={FlightRoundedIcon}
        iconFontSize={"medium"}
        color={"#FFF"}
        marginBottom={32}
        textColor={"#FFF"}
      />
      {links?.map(
        ({ order, to, label, display }) =>
          display && <MenuLink key={order} to={to} label={label} />
      )}
    </Grid>
  );
};

export default Menu;
