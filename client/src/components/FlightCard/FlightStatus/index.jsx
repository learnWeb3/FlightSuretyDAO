import React, { useContext } from "react";
import { Chip, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Context from "../../../context";

const useStyles = makeStyles(() => ({
  chip: {
    marginRight: 16,
    marginBottom: 24,
  },
}));

const FlightStatus = ({
  flightData: {
    estimatedDeparture,
    estimatedArrival,
    insuredValue,
    settled,
    isLate,
    oracleActivatedIndex,
    btnCreateRequestDisabled,
    oracleRequestIsPresent,
  },
}) => {
  const { appContract, daoIndicators } = useContext(Context);
  const classes = useStyles();
  return (
    <Grid item xs={12}>
      {estimatedDeparture * 1000 > Date.now() && (
        <Chip
          variant="default"
          color="primary"
          label="pending departure"
          className={classes.chip}
        />
      )}

      {estimatedDeparture * 1000 < Date.now() &&
        estimatedArrival * 1000 > Date.now() && (
          <Chip
            variant="default"
            color="primary"
            label="ongoing"
            className={classes.chip}
          />
        )}

      {estimatedArrival * 1000 < Date.now() && (
        <Chip
          variant="default"
          color="primary"
          label="pending settlement"
          className={classes.chip}
        />
      )}

      {!settled && isLate && (
        <Chip
          variant="default"
          color="primary"
          label="pending claim"
          className={classes.chip}
        />
      )}

{settled && isLate && (
        <Chip
          variant="default"
          color="primary"
          label="claimed"
          className={classes.chip}
        />
      )}

      {oracleActivatedIndex && (
        <>
          <Chip
            variant="default"
            color="primary"
            label={"selected oracle index " + oracleActivatedIndex}
            className={classes.chip}
          />
          {daoIndicators && (
            <Chip
              variant="default"
              color="primary"
              label={
                "accepted answer consensus ratio : " +
                daoIndicators.acceptedAnswerTreshold
              }
              className={classes.chip}
            />
          )}
        </>
      )}

      {appContract && insuredValue && (
        <Chip
          variant="default"
          color="primary"
          label={
            "current insured value : " +
            appContract?.utils.fromWei(insuredValue, "ether") +
            " Eth"
          }
          className={classes.chip}
        />
      )}

      {!btnCreateRequestDisabled &&
        !oracleRequestIsPresent &&
        estimatedArrival * 1000 < Date.now() && (
          <Chip
            variant="default"
            color="primary"
            label="pending settlement request"
            className={classes.chip}
          />
        )}
    </Grid>
  );
};

export default FlightStatus;
