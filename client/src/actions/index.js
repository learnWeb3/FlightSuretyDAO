import { getPastEvents } from "../web3/index.js";
import {
  fetchRegisteredInsuranceProviders,
  fetchActivatedInsuranceProviders,
  fetchRegisteredOracleProviders,
  fetchActivatedOracleProviders,
  fetchInsurances,
  fetchProfits,
  fetchDefaultRates,
} from "./helpers.js";

/**======================================================================================================================================== */
// READ FROM THE BLOCKCHAIN
/**======================================================================================================================================== */

// fetch all flights created to insure a new passengers (new insurance pick up index page)
const fetchFlights = async (appContract) => {
  return await getPastEvents(appContract, "NewFlight");
};

// fetch a specific flight to insure a new passenger (new insurance confirmation)
const fetchFlight = async (appContract, flightID) => {
  return await getPastEvents(appContract, "NewFlight", { flightID });
};

// fetch current roles registered but not activated (DAO specific page per role)
const fetchCurrentMembershipApplications = async (appContract) => {
  const registeredOracleProviders = await fetchRegisteredOracleProviders(
    appContract
  );
  const registeredInsuranceProviders = await fetchRegisteredInsuranceProviders(
    appContract
  );
  const activatedOracleProviders = await fetchActivatedOracleProviders(
    appContract
  );
  const activatedInsuranceProviders = await fetchActivatedInsuranceProviders(
    appContract
  );

  const insuranceProviderApplications = registeredInsuranceProviders.filter(
    (registeredProvider) =>
      !activatedInsuranceProviders.find(
        (activatedProvider) =>
          activatedProvider.insuranceProvider ===
          registeredProvider.insuranceProvider
      )
  );

  const oracleProvidersApplications = registeredOracleProviders.filter(
    (registeredProvider) =>
      !activatedOracleProviders.find(
        (activatedProvider) =>
          activatedProvider.oracleProvider === registeredProvider.oracleProvider
      )
  );
  return {
    oracleProvidersApplications,
    insuranceProviderApplications,
  };
};

// fetch all settings amendment proposals (DAO specific page per setting)
const fetchSettingsAmendmentProposal = async (appContract) => {
  const membershipFeeAmendmentProposals = await getPastEvents(
    appContract,
    "NewMembershipFeeAmendmentProposal"
  );
  const insuranceCoverageAmendmentProposals = await getPastEvents(
    appContract,
    "NewInsuranceCoverageAmendmentProposal"
  );
  return {
    membershipFeeAmendmentProposals,
    insuranceCoverageAmendmentProposals,
  };
};

// CALCULATE RATIO, COUNTS, INDICATORS DASHBOARD RELATED FUNCTIONS

// fetch profits per insurance providers (Dashboard insurance provider)
const fetchInsuranceProvidersProfits = async (
  appContract,
  insuranceProviderAddress
) => {
  const insuranceProvidersAddresses = await fetchActivatedInsuranceProviders(
    appContract
  ).then((providers) =>
    providers.length > 0 ? providers.insuranceProvider : []
  );
  if (insuranceProvidersAddresses.length > 0) {
    return await Promise.all(
      insuranceProvidersAddresses.map(
        async (insuranceProviderAddress) =>
          await fetchProfits(appContract, insuranceProviderAddress).then(
            (profitsData) =>
              profitsData.map(
                ({ totalCummulatedProfits, myCumulatedProfits }) => ({
                  insuranceProviderAddress,
                  myCumulatedProfits,
                })
              )
          )
      )
    );
  } else {
    return [];
  }
};
// fetch funds (insurance and flight related) indcators (Dashboard insurance provider)
const fetchFundsIndicators = async (
  tokenContract,
  appContract,
  insuranceProvider
) => {
  // token related metrics
  const tokenSupply = await tokenContract.methods
    .totalSupply()
    .call({ from: insuranceProvider });
  const daysBeforeTokenRedeem = 365;
  // flights metrics
  const totalRegisteredFlightsCount = await fetchFlights(appContract).then(
    (flights) => flights.length
  );
  const myRegisteredFlightsCount = await getPastEvents(
    appContract,
    "NewFlight",
    { insuranceProvider }
  ).then((flights) => flights.length);
  // insurances metrics
  const totalRegisteredInsuranceCount = await fetchInsurances(appContract).then(
    (insurances) => insurances.length
  );
  const myRegisteredInsuranceCount = await getPastEvents(
    appContract,
    "NewInsurance",
    { insuranceProvider }
  ).then((flights) => flights.length);

  const { totalCummulatedProfits, myCumulatedProfits } = await fetchProfits(
    appContract,
    insuranceProvider
  );
  const { totalInsuranceDefaultRate, myInsuranceDefaultRate } =
    await fetchDefaultRates(
      appContract,
      insuranceProvider,
      totalRegisteredInsuranceCount,
      myRegisteredInsuranceCount
    );
  return {
    tokenSupply,
    daysBeforeTokenRedeem,
    totalRegisteredFlightsCount,
    totalRegisteredInsuranceCount,
    myRegisteredFlightsCount,
    myRegisteredInsuranceCount,
    totalCummulatedProfits,
    myCumulatedProfits,
    totalInsuranceDefaultRate,
    myInsuranceDefaultRate,
  };
};
// fetch DAO (votes related) indicators (DAO Dashboard)
const fetchDAOIndicators = async (
  tokenContract,
  appContract,
  currentAddress
) => {
  // token related metrics
  const tokenSupply = await tokenContract.methods
    .totalSupply()
    .call({ from: currentAddress });
  const daysBeforeTokenRedeem = 365;
  // settings metrics
  const currentMembershipFee = await appContract.methods
    .currentMembershipFee()
    .call({ from: currentAddress })
    .then((fee) => appContract.utils.fromWei(fee, "ether"));
  const currentInsuranceCoverageRatio = await appContract.methods
    .currentInsuranceCoverageRatio()
    .call({ from: currentAddress })
    .then((ratio) => ratio / 100);
  // roles metrics
  const oracleRegisteredProvidersCount = await fetchRegisteredOracleProviders(
    appContract
  ).then((providers) => providers.length);
  const insuranceRegisteredProvidersCount =
    await fetchRegisteredInsuranceProviders(appContract).then(
      (providers) => providers.length
    );
  const oracleActivatedProvidersCount = await fetchActivatedOracleProviders(
    appContract
  ).then((providers) => providers.length);
  const insuranceActivatedProvidersCount =
    await fetchActivatedInsuranceProviders(appContract).then(
      (providers) => providers.length
    );
  // settings amendments proposal metrics
  const {
    membershipFeeAmendmentProposals,
    insuranceCoverageAmendmentProposals,
  } = await fetchSettingsAmendmentProposal(appContract);
  const feeSettingsAmendmentProposalCount =
    membershipFeeAmendmentProposals.length;
  const coverageSettingsAmendmentProposalCount =
    insuranceCoverageAmendmentProposals.length;
  return {
    tokenSupply,
    daysBeforeTokenRedeem,
    currentMembershipFee,
    currentInsuranceCoverageRatio,
    oracleRegisteredProvidersCount,
    insuranceRegisteredProvidersCount,
    oracleActivatedProvidersCount,
    insuranceActivatedProvidersCount,
    feeSettingsAmendmentProposalCount,
    coverageSettingsAmendmentProposalCount,
  };
};

// get all user transactions
const fetchUserTransactions = async (appContract, selectedAddress) => {
  const mappingEventNameToIndexedKey = {
    RegisteredInsuranceProvider: "insuranceProvider",
    RegisteredOracleProvider: "oracleProvider",
    NewVoteInsuranceProvider: "voter",
    NewVoteOracleProvider: "voter",
    NewMembershipFeeAmendmentProposal: "caller",
    NewVoteMembershipFeeAmendmentProposal: "voter",
    NewInsuranceCoverageAmendmentProposal: "caller",
    NewVoteInsuranceCoverageAmendmentProposal: "voter",
    NewFlight: "insuranceProvider",
    NewInsurance: "passenger",
    NewPayout: "owner",
    AuthorizedCaller: "contractOwner",
    UnauthorizedCaller: "contractOwner",
  };

  const userTx = [];

  await Promise.all(
    Object.keys(mappingEventNameToIndexedKey).map(
      async (eventName) =>
        await appContract
          .getPastEvents(eventName, {
            fromBlock: 0,
            filter: {
              [mappingEventNameToIndexedKey[eventName]]: selectedAddress,
            },
          })
          .then(async (events) =>
            events.length > 0
              ? await Promise.all(
                  events.map(async (event) => {
                    const tx = event.transactionHash;
                    const blockNumber = event.blockNumber;
                    const timestamp = await appContract.eth.getBlock(
                      blockNumber
                    );
                    const eventName = event.event;
                    return {
                      tx,
                      blockNumber,
                      timestamp,
                      eventName,
                    };
                  })
                )
              : events
          )
          .then((userTxSets) =>
            userTxSets.map(
              (set) => set.length > 0 && set.map((tx) => userTx.push(tx))
            )
          )
    )
  );

  return userTx;
};

/**======================================================================================================================================== */
// WRITE TO THE BLOCKCHAIN
/**======================================================================================================================================== */

/* providers registrations */

// insurance providers

const registerInsuranceProvider = async (appContract, currentAddress) => {
  return await appContract.methods
    .registerInsuranceProvider()
    .send({ from: currentAddress });
};

// oracle providers

const registerOracleProvider = async (appContract, currentAddress) => {
  return await appContract.methods
    .registerOracleProvider()
    .send({ from: currentAddress });
};

/* votes providers */

// insurance providers

const voteInsuranceProviderMembership = async (
  appContract,
  currentAddress,
  votee
) => {
  return await appContract.methods
    .voteInsuranceProviderMembership(votee)
    .send({ from: currentAddress });
};

// oracle providers

const voteOracleProviderMembership = async (
  appContract,
  currentAddress,
  votee
) => {
  return await appContract.methods
    .voteOracleProviderMembership(votee)
    .send({ from: currentAddress });
};
/* flights management */

const registerFlight = async (
  appContract,
  currentAddress,
  { flightRef, estimatedDeparture, estimatedArrival, rate }
) => {
  return await appContract.methods
    .registerFlight(flightRef, estimatedDeparture, estimatedArrival, rate)
    .send({ from: currentAddress });
};

/* insurances management */

const registerInsurance = async (appContract, currentAddress, flightID) => {
  return await appContract.methods
    .registerInsurance(flightID)
    .send({ from: currentAddress });
};

/* Settings amendment proposals*/

const registerMembershipFeeAmendmentProposal = async (
  appContract,
  currentAddress,
  proposedValue
) => {
  return await appContract.methods
    .registerMembershipFeeAmendmentProposal(proposedValue)
    .send({ from: currentAddress });
};

const voteMembershipFeeAmendmentProposal = async (
  appContract,
  currentAddress,
  proposalID
) => {
  return await appContract.methods
    .voteMembershipFeeAmendmentProposal(proposalID)
    .send({ from: currentAddress });
};

// insurance coverage amendment proposal

const registerInsuranceCoverageAmendmentProposal = async (
  appContract,
  currentAddress,
  proposedValue
) => {
  return await appContract.methods
    .registerInsuranceCoverageAmendmentProposal(proposedValue)
    .send({ from: currentAddress });
};

const voteInsuranceCoverageAmendmentProposal = async (
  appContract,
  currentAddress,
  proposalID
) => {
  return await appContract.methods
    .voteInsuranceCoverageAmendmentProposal(proposalID)
    .send({ from: currentAddress });
};

export {
  // READ FROM THE BLOCKCHAIN
  fetchFlights,
  fetchFlight,
  fetchCurrentMembershipApplications,
  fetchSettingsAmendmentProposal,
  fetchInsuranceProvidersProfits,
  fetchFundsIndicators,
  fetchDAOIndicators,
  fetchUserTransactions,
  // WRITE TO THE BLOCKCHAIN
  registerInsuranceProvider,
  registerOracleProvider,
  voteInsuranceProviderMembership,
  voteOracleProviderMembership,
  registerFlight,
  registerInsurance,
  registerMembershipFeeAmendmentProposal,
  voteMembershipFeeAmendmentProposal,
  registerInsuranceCoverageAmendmentProposal,
  voteInsuranceCoverageAmendmentProposal,
};
