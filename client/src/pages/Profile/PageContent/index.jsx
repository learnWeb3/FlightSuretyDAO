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
import FiltersArea from "../../../components/FiltersArea/index";
import FlightCard from "../../../components/FlightCard";

const useStyles = makeStyles(() => ({
  flightContainer: { display: "flex", justifyContent: "center" },
  container: {
    marginBottom: 24,
    marginTop: 24,
  },
  alert: {
    marginBottom: 24,
    marginTop: 24,
  },
}));

const PageContent = ({ state, setState }) => {
  const classes = useStyles();
  const [formattedUserTx, setFormattedUserTx] = useState(null);

  const {
    // data
    userTx,
    userInsuranceContracts,
    // filters
    isFilterFlightToActive,
    // modal
    setModal,
  } = useContext(Context);

  useEffect(() => {
    if (userTx && userInsuranceContracts) {
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
        setState({ status: "loaded", code: null });
      }
    }
  }, [userTx, userInsuranceContracts]);

  const columns = [
    {
      field: "tx",
      headerName: "address",
      width: 250,
      headerClassName: "fontBold",

      cellClassName: (params) => "noFocus",
    },
    {
      field: "timestamp",
      headerName: "date",
      width: 250,
      headerClassName: "fontBold",

      cellClassName: (params) => "noFocus",
    },
    {
      field: "eventName",
      headerName: "event",
      width: 250,
      headerClassName: "fontBold",

      cellClassName: (params) => "noFocus",
    },
    {
      field: "type",
      headerName: "status",
      width: 250,
      headerClassName: "fontBold",

      cellClassName: (params) => "noFocus",
    },
  ];

  const handleClickUserTxDataGrid = ({ value }) => {
    window.location.href = "https://rinkeby.etherscan.io/tx/" + value;
  };

  return state.status === "loaded" ? (
    <>
      <Container >
        <Typography variant="h5" component="h1" gutterBottom>
          My Activity
        </Typography>
      </Container>
      <Container className={classes.container}>
        <Typography variant="h6" component="h1">
          Transaction history
        </Typography>

        <MuiAlert
          className={classes.alert}
          elevation={6}
          variant="filled"
          severity="info"
        >
          In this section you will find all your transactions related to your
          activity on The FlightSurety DAO, transactions status and hash. At any
          time you can click on the table row showing your transaction details
          to get more insights on the Etherscan block explorer
        </MuiAlert>

        {formattedUserTx?.length > 0 && (
          <Grid container>
            <MyDataGrid
              handleClick={handleClickUserTxDataGrid}
              header="Your transactions"
              rows={formattedUserTx}
              columns={columns}
            />
          </Grid>
        )}
      </Container>
      <Container className={classes.container}>
        <Typography variant="h6" component="h1">
          My insurances contract
        </Typography>

        <MuiAlert
          className={classes.alert}
          elevation={6}
          variant="filled"
          severity="info"
        >
          In this section you will find all the insurances contracts you have
          subscribed to and their respective status
        </MuiAlert>

        <FiltersArea />
        <Grid container className={classes.flightContainer}>
          {userInsuranceContracts ? (
            userInsuranceContracts
              ?.filter(
                (flight) =>
                  flight.estimatedDeparture * 1000 >= Date.now() ===
                  isFilterFlightToActive
              )
              .map(
                (
                  {
                    flightID,
                    flightRef,
                    estimatedDeparture,
                    estimatedArrival,
                    insuranceProvider,
                    rate,
                    isLate,
                    realArrival,
                    realDeparture,
                    settled,
                    insuranceID,
                  },
                  index
                ) => (
                  <FlightCard
                    key={flightID + index}
                    cardID={flightID + index}
                    flightID={flightID}
                    flightRef={flightRef}
                    estimatedDeparture={estimatedDeparture}
                    estimatedArrival={estimatedArrival}
                    insuranceProvider={insuranceProvider}
                    rate={rate}
                    isLate={isLate}
                    realArrival={realArrival}
                    realDeparture={realDeparture}
                    settled={settled}
                    btnClaimInsuranceDisabled={false}
                    btnSubscribeInsuranceDisabled={true}
                    insuranceID={insuranceID}
                  />
                )
              )
          ) : (
            <LoadingAnimation />
          )}

          {userInsuranceContracts?.filter(
            (flight) =>
              flight.estimatedDeparture * 1000 >= Date.now() ===
              isFilterFlightToActive
          ).length === 0 && (
            <NoContent width="100%" message="Nothing just yet ..." />
          )}
        </Grid>
      </Container>
    </>
  ) : state.status === "error" ? (
    <ErrorPage code={state.code} height="100%" message={state.message} />
  ) : state.status === "loading" ? (
    <LoadingAnimation />
  ) : (
    state.status === "nocontent" && (
      <NoContent fontSize="6rem" message="Nothing just yet ..." />
    )
  );
};

export default PageContent;
