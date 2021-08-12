import React from "react";
import { DataGrid } from "@material-ui/data-grid";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
const useStyles = makeStyles(() => ({
  header: {
    marginBottom: 24,
    marginTop: 24,
  },
}));
const MyDataGrid = ({ header, rows, columns, handleClick }) => {
  const classes = useStyles();
  return (
    <div style={{ display: "flex", width: "100%" }}>
      <div style={{ flexGrow: 1 }}>
        <Typography variant="h5" component="h2" className={classes.header}>
          {header}
        </Typography>
        <DataGrid
          autoHeight
          onCellClick={handleClick}
          rows={rows}
          columns={columns}
          pageSize={5}
          disableSelectionOnClick
        />
      </div>
    </div>
  );
};

export default MyDataGrid;
