import React from "react";
import { Typography, Container, Grid } from "@material-ui/core";
import ErrorOutlineRoundedIcon from "@material-ui/icons/ErrorOutlineRounded";
import MetamaskIcon from "../icons/MetamaskIcon";
import NotFound from "../icons/NotFound";
import ServerError from "../icons/ServerError";
import Forbidden from "../icons/Forbidden";
import { makeStyles } from "@material-ui/core/styles";
import Alert from "@material-ui/lab/Alert";

const useStyles = makeStyles(() => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorCode: {
    marginTop: 24,
  },
  componentErrorContainer: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  componentErrorIllustration: {
    height: "75%",
  },
  errorCodeComponent: {
    marginTop: 8,
    textAlign: "justify",
  },
}));

const ErrorPage = ({
  code,
  height,
  messageDisplayed = true,
  message = null,
}) => {
  const classes = useStyles();
  const mapCodeToMessage = {
    404: {
      message: "Page not found !",
      illustration: <NotFound height="50%" />,
    },
    403: {
      message: "Forbidden !",
      illustration: <Forbidden height="50%" />,
    },
    499: {
      message: "Please install Metamask !",
      illustration: <MetamaskIcon height="50%" />,
    },
    500: {
      message: "Internal Server Error",
      illustration: <ServerError height="50%" />,
    },
  };
  return (
    <Container className={classes.container} style={{ height: height }}>
      {mapCodeToMessage[code].illustration}
      {messageDisplayed && (
        <Alert severity="error" className={classes.errorCode}>
          {message ? message : mapCodeToMessage[code].message}
        </Alert>
      )}
    </Container>
  );
};

const ErrorComponent = () => {
  const classes = useStyles();
  return (
    <Container maxWidth="lg" className={classes.componentErrorContainer}>
      <ErrorOutlineRoundedIcon fontVariant="contained" />
      <Typography
        variant="body2"
        component="p"
        className={classes.errorCodeComponent}
      >
        Oops, impossible to load this content please refresh your browser page
      </Typography>
    </Container>
  );
};

export { ErrorPage, ErrorComponent };
