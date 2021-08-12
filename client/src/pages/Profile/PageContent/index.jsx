import React, { useContext, useEffect, useState } from "react";
import { Container, Grid, Typography } from "@material-ui/core";
import Context from "../../../context/index";
import { makeStyles } from "@material-ui/core/styles";
import MyDataGrid from "../../../components/MyDataGrid";
import LoadingAnimation from "../../../components/LoadingAnimation";
import NoContent from "../../../components/icons/NoContent";
import { ErrorPage } from "../../../components/Error";
import moment from "moment";
import MuiAlert from "@material-ui/lab/Alert";

const useStyles = makeStyles(() => ({
  alert: {
    marginBottom: 24,
    marginTop: 24,
  }
}));

const PageContent = ({ state, setState }) => {
  const classes = useStyles();
  const [formattedUserTx, setFormattedUserTx] = useState(null);

  const {
    // data
    userTx,
    // modal
    setModal,
  } = useContext(Context);

  useEffect(() => {
    if (userTx) {
      if (userTx.length > 0) {
        const _formattedUserdTx = userTx.map((tx) => ({
          ...tx,
          timestamp: moment(tx.timestamp * 1000)
            .format("MMMM Do YYYY h:mm:ss a")
            .toString(),
        }));
        setFormattedUserTx(_formattedUserdTx);
        setState({ status: "loaded", code: null });
      } else {
        setState({ status: "nocontent", code: null });
      }
    }
  }, [userTx]);

  const columns = [
    { field: "tx", headerName: "address", width: 250 },
    { field: "timestamp", headerName: "date", width: 250 },
    { field: "eventName", headerName: "event", width: 250 },
    { field: "type", headerName: "status", width: 250 },
  ];

  const handleClickUserTxDataGrid = ({ value }) => {
    window.location.href = "https://rinkeby.etherscan.io/tx/" + value;
  };

  return state.status === "loaded" ? (
    <Container>
      <Typography
        variant="h4"
        component="h8"
      >
        Transaction history
      </Typography>

      <MuiAlert className={classes.alert} elevation={6} variant="filled" severity="info">
        In this section you will find all your transactions related to your
        activity on The FlightSurety DAO, transactions status and hash. At any
        time you can click on the table row showing your transaction details to
        get more insights on the Etherscan block explorer
      </MuiAlert>

      {formattedUserTx?.length > 0 && (
        <Grid container>
          <MyDataGrid
            handleClick={handleClickUserTxDataGrid}
            header="Your transactions to the Flight surety DAO"
            rows={formattedUserTx}
            columns={columns}
          />
        </Grid>
      )}
    </Container>
  ) : state.status === "error" ? (
    <ErrorPage code={state.code} height="100%" />
  ) : state.status === "loading" ? (
    <LoadingAnimation />
  ) : (
    state.status === "nocontent" && (
      <NoContent fontSize="6rem" message="Nothing just yet ..." />
    )
  );
};

export default PageContent;
