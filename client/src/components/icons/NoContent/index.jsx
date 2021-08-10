import React from "react";
import noContent from "./img/no_content.png";
import { makeStyles } from "@material-ui/core/styles";
import Alert from "@material-ui/lab/Alert";
const useStyles = makeStyles(() => ({
  flex: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
}));

const NoContent = ({ height, width, message }) => {
  const classes = useStyles();
  return (
    <div className={classes.flex}>
      <img
        src={noContent}
        alt="NoContent"
        style={{ height: height, width: width }}
      />
      {message && <Alert severity="info">{message}</Alert>}
    </div>
  );
};

export default NoContent;
