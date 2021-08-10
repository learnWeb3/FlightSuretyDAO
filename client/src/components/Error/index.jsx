import React from "react";
import { Typography, Container } from "@material-ui/core";
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
    padding: 16,
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
      illustration: <NotFound height="25rem" />,
    },
    403: {
      message: "Forbidden !",
      illustration: <Forbidden height="25rem" />,
    },
    499: {
      message: "Please install Metamask !",
      illustration: <MetamaskIcon height="10rem" />,
    },
    500: {
      message: "Internal Server Error",
      illustration: <ServerError height="25rem" />,
    },
  };
  return (
    <Container
      maxWidth="lg"
      className={classes.container}
      style={{ height: height }}
    >
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
      <ErrorOutlineRoundedIcon fontSize="large" />
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
