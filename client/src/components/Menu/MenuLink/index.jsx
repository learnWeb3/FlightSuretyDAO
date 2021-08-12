import React from "react";
import { Link } from "react-router-dom";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import NavigateNextRoundedIcon from "@material-ui/icons/NavigateNextRounded";

const useStyles = makeStyles(() => ({
  navlink: {
    display: "flex",
    alignItems: "center",
    padding: 24,
    color: "#FFF",
    textDecoration: "none",
    listStyleType: "none",
    "& svg": {
      marginRight: 16,
    },
  },
}));

const MenuLink = ({ to, label }) => {
  const classes = useStyles();
  return (
    <Link to={to} className={classes.navlink}>
      <NavigateNextRoundedIcon />
      <Typography variant="h6" component="li">
        {label}
      </Typography>
    </Link>
  );
};

export default MenuLink;
