import React from "react";
import ArrowBackRoundedIcon from "@material-ui/icons/ArrowBackRounded";
import { Typography, makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  backPanel: {
    display: "flex",
    alignItems: "center",
    marginBottom: 16
  },
  backArrow: {
    marginRight: 8,
    cursor: "pointer",
  },
}));

const ModalClosePanel = ({ setModalToogled }) => {
  const classes = useStyles();
  return (
    <div className={classes.backPanel}>
      <ArrowBackRoundedIcon
        fontSize="small"
        className={classes.backArrow}
        color="secondary"
        onClick={() => setModalToogled(false)}
      />
      <Typography
        variant="body1"
        color="secondary"
        component="p"
        className={classes.title}
      >
        Cancel
      </Typography>
    </div>
  );
};

export default ModalClosePanel;
