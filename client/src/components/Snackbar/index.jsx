import React, { useContext } from "react";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import Context from "../../context/index";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const SnackBar = () => {
  const {
    // modal
    alert,
    setAlert,
  } = useContext(Context);
  const handleClose = () => {
    setAlert({
      toogled: false,
      message: "",
      type: "error",
    });
  };
  return (
    <Snackbar autoHideDuration={6000} open={true} onClose={handleClose}>
      <Alert id="alert" onClose={handleClose} severity={alert.type}>
        {alert.message}
      </Alert>
    </Snackbar>
  );
};

export default SnackBar;
