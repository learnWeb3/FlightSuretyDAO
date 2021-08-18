import React, { useContext } from "react";
import MenuRounded from "@material-ui/icons/MenuRounded/";
import { makeStyles } from "@material-ui/core/styles";
import Context from "../../context";

const useStyles = makeStyles(() => ({
  openMenu: {
    cursor: "pointer",
    color: "#FFF",
  },
  navbar: {
    display: "flex",
    padding: 16,
    backgroundColor: "#64A7E7",
  },
}));

const Navbar = () => {
  const classes = useStyles();
  const {
    //menu left
    setMenuLeftIsOpen,
  } = useContext(Context);

  const handlOpenMenu = () => setMenuLeftIsOpen(true);

  return (
    <nav className={classes.navbar}>
      <MenuRounded onClick={handlOpenMenu} className={classes.openMenu} />
    </nav>
  );
};

export default Navbar;
