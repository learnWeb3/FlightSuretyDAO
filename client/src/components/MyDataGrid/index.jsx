import React from "react";
import { DataGrid } from "@material-ui/data-grid";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
const useStyles = makeStyles(() => ({
  header: {
    marginBottom: 24,
    marginTop: 24,
  },
  root: {
    "& .fontBold": {
      fontWeight: 900,
      textTransform: "uppercase",
    },
    "& .cursorPointer": {
      cursor: "pointer",
    },
    "& .noFocus:focus-within":{
      outline: "unset"
    },
    "& .noFocus:focus":{
      outline: "unset"
    }
  },
}));
const MyDataGrid = ({ header, rows, columns, handleClick }) => {
  const classes = useStyles();
  return (
    <div style={{ display: "flex", width: "100%" }}>
      <div style={{ flexGrow: 1 }} className={classes.root}>
        <Typography variant="subtitle1" component="p" className={classes.header}>
          {header}
        </Typography>
        <DataGrid
          style={{ backgroundColor: "#FFF" }}
          autoHeight
          onCellClick={handleClick}
          rows={rows}
          columns={columns}
          pageSize={10}
          getRowClassName={(params) => "cursorPointer"}
          disableSelectionOnClick
        />
      </div>
    </div>
  );
};

export default MyDataGrid;
