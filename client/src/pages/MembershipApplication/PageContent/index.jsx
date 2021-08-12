import React, { useContext, useEffect } from "react";
import { Container, Grid, Typography } from "@material-ui/core";
import Context from "../../../context/index";
import { makeStyles } from "@material-ui/core/styles";
import MyDataGrid from "../../../components/MyDataGrid";
import LoadingAnimation from "../../../components/LoadingAnimation";
import NoContent from "../../../components/icons/NoContent";
import { ErrorPage } from "../../../components/Error";
import VoteMembership from "../../../components/VoteMembership/index.jsx/index";

const useStyles = makeStyles(() => ({
  header: {
    marginBottom: 32,
  },
}));

const PageContent = ({ state, setState }) => {
  const classes = useStyles();

  const {
    // data
    currentMembershipApplications,
    // modal
    setModal,
  } = useContext(Context);

  const handleClickOracleProvidersDataGrid = (event) => {
    setModal({
      displayed: true,
      content: VoteMembership,
      props: { type: "oracleProvider", votee: event.row["oracleProvider"] },
    });
  };

  const handleClickInsuranceProvidersDataGrid = (event) => {
    setModal({
      displayed: true,
      content: VoteMembership,
      props: { type: "insuranceProvider", votee: event.row["insuranceProvider"] },
    });
  };

  useEffect(() => {
    currentMembershipApplications?.oracleProvidersApplications.length === 0 &&
      currentMembershipApplications?.insuranceProviderApplications.length ===
        0 &&
      setState({ status: "nocontent", code: null });
  }, [currentMembershipApplications]);

  const columns = [
    { field: "address", headerName: "address", width: 250 },
    { field: "timestamp", headerName: "date", width: 250 },
    { field: "currentVotes", headerName: "current votes", width: 250 },
    { field: "requiredVotes", headerName: "required votes", width: 250 },
    { field: "vote", headerName: "vote", width: 250 },
  ];

  return state.status === "loaded" ? (
    <Container>
      <Typography variant="h4" component="h8" className={classes.header}>
        Membership application
      </Typography>

      {currentMembershipApplications?.oracleProvidersApplications.length >
        0 && (
        <Grid container>
          <MyDataGrid
            handleClick={handleClickOracleProvidersDataGrid}
            header="Oracle provider applications"
            rows={currentMembershipApplications.oracleProvidersApplications}
            columns={columns}
          />
        </Grid>
      )}

      {currentMembershipApplications?.insuranceProviderApplications.length >
        0 && (
        <Grid container>
          <MyDataGrid
            handleClick={handleClickInsuranceProvidersDataGrid}
            header="Insurance provider applications"
            rows={currentMembershipApplications.insuranceProviderApplications}
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
      <NoContent width="50%" message="Nothing just yet ..." />
    )
  );
};

export default PageContent;
