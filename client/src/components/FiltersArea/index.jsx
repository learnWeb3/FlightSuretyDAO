import React, { useContext } from "react";
import { Grid, makeStyles, Paper } from "@material-ui/core";
import ActiveFilters from "./ActiveFilters";
import DateField from "../DateField/index";
import Context from "../../context/index";

const useStyles = makeStyles((theme) => ({
  grid: {
    padding: 24,
  },
}));
const FiltersArea = () => {
  const {
    // filters
    isFilterFlightToActive,
    setFilterFlightToActive,
  } = useContext(Context);
  const classes = useStyles();

  return (
    <Paper>
      <Grid className={classes.grid} container spacing={2}>
        <Grid item xs={12} lg={4}>
          <ActiveFilters
            isFilterFlightToActive={isFilterFlightToActive}
            setFilterFlightToActive={(isFilterFlightToActiveState) =>
              setFilterFlightToActive(isFilterFlightToActiveState)
            }
          />
        </Grid>
        <Grid item xs={12} lg={4}>
          <DateField label={"Departure date"} id={"departure-date"} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <DateField label={"Arrival date"} id={"arrival-date"} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FiltersArea;
