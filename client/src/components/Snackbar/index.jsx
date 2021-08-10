import React from "react";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const SnackBar = ({ message, type, setAlert }) => {
  const handleClose = () => {
    setAlert({
      toogled: false,
      message: "",
      type: "error",
    });
  };
  return (
    <Snackbar autoHideDuration={6000} open={true} onClose={handleClose}>
      <Alert id="alert" onClose={handleClose} severity={type}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SnackBar;
