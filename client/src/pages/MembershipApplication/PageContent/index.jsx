import React, { useContext, useEffect, useState } from "react";
import { Container, Grid, Typography } from "@material-ui/core";
import Context from "../../../context/index";
import MyDataGrid from "../../../components/MyDataGrid";
import LoadingAnimation from "../../../components/LoadingAnimation";
import { ErrorPage } from "../../../components/Error";
import VoteMembership from "../../../components/VoteMembership/index.jsx/index";
import moment from "moment";
import MuiAlert from "@material-ui/lab/Alert";

const PageContent = ({ state, setState }) => {
  const {
    // data
    registration,
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
              ? currentMembershipApplications.oracleProvidersApplications.map(
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

  return (
    <Container>
      <Grid container spacing={4}>
        {state.status === "loaded" && (
          <>
            <Grid item xs={12}>
              <Typography variant="h5" component="h1">
                Membership application
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <MuiAlert elevation={6} variant="filled" severity="info">
                In this section you will find all the current membership
                applications aka providers who are not yet activated. A fifty
                percent multiparty consensus needs to be achieved among token
                holders in order for a new provider to participate in the DAO
              </MuiAlert>
            </Grid>

            {formattedCurrentMembershipApplications?.oracleProvidersApplications
              .length > 0 && (
              <Grid item xs={12}>
                <Grid container>
                  <MyDataGrid
                    handleClick={
                      registration?.isTokenHolder &&
                      handleClickOracleProvidersDataGrid
                    }
                    header="Oracle provider applications"
                    rows={
                      formattedCurrentMembershipApplications.oracleProvidersApplications
                    }
                    columns={columns}
                  />
                </Grid>
              </Grid>
            )}

            {formattedCurrentMembershipApplications
              ?.insuranceProviderApplications.length > 0 && (
              <Grid item xs={12}>
                <Grid container>
                  <MyDataGrid
                    handleClick={
                      registration?.isActivatedInsuranceProvider &&
                      handleClickInsuranceProvidersDataGrid
                    }
                    header="Insurance provider applications"
                    rows={
                      formattedCurrentMembershipApplications.insuranceProviderApplications
                    }
                    columns={columns}
                  />
                </Grid>
              </Grid>
            )}
          </>
        )}

        {state.status === "error" && (
          <Grid item xs={12}>
            <ErrorPage
              code={state.code}
              height="95vh"
              message={state.message}
            />
          </Grid>
        )}

        {state.status === "loading" && (
          <Grid item xs={12}>
            <LoadingAnimation />
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default PageContent;
