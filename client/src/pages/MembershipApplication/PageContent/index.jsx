import React, { useContext, useEffect, useState } from "react";
import { Container, Grid, Typography } from "@material-ui/core";
import Context from "../../../context/index";
import { makeStyles } from "@material-ui/core/styles";
import MyDataGrid from "../../../components/MyDataGrid";
import LoadingAnimation from "../../../components/LoadingAnimation";
import NoContent from "../../../components/icons/NoContent";
import { ErrorPage } from "../../../components/Error";
import VoteMembership from "../../../components/VoteMembership/index.jsx/index";
import moment from "moment";
import MuiAlert from "@material-ui/lab/Alert";

const useStyles = makeStyles(() => ({
  alert: {
    marginBottom: 24,
    marginTop: 24,
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
      props: {
        type: "insuranceProvider",
        votee: event.row["insuranceProvider"],
      },
    });
  };

  const [
    formattedCurrentMembershipApplications,
    setFormattedCurrentMembershipApplications,
  ] = useState(null);

  useEffect(() => {
    if (currentMembershipApplications) {
      {
        const _formattedCurrentMembershipApplications = {
          oracleProvidersApplications:
            currentMembershipApplications.oracleProvidersApplications.length > 0
              ? currentMembershipApplications.insuranceProviderApplications.map(
                  (membershipApplication) => ({
                    ...membershipApplication,
                    timestamp: moment(membershipApplication.timestamp * 1000)
                      .format("MMMM Do YYYY h:mm:ss a")
                      .toString(),
                  })
                )
              : [],
          insuranceProviderApplications:
            currentMembershipApplications.insuranceProviderApplications.length >
            0
              ? currentMembershipApplications.insuranceProviderApplications.map(
                  (membershipApplication) => ({
                    ...membershipApplication,
                    timestamp: moment(membershipApplication.timestamp * 1000)
                      .format("MMMM Do YYYY h:mm:ss a")
                      .toString(),
                  })
                )
              : [],
        };
        setFormattedCurrentMembershipApplications(
          _formattedCurrentMembershipApplications
        );
        setState({ status: "loaded", code: null });
      }
    }
  }, [currentMembershipApplications]);

  const columns = [
    {
      field: "address",
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
      field: "currentVotes",
      headerName: "current votes",
      width: 250,
      headerClassName: "fontBold",

      cellClassName: (params) => "noFocus",
    },
    {
      field: "requiredVotes",
      headerName: "required votes",
      width: 250,
      headerClassName: "fontBold",

      cellClassName: (params) => "noFocus",
    },
  ];

  return state.status === "loaded" ? (
    <Container>
      <Typography variant="h4" component="h8">
        Membership application
      </Typography>

      <MuiAlert
        className={classes.alert}
        elevation={6}
        variant="filled"
        severity="info"
      >
        In this section you will find all the current membership applications
        aka providers who are not yet activated. A fifty percent multiparty
        consensus needs to be achieved among token holders in order for a new
        provider to participate in the DAO
      </MuiAlert>

      {formattedCurrentMembershipApplications?.oracleProvidersApplications
        .length > 0 ? (
        <Grid container>
          <MyDataGrid
            handleClick={handleClickOracleProvidersDataGrid}
            header="Oracle provider applications"
            rows={
              formattedCurrentMembershipApplications.oracleProvidersApplications
            }
            columns={columns}
          />
        </Grid>
      ) : (
        <NoContent fontSize="6rem" message="Nothing just yet ..." />
      )}

      {formattedCurrentMembershipApplications?.insuranceProviderApplications
        .length > 0 ? (
        <Grid container>
          <MyDataGrid
            handleClick={handleClickInsuranceProvidersDataGrid}
            header="Insurance provider applications"
            rows={
              formattedCurrentMembershipApplications.insuranceProviderApplications
            }
            columns={columns}
          />
        </Grid>
      ) : (
        <NoContent fontSize="6rem" message="Nothing just yet ..." />
      )}
    </Container>
  ) : state.status === "error" ? (
    <ErrorPage code={state.code} height="100%" />
  ) : (
    state.status === "loading" && <LoadingAnimation />
  );
};

export default PageContent;
