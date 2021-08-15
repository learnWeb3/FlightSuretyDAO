import React from "react";
import noContent from "./img/no_content.png";
import { makeStyles } from "@material-ui/core/styles";
import Alert from "@material-ui/lab/Alert";
import ErrorOutlineRoundedIcon from "@material-ui/icons/ErrorOutlineRounded";
const useStyles = makeStyles(() => ({
  flex: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    minHeight: "40vh",
  },
  alert: {
    marginBottom: 24,
    marginTop: 24,
  },
}));

const NoContent = ({ fontSize, message }) => {
  const classes = useStyles();
  return (
    <div className={classes.flex}>
      <ErrorOutlineRoundedIcon style={{ fontSize, color: "#3f51b5" }} />
      {message && (
        <Alert severity="info" className={classes.alert}>
          {message}
        </Alert>
      )}
    </div>
  );
};

export default NoContent;
