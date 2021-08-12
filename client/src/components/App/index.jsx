import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Admin from "../../pages/Admin/index";
import { ErrorPage } from "../Error/index";
import Context from "../../context/index";
import Passenger from "../../pages/Passenger/index";
import OracleProvider from "../../pages/OracleProvider/index";
import InsuranceProvider from "../../pages/InsuranceProvider/index";
import ComponentState from "../../hoc/ComponentState";
import DAO from "../../pages/DAO/index";
import {
  fetchCurrentMembershipApplications,
  fetchDAOIndicators,
  fetchFlights,
  fetchInsuranceProvidersFlights,
  fetchFundsIndicators,
  fetchInsuranceProvidersProfits,
  fetchSettingsAmendmentProposal,
  fetchUserTransactions,
} from "../../actions";
import { useProvider } from "../../hooks";
// contracts abis
import FlightSuretyApp from "../../contracts/FlightSuretyApp.json";
import FlightSuretyShares from "../../contracts/FlightSuretyShares.json";
import FlightSuretyOracle from "../../contracts/FlightSuretyOracle.json";
import { web3Contract } from "../../web3";
import Profile from "../../pages/Profile/index";
import MembershipApplication from "../../pages/MembershipApplication/index";
import Registration from "../../pages/Registration/index";

const App = ({ state, setState }) => {
  const { provider, selectedAddress } = useProvider(setState);
  // contracts
  const [appContract, setAppContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [oracleContract, setOracleContract] = useState(null);
  // filters
  const [isFilterFlightToActive, setFilterFlightToActive] = useState(true);
  // modal
  const [modal, setModal] = useState({
    displayed: false,
    content: null,
  });
  // snackbar
  const [alert, setAlert] = useState({
    displayed: false,
    message: "",
    type: "",
  });
  // data refresh
  const [refreshCounter, setRefreshCounter] = useState(0);
  // data
  const [userTx, setUserTx] = useState(null);
  const [flights, setFLights] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [currentMembershipApplications, setCurrentMembershipApplications] =
    useState(null);
  const [settingsAmendmentProposal, setSettingsAmendmentProposal] =
    useState(null);
  const [insuranceProvidersProfits, setInsuranceProvidersProfits] =
    useState(null);
  const [fundsIndicators, setFundsIndicators] = useState(null);
  const [daoIndicators, setDAOIndicators] = useState(null);
  const [insuranceProvidersFlights, setInsuranceProvidersFlights] =
    useState(null);

  useEffect(() => {
    const initializeContracts = async (provider) => {
      const networkID = await provider.eth.net.getId();
      setAppContract(
        web3Contract(
          provider,
          FlightSuretyApp.networks[networkID].address,
          FlightSuretyApp.abi
        )
      );
      setOracleContract(
        web3Contract(
          provider,
          FlightSuretyOracle.networks[networkID].address,
          FlightSuretyOracle.abi
        )
      );
      setTokenContract(
        web3Contract(
          provider,
          FlightSuretyShares.networks[networkID].address,
          FlightSuretyShares.abi
        )
      );
    };

    if (provider) {
      try {
        initializeContracts(provider);
      } catch (error) {
        setState({ status: "error", code: 500 });
      }
    }
  }, [provider]);

  useEffect(() => {
    const fetchAndSetAppData = async (
      appContract,
      tokenContract,
      oracleContract
    ) => {
      const _userTx = await fetchUserTransactions(appContract, selectedAddress);
      const _flights = await fetchFlights(appContract);
      const _currentMembershipApplications =
        await fetchCurrentMembershipApplications(appContract);
      const _settingsAmendmentProposal = await fetchSettingsAmendmentProposal(
        appContract
      );
      const _insuranceProvidersProfits = await fetchInsuranceProvidersProfits(
        appContract,
        selectedAddress
      );
      const _fundsIndicator = await fetchFundsIndicators(
        tokenContract,
        appContract,
        selectedAddress
      );
      const _daoIndicators = await fetchDAOIndicators(
        tokenContract,
        appContract,
        selectedAddress
      );
      const _insuranceProvidersFlights = await fetchInsuranceProvidersFlights(
        appContract
      );
      setUserTx(_userTx);
      setFLights(_flights);
      setCurrentMembershipApplications(_currentMembershipApplications);
      setSettingsAmendmentProposal(_settingsAmendmentProposal);
      setInsuranceProvidersProfits(_insuranceProvidersProfits);
      setFundsIndicators(_fundsIndicator);
      setDAOIndicators(_daoIndicators);
      setInsuranceProvidersFlights(_insuranceProvidersFlights);
    };
    if (appContract && oracleContract && tokenContract) {
      try {
        fetchAndSetAppData(appContract, tokenContract, oracleContract);
      } catch (error) {
        setState({ status: "error", code: 500 });
      }
    }
  }, [appContract, oracleContract, tokenContract, refreshCounter]);

  return (
    <Context.Provider
      value={{
        // contracts
        appContract,
        tokenContract,
        oracleContract,
        // data refresh
        refreshCounter,
        setRefreshCounter,
        // current address
        selectedAddress,
        // filters
        isFilterFlightToActive,
        setFilterFlightToActive,
        // modal
        modal,
        setModal,
        // snackbar
        alert,
        setAlert,
        // data
        userTx,
        setUserTx,
        flights,
        setFLights,
        selectedFlight,
        setSelectedFlight,
        insuranceProvidersFlights,
        setInsuranceProvidersFlights,
        currentMembershipApplications,
        setCurrentMembershipApplications,
        settingsAmendmentProposal,
        setSettingsAmendmentProposal,
        insuranceProvidersProfits,
        setInsuranceProvidersProfits,
        fundsIndicators,
        setFundsIndicators,
        daoIndicators,
        setDAOIndicators,
      }}
    >
      <Router>
        <Switch>
          <Route exact path="/passenger">
            <ComponentState component={Passenger} />
          </Route>
          <Route exact path="/oracle-provider">
            <ComponentState component={OracleProvider} />
          </Route>
          <Route exact path="/insurance-provider">
            <ComponentState component={InsuranceProvider} />
          </Route>
          <Route exact path="/admin">
            <ComponentState component={Admin} />
          </Route>
          <Route exact path="/dao">
            <ComponentState component={DAO} />
          </Route>
          <Route exact path="/membership">
            <ComponentState component={MembershipApplication} />
          </Route>
          <Route exact path="/me">
            <ComponentState component={Profile} />
          </Route>
          <Route exact path="/register">
            <ComponentState component={Registration} />
          </Route>
          <Route path="*">
            <ErrorPage code={404} height="100vh" />
          </Route>
        </Switch>
      </Router>
    </Context.Provider>
  );
};

export default App;
