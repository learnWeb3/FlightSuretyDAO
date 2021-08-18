import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, DateTimePicker } from "@material-ui/pickers";

const useStyles = makeStyles(() => ({
  fullWidth: {
    width: "100%",
  },
}));

const DateField = ({
  label,
  id,
  selectedDate,
  handleChange,
  required,
  error,
  minDate = Date.now(),
}) => {
  const classes = useStyles();
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <DateTimePicker
        minDate={minDate}
        margin="normal"
        id={id}
        label={label}
        format="MM/dd/yyyy"
        value={selectedDate}
        onChange={handleChange}
        keyboardbuttonprops={{
          "aria-label": "change date",
        }}
        className={classes.fullWidth}
        required={required}
      />
    </MuiPickersUtilsProvider>
  );
};

export default DateField;
