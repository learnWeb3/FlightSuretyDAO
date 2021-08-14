import React from "react";
import { makeStyles, Typography } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  typoIcon: {
    display: "flex",
    marginBottom: "0.35em",
    "& svg": {
      marginRight: ".35em",
    },
  },
}));

const TypoIcon = ({ text, icon: Icon }) => {
  const classes = useStyles();
  return (
    <div className={classes.typoIcon}>
      <Icon fontSize="small" />
      <Typography variant="body1">{text}</Typography>
    </div>
  );
};

export default TypoIcon;
