import React from "react";
import Lottie from "lottie-react";
import LottieLoader from "./json/loader.json";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  container: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
}));
const LoadingAnimation = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <Lottie animationData={LottieLoader} />
    </div>
  );
};

export default LoadingAnimation;
