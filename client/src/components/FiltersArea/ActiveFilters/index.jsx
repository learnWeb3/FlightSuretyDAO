import {
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
} from "@material-ui/core";
import Radio from "@material-ui/core/Radio";
import React from "react";

const ActiveFilters = ({ isFilterFlightToActive, setFilterFlightToActive }) => {
  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">Flight state</FormLabel>
      <RadioGroup row aria-label="position" name="position" defaultValue="top">
        <FormControlLabel
          value="end"
          control={<Radio color="primary" />}
          label="current"
          onChange={() => setFilterFlightToActive(true)}
          checked={isFilterFlightToActive ? true : false}
        />
        <FormControlLabel
          value="end"
          control={<Radio color="primary" />}
          label="past"
          onChange={() => setFilterFlightToActive(false)}
          checked={!isFilterFlightToActive ? true : false}
        />
      </RadioGroup>
    </FormControl>
  );
};

export default ActiveFilters;
