import React, { useContext, useEffect } from "react";
import { Container, Grid, Typography, Fab } from "@material-ui/core";
import Context from "../../../context/index";
import MultiIndicatorPanel from "../../../components/MultiIndicatorPanel/index";
import IndicatorPanel from "../../../components/IndicatorPanel/index";
import FlightRegistration from "../../../components/FlightRegistration";
import { ErrorPage } from "../../../components/Error";
import LoadingAnimation from "../../../components/LoadingAnimation/index";
import NoContent from "../../../components/icons/NoContent";
import PieChart from "../../../components/PieChart/index";
import { useHistory } from "react-router-dom";

const PageContent = ({ state, setState }) => {
  const {
    // modal
    setModal,
    // data
    fundsIndicators,
    daoIndicators,
    insuranceProvidersProfits,
    insuranceProvidersFlights,
    registration,
  } = useContext(Context);

  const history = useHistory();

  useEffect(() => {
    if (registration) {
      if (!registration.isOwner) {
        setState({
          status: "error",
          code: 403,
          message: "Your need admin rights to access this content",
        });
      } else {
        fundsIndicators &&
          insuranceProvidersProfits &&
          insuranceProvidersFlights &&
          daoIndicators &&
          setState({ status: "loaded", code: null });
      }
    }
  }, [registration, fundsIndicators]);

  const handleClick = () => {
    setModal({ displayed: true, content: FlightRegistration });
  };

  return (
    <Container>
      <Grid container spacing={4}>
        {state.status === "loaded" && (
          <>
            <Grid item xs={12} lg={6}>
              <Typography variant="h5" component="h1">
                Aministrator Dashboard
              </Typography>
            </Grid>

            <Grid item xs={12} lg={3}>
              <Fab
                variant="extended"
                color="primary"
                onClick={() => history.push("/register")}
              >
                REGISTER A NEW PROVIDER
              </Fab>
            </Grid>

            <Grid item xs={12} lg={3}>
              <Fab variant="extended" color="primary" onClick={handleClick}>
                REGISTER A NEW FLIGHT
              </Fab>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={4}>
                {fundsIndicators ? (
                  <>
                    <IndicatorPanel
                      label="token supply"
                      value={fundsIndicators.tokenSupply}
                    />

                    <MultiIndicatorPanel
                      label="registered flights"
                      values={[
                        {
                          value: fundsIndicators.totalRegisteredFlightsCount,
                          label: "total",
                        },
                        {
                          value: fundsIndicators.myRegisteredFlightsCount,
                          label: "me",
                        },
                      ]}
                    />
                    <MultiIndicatorPanel
                      label="registered insurance"
                      values={[
                        {
                          value: fundsIndicators.totalRegisteredInsuranceCount,
                          label: "total",
                        },
                        {
                          value: fundsIndicators.myRegisteredInsuranceCount,
                          label: "me",
                        },
                      ]}
                    />
                    <MultiIndicatorPanel
                      label="cumulated profits"
                      values={[
                        {
                          value: fundsIndicators.totalCumulatedProfits,
                          label: "total",
                        },
                        {
                          value: fundsIndicators.myCumulatedProfits,
                          label: "me",
                        },
                      ]}
                    />
                    <MultiIndicatorPanel
                      label="payout ratio"
                      values={[
                        {
                          value:
                            Math.round(
                              fundsIndicators.totalInsuranceDefaultRate * 100
                            ) / 100,
                          label: "total",
                        },
                        {
                          value:
                            Math.round(
                              fundsIndicators.myInsuranceDefaultRate * 100
                            ) / 100,
                          label: "me",
                        },
                      ]}
                    />
                  </>
                ) : (
                  <LoadingAnimation />
                )}

                {insuranceProvidersProfits && (
                  <PieChart
                    data={insuranceProvidersProfits}
                    label="Profits / Insurance provider"
                  />
                )}
                {insuranceProvidersFlights && (
                  <PieChart
                    data={insuranceProvidersFlights}
                    label="Flights count / Insurance provider"
                  />
                )}

                {daoIndicators ? (
                  <>
                    <IndicatorPanel
                      label="token supply"
                      value={daoIndicators.tokenSupply}
                    />
                    <IndicatorPanel
                      label="current membership fee"
                      value={daoIndicators.currentMembershipFee}
                    />
                    <IndicatorPanel
                      label="insurance coverage ratio"
                      value={daoIndicators.currentInsuranceCoverageRatio}
                    />
                    <IndicatorPanel
                      label="Proposal validity duration (block number)"
                      value={daoIndicators.proposalValidityDuration}
                    />
                    <IndicatorPanel
                      label="Minimum same answers before flight data update"
                      value={daoIndicators.acceptedAnswerTreshold}
                    />
                    <IndicatorPanel
                      label="Minimum holding duration before vote (block number)"
                      value={daoIndicators.tokenHoldingMinimumBlock}
                    />
                    <IndicatorPanel
                      label="Authorized flight delay (seconds)"
                      value={daoIndicators.authorizedFlightDelay}
                    />
                    <MultiIndicatorPanel
                      label="oracle providers"
                      values={[
                        {
                          value: daoIndicators.oracleRegisteredProvidersCount,
                          label: "registered",
                        },
                        {
                          value: daoIndicators.oracleActivatedProvidersCount,
                          label: "activated",
                        },
                      ]}
                    />
                    <MultiIndicatorPanel
                      label="insurance providers"
                      values={[
                        {
                          value:
                            daoIndicators.insuranceRegisteredProvidersCount,
                          label: "registered",
                        },
                        {
                          value: daoIndicators.insuranceActivatedProvidersCount,
                          label: "activated",
                        },
                      ]}
                    />
                    <MultiIndicatorPanel
                      label="settings amendment proposals"
                      values={[
                        {
                          value:
                            daoIndicators.feeSettingsAmendmentProposalCount,
                          label: "fee",
                        },
                        {
                          value:
                            daoIndicators.coverageSettingsAmendmentProposalCount,
                          label: "me",
                        },
                      ]}
                    />
                  </>
                ) : (
                  <LoadingAnimation />
                )}
              </Grid>
            </Grid>
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

        {state.status === "loading" && <LoadingAnimation />}

        {state.status === "nocontent" && (
          <Grid item xs={12}>
            <NoContent fontSize="6rem" message="Nothing just yet ..." />
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default PageContent;
