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

// fetch current membership fee
const fetchCurrentMembershipFee = async (appContract, selectedAddress) =>
  await appContract.methods
    .currentMembershipFee()
    .call({ from: selectedAddress });

// fetch all flights created to insure a new passengers (new insurance pick up index page)
const fetchFlights = async (appContract) => {
  return await getPastEvents(appContract, "NewFlight");
};

// fetch a specific flight to insure a new passenger (new insurance confirmation)
const fetchFlight = async (appContract, flightID) => {
  return await getPastEvents(appContract, "NewFlight", { flightID });
};

const fetchInsuranceProviderFlights = async (
  appContract,
  insuranceProvider
) => {
  return await getPastEvents(appContract, "NewFlight", { insuranceProvider });
};

// fetch current roles registered but not activated (DAO specific page per role)
const fetchCurrentMembershipApplications = async (appContract) => {
  const registeredOracleProviders = await fetchRegisteredOracleProviders(
    appContract
  ).then(async (providers) => {
    const accounts = await Promise.all(
      providers.map(async (provider) => ({
        ...provider,
        timestamp: await appContract.eth
          .getBlock(provider.blockNumber)
          .then(({ timestamp }) => timestamp),
      }))
    );
    return accounts;
  });
  const registeredInsuranceProviders = await fetchRegisteredInsuranceProviders(
    appContract
  ).then(async (providers) => {
    const accounts = await Promise.all(
      providers.map(async (provider) => ({
        ...provider,
        timestamp: await appContract.eth
          .getBlock(provider.blockNumber)
          .then(({ timestamp }) => timestamp),
      }))
    );
    return accounts;
  });

  const activatedOracleProviders = await fetchActivatedOracleProviders(
    appContract
  ).then(async (providers) => {
    const accounts = await Promise.all(
      providers.map(async (provider) => ({
        ...provider,
        timestamp: await appContract.eth
          .getBlock(provider.blockNumber)
          .then(({ timestamp }) => timestamp),
      }))
    );
    return accounts;
  });
  const activatedInsuranceProviders = await fetchActivatedInsuranceProviders(
    appContract
  ).then(async (providers) => {
    const accounts = await Promise.all(
      providers.map(async (provider) => ({
        ...provider,
        timestamp: await appContract.eth
          .getBlock(provider.blockNumber)
          .then(({ timestamp }) => timestamp),
      }))
    );
    return accounts;
  });

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

const fetchSettingsAmendmentProposal = async (appContract) => {
  const membershipFeeAmendmentProposals = await getPastEvents(
    appContract,
    "NewMembershipFeeAmendmentProposal"
  ).then(
    async (proposals) =>
      await Promise.all(
        proposals.map(async (proposal) => ({
          ...proposal,
          id: proposal.transactionHash,
          timestamp: await appContract.eth
            .getBlock(proposal.blockNumber)
            .then(({ timestamp }) => timestamp),
          currentVotes: await getPastEvents(
            appContract,
            "NewVoteMembershipFeeAmendmentProposal",
            { proposalID: parseInt(proposal.proposalID) }
          ).then((votes) => votes.length),
          requiredVotes: null,
        }))
      )
  );
  const insuranceCoverageAmendmentProposals = await getPastEvents(
    appContract,
    "NewInsuranceCoverageAmendmentProposal"
  ).then(
    async (proposals) =>
      await Promise.all(
        proposals.map(async (proposal) => ({
          ...proposal,
          id: proposal.transactionHash,
          timestamp: await appContract.eth
            .getBlock(proposal.blockNumber)
            .then(({ timestamp }) => timestamp),
          currentVotes: await getPastEvents(
            appContract,
            "NewVoteInsuranceCoverageAmendmentProposal",
            { proposalID: parseInt(proposal.proposalID) }
          ).then((votes) => votes.length),
          requiredVotes: null,
        }))
      )
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
    providers.length > 0
      ? providers.map((provider) => provider.insuranceProvider)
      : []
  );
  if (insuranceProvidersAddresses.length > 0) {
    return await Promise.all(
      insuranceProvidersAddresses.map(
        async (insuranceProviderAddress) =>
          await fetchProfits(appContract, insuranceProviderAddress).then(
            ({ totalCummulatedProfits, myCumulatedProfits }) => ({
              id: insuranceProviderAddress,
              label: insuranceProviderAddress,
              value: parseInt(myCumulatedProfits),
            })
          )
      )
    );
  } else {
    return [];
  }
};

// fetch flights number per insurance providers
const fetchInsuranceProvidersFlights = async (appContract) => {
  const insuranceProvidersAddresses = await fetchActivatedInsuranceProviders(
    appContract
  ).then((providers) =>
    providers.length > 0
      ? providers.map((provider) => provider.insuranceProvider)
      : []
  );
  if (insuranceProvidersAddresses.length > 0) {
    return await Promise.all(
      insuranceProvidersAddresses.map(
        async (insuranceProviderAddress) =>
          await fetchInsuranceProviderFlights(
            appContract,
            insuranceProviderAddress
          ).then((flights) => ({
            value: flights.length,
            id: insuranceProviderAddress,
            label: insuranceProviderAddress,
          }))
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

  const { totalCumulatedProfits, myCumulatedProfits } = await fetchProfits(
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
    totalCumulatedProfits,
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

  const userTxSets = await Promise.all(
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
                    const { timestamp } = await appContract.eth.getBlock(
                      blockNumber
                    );
                    const type = event.type;
                    const eventName = event.event;
                    return {
                      id: tx,
                      tx,
                      blockNumber,
                      timestamp,
                      eventName,
                      type,
                    };
                  })
                )
              : events
          )
          .then((userTx) => userTx)
    )
  );

  userTxSets.map((set) => set.length > 0 && set.map((tx) => userTx.push(tx)));

  return userTx.length > 1
    ? userTx.sort((a, b) => b.timestamp - a.timestamp)
    : userTx;
};

/**======================================================================================================================================== */
// WRITE TO THE BLOCKCHAIN
/**======================================================================================================================================== */

/* providers registrations */

// insurance providers

const registerInsuranceProvider = async (
  appContract,
  currentAddress,
  value,
  gas = 150000
) => {
  return await appContract.methods
    .registerInsuranceProvider()
    .send({ from: currentAddress, value, gas });
};

// oracle providers

const registerOracleProvider = async (
  appContract,
  currentAddress,
  value,
  gas = 500000
) => {
  return await appContract.methods
    .registerOracleProvider()
    .send({ from: currentAddress, value, gas });
};

/* votes providers */

// insurance providers

const voteInsuranceProviderMembership = async (
  appContract,
  currentAddress,
  votee,
  gas = 150000
) => {
  return await appContract.methods
    .voteInsuranceProviderMembership(votee)
    .send({ from: currentAddress, gas });
};

// oracle providers

const voteOracleProviderMembership = async (
  appContract,
  currentAddress,
  votee,
  gas = 150000
) => {
  return await appContract.methods
    .voteOracleProviderMembership(votee)
    .send({ from: currentAddress, gas });
};
/* flights management */

const registerFlight = async (
  appContract,
  currentAddress,
  { flightRef, estimatedDeparture, estimatedArrival, rate },
  gas = 150000
) => {
  return await appContract.methods
    .registerFlight(flightRef, estimatedDeparture, estimatedArrival, rate)
    .send({ from: currentAddress, gas });
};

/* insurances management */

const registerInsurance = async (
  appContract,
  currentAddress,
  flightID,
  value,
  gas = 500000
) => {
  return await appContract.methods
    .registerInsurance(flightID)
    .send({ from: currentAddress, value, gas });
};

/* Settings amendment proposals*/

const registerMembershipFeeAmendmentProposal = async (
  appContract,
  currentAddress,
  proposedValue,
  gas = 150000
) => {
  return await appContract.methods
    .registerMembershipFeeAmendmentProposal(proposedValue)
    .send({ from: currentAddress, gas });
};

const voteMembershipFeeAmendmentProposal = async (
  appContract,
  currentAddress,
  proposalID,
  gas = 150000
) => {
  return await appContract.methods
    .voteMembershipFeeAmendmentProposal(proposalID)
    .send({ from: currentAddress, gas });
};

// insurance coverage amendment proposal

const registerInsuranceCoverageAmendmentProposal = async (
  appContract,
  currentAddress,
  proposedValue,
  gas = 150000
) => {
  return await appContract.methods
    .registerInsuranceCoverageAmendmentProposal(proposedValue)
    .send({ from: currentAddress, gas });
};

const voteInsuranceCoverageAmendmentProposal = async (
  appContract,
  currentAddress,
  proposalID,
  gas = 150000
) => {
  return await appContract.methods
    .voteInsuranceCoverageAmendmentProposal(proposalID)
    .send({ from: currentAddress, gas });
};

export {
  // READ FROM THE BLOCKCHAIN
  fetchCurrentMembershipFee,
  fetchFlights,
  fetchFlight,
  fetchInsuranceProviderFlights,
  fetchInsuranceProvidersFlights,
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
