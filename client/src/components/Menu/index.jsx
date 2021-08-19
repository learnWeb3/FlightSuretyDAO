import React, { useContext, useState, useEffect } from "react";
import { Grid, useMediaQuery, Hidden } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import MenuLink from "./MenuLink";
import Context from "../../context/index";
import TypoIcon from "../FlightCard/FlightData/TypoIcon/index";
import FlightRoundedIcon from "@material-ui/icons/FlightRounded";
import CloseRounded from "@material-ui/icons/CloseRounded/";
import clsx from "clsx";

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
    padding: 24,
    backgroundColor: "#64A7E7",
    zIndex: 1,
  },
  menuLeftSm: {
    width: "100%",
  },
  menuLeftLg: {
    width: "25%",
  },
  closeMenu: {
    cursor: "pointer",
    position: "absolute",
    top: 16,
    right: 16,
    color: "#FFF",
    fontSize: 32,
  },
}));

const Menu = () => {
  const { registration, setMenuLeftIsOpen } = useContext(Context);
  const classes = useStyles();
  const [links, setLinks] = useState(null);
  const matches = useMediaQuery("(max-width:1200px)");

  const handleMenuClose = () => setMenuLeftIsOpen(false);
  useEffect(() => {
    registration &&
      setLinks(
        [
          {
            to: "/me",
            label: "My activity",
            order: 0,
            display: true,
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
            display: true,
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
            order: 8,
            display:
              (registration.isRegisteredOracleProvider &&
                !registration.isActivatedInsuranceProvider) ||
              (registration.isFundedInsuranceProvider &&
                !registration.isActivatedInsuranceProvider)
                ? true
                : false,
          },
        ].sort((a, b) => a.order - b.order)
      );
  }, [registration]);
  return (
    <Grid
      container
      className={
        matches
          ? clsx(classes.menuLeft, classes.menuLeftSm)
          : clsx(classes.menuLeft, classes.menuLeftLg)
      }
    >
      <TypoIcon
        text={"FlightSurety DAO"}
        variant={"h5"}
        icon={FlightRoundedIcon}
        iconFontSize={"medium"}
        color={"#FFF"}
        marginBottom={32}
        textColor={"#FFF"}
      />
      <Hidden mdUp>
        <CloseRounded className={classes.closeMenu} onClick={handleMenuClose} />
      </Hidden>

      {links?.map(
        ({ order, to, label, display }) =>
          display && <MenuLink key={order} to={to} label={label} />
      )}
    </Grid>
  );
};

export default Menu;
