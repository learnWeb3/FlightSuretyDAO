import React from "react";
import { makeStyles, Typography } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles(() => ({
  typoIcon: {
    display: "flex",
    marginBottom: "0.35em",
    "& svg": {
      marginRight: ".35em",
    },
  },
  marginBottom: {
    marginBottom: 32,
  },
}));

const TypoIcon = ({
  text,
  variant = "body1",
  iconFontSize = "small",
  marginBottom = 0,
  textColor = "unset",
  icon: Icon,
}) => {
  const classes = useStyles();
  return (
    <div
      className={clsx(
        classes.typoIcon,
        classes.textWhite,
        classes.marginBottom
      )}
      style={{ marginBottom, color: textColor }}
    >
      <Icon fontSize={iconFontSize} />
      <Typography variant={variant} style={{ color: textColor }}>
        {text}
      </Typography>
    </div>
  );
};

export default TypoIcon;
