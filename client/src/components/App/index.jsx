import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
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
  checkRegistration,
  fetchUserInsurancesContracts,
  fetchOracleRequestForFlightSettlementData,
  fetchOracleIndexes,
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
import VotingProposals from "../../pages/VotingProposals/index";

const App = ({ state, setState }) => {
  const { provider, selectedAddress } = useProvider(setState);
  /** contracts **/
  const [contracts, setContracts] = useState(null);
  /** data refresh */
  const [refreshCounter, setRefreshCounter] = useState(0);
  /** data **/
  // current user related data
  const [userTx, setUserTx] = useState(null);
  const [userInsuranceContracts, setUserInsuranceContracts] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [oracleIndexes, setOracleIndexes] = useState();
  // registered flights
  const [flights, setFLights] = useState(null);
  // current registered yet not activated members
  const [currentMembershipApplications, setCurrentMembershipApplications] =
    useState(null);
  // insurance related data
  const [insuranceProvidersProfits, setInsuranceProvidersProfits] =
    useState(null);
  const [insuranceProvidersFlights, setInsuranceProvidersFlights] =
    useState(null);
  // oracle dashboard related data
  const [
    oracleflightsRequestsforSettlementData,
    setOracleFlightsRequestsforSettlementData,
  ] = useState(null);
  // community dashboard (token) indicators
  const [fundsIndicators, setFundsIndicators] = useState(null);
  const [daoIndicators, setDAOIndicators] = useState(null);
  // settings amendment proposals
  const [settingsAmendmentProposal, setSettingsAmendmentProposal] =
    useState(null);
  // currently selected data for modal displau
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedInsurance, setSelectedInsurance] = useState(null);

  /** filters **/
  const [isFilterFlightToActive, setFilterFlightToActive] = useState(true);

  /** menu left **/
  const [menuLeftIsOpen, setMenuLeftIsOpen] = useState(false);

  /** modal **/
  const [modal, setModal] = useState({
    displayed: false,
    content: null,
  });

  /** snackbar **/
  const [alert, setAlert] = useState({
    displayed: false,
    message: "",
    type: "",
  });

  useEffect(() => {
    const initWSSEvents = (appContract, oracleContract) => {
      appContract.events
        .allEvents({}, () => {})
        .on("connected", () =>
          console.log("listening for FlightSuretyApp contract events...")
        )
        .on("data", () => setRefreshCounter(refreshCounter + 1))
        .on("error", () => initWSSEvents());
      oracleContract.events
        .allEvents({}, () => {})
        .on("connected", () =>
          console.log("listening for FlightSuretyOracle contract events...")
        )
        .on("data", () => setRefreshCounter(refreshCounter + 1))
        .on("error", () => initWSSEvents());
    };
    const initializeContracts = async (provider) => {
      const networkID = await provider.eth.net.getId();
      const _appContract = web3Contract(
        provider,
        FlightSuretyApp.networks[networkID].address,
        FlightSuretyApp.abi
      );
      const _oracleContract = web3Contract(
        provider,
        FlightSuretyOracle.networks[networkID].address,
        FlightSuretyOracle.abi
      );
      const _tokenContract = web3Contract(
        provider,
        FlightSuretyShares.networks[networkID].address,
        FlightSuretyShares.abi
      );
      setContracts({
        appContract: _appContract,
        oracleContract: _oracleContract,
        tokenContract: _tokenContract,
      });

      initWSSEvents(_appContract, _oracleContract);
    };

    if (provider && selectedAddress) {
      try {
        initializeContracts(provider);
      } catch (error) {
        setState({ status: "error", code: 500 });
      }
    }
  }, [provider, selectedAddress]);

  useEffect(() => {
    const fetchAndSetAppData = async (
      appContract,
      oracleContract,
      tokenContract
    ) => {
      const _userTx = await fetchUserTransactions(
        appContract,
        oracleContract,
        selectedAddress
      );
      const _userInsuranceContracts = await fetchUserInsurancesContracts(
        appContract,
        oracleContract,
        selectedAddress
      );
      const _flights = await fetchFlights(appContract);
      const _oracleflightsRequestsforSettlementData =
        await fetchOracleRequestForFlightSettlementData(oracleContract);
      const _currentMembershipApplications =
        await fetchCurrentMembershipApplications(
          appContract,
          tokenContract,
          selectedAddress
        );
      const _settingsAmendmentProposal = await fetchSettingsAmendmentProposal(
        appContract,
        tokenContract,
        selectedAddress
      );
      const {
        isRegisteredInsuranceProvider,
        isRegisteredOracleProvider,
        isActivatedInsuranceProvider,
        isActivatedOracleProvider,
        isFundedInsuranceProvider,
        isTokenHolder,
        isOwner,
        isTokenHolderOldEnough,
      } = await checkRegistration(appContract, tokenContract, selectedAddress);
      const _oracleIndexes = isActivatedOracleProvider
        ? await fetchOracleIndexes(appContract, selectedAddress)
        : null;
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
        oracleContract,
        selectedAddress,
        selectedAddress
      );
      const _insuranceProvidersFlights = await fetchInsuranceProvidersFlights(
        appContract
      );
      setUserTx(_userTx);
      setUserInsuranceContracts(_userInsuranceContracts);
      setFLights(_flights);
      setOracleFlightsRequestsforSettlementData(
        _oracleflightsRequestsforSettlementData
      );
      setCurrentMembershipApplications(_currentMembershipApplications);
      setRegistration({
        isRegisteredInsuranceProvider,
        isRegisteredOracleProvider,
        isActivatedInsuranceProvider,
        isActivatedOracleProvider,
        isFundedInsuranceProvider,
        isTokenHolder,
        isOwner,
        isTokenHolderOldEnough,
      });
      setOracleIndexes(_oracleIndexes);
      setSettingsAmendmentProposal(_settingsAmendmentProposal);
      setInsuranceProvidersProfits(_insuranceProvidersProfits);
      setFundsIndicators(_fundsIndicator);
      setDAOIndicators(_daoIndicators);
      setInsuranceProvidersFlights(_insuranceProvidersFlights);
    };
    if (contracts) {
      try {
        fetchAndSetAppData(
          contracts.appContract,
          contracts.oracleContract,
          contracts.tokenContract
        );
      } catch (error) {
        setState({ status: "error", code: 500 });
      }
    }
  }, [contracts, refreshCounter]);

  return (
    <Context.Provider
      value={{
        // contracts
        ...contracts,
        // data refresh
        refreshCounter,
        setRefreshCounter,
        // current address
        selectedAddress,
        // filters
        isFilterFlightToActive,
        setFilterFlightToActive,
        //menu left
        menuLeftIsOpen,
        setMenuLeftIsOpen,
        // modal
        modal,
        setModal,
        // snackbar
        alert,
        setAlert,
        // data
        userTx,
        userInsuranceContracts,
        setUserTx,
        flights,
        setFLights,
        oracleflightsRequestsforSettlementData,
        setOracleFlightsRequestsforSettlementData,
        oracleIndexes,
        setOracleIndexes,
        selectedFlight,
        setSelectedFlight,
        selectedInsurance,
        setSelectedInsurance,
        insuranceProvidersFlights,
        setInsuranceProvidersFlights,
        currentMembershipApplications,
        registration,
        setRegistration,
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
          <Route exact path="/proposals">
            <ComponentState component={VotingProposals} />
          </Route>
          <Route exact path="/me">
            <ComponentState component={Profile} />
          </Route>
          <Route exact path="/register">
            <ComponentState component={Registration} />
          </Route>
          <Route path="/">
            {registration?.isOwner && <Redirect to="/admin" />}
            {registration?.isActivatedInsuranceProvider &&
              !registration?.isOwner && <Redirect to="/insurance-provider" />}
            {registration?.isActivatedOracleProvider &&
              !registration?.isOwner && <Redirect to="/oracle-provider" />}
            {(registration?.isRegisteredInsuranceProvider &&
              !registration?.isFundedInsuranceProvider) ||
              (!registration?.isActivatedInsuranceProvider &&
                !registration?.isActivatedOracleProvider && (
                  <Redirect to="/register" />
                ))}
          </Route>
          <Route path="*">
            <ErrorPage code={404} height="95vh" />
          </Route>
        </Switch>
      </Router>
    </Context.Provider>
  );
};

export default App;
