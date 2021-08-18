import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import NavigateNextRoundedIcon from "@material-ui/icons/NavigateNextRounded";
import Context from "../../../context";

const useStyles = makeStyles(() => ({
  navlink: {
    display: "flex",
    alignItems: "center",
    color: "#FFF",
    marginTop: 16,
    textDecoration: "none",
    listStyleType: "none",
    "& svg": {
      marginRight: 16,
    },
  },
}));

const MenuLink = ({ to, label }) => {
  const { setMenuLeftIsOpen } = useContext(Context);
  const classes = useStyles();
  const handleClick = () => setMenuLeftIsOpen(false);
  return (
    <Link onClick={handleClick} to={to} className={classes.navlink}>
      <NavigateNextRoundedIcon />
      <Typography variant="h6" component="li">
        {label}
      </Typography>
    </Link>
  );
};

export default MenuLink;
