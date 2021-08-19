import { getPastEvents } from "../web3/index.js";
import {
  fetchRegisteredInsuranceProviders,
  fetchActivatedInsuranceProviders,
  fetchRegisteredOracleProviders,
  fetchActivatedOracleProviders,
  fetchInsurances,
  fetchProfits,
  fetchDefaultRates,
  fetchUserInsurances,
  fetchUserClaims,
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
  return await getPastEvents(appContract, "NewFlight").then(async (flights) => {
    return await Promise.all(
      flights.map(async (flight) => ({
        ...flight,
        ...(await appContract.methods
          .getFlightSettlementData(flight.flightID)
          .call()),
      }))
    );
  });
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
const fetchCurrentMembershipApplications = async (
  appContract,
  tokenContract,
  selectedAddress
) => {
  const registeredOracleProviders = await fetchRegisteredOracleProviders(
    appContract
  ).then(async (providers) => {
    const accounts = await Promise.all(
      providers.map(async (provider) => ({
        ...provider,
        timestamp: await appContract.eth
          .getBlock(provider.blockNumber)
          .then(({ timestamp }) => timestamp),
        currentVotes: await getPastEvents(
          appContract,
          "NewVoteOracleProvider",
          { votee: provider.oracleProvider }
        ).then((votes) => votes.length),
        requiredVotes: await tokenContract.methods
          .totalSupply()
          .call({ from: selectedAddress })
          .then((totalSupply) => totalSupply / 2),
        id: provider.oracleProvider,
        address: provider.oracleProvider,
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
        currentVotes: await getPastEvents(
          appContract,
          "NewVoteInsuranceProvider",
          { votee: provider.insuranceProvider }
        ).then((votes) => votes.length),
        requiredVotes: await tokenContract.methods
          .totalSupply()
          .call({ from: selectedAddress })
          .then((totalSupply) => totalSupply / 2),
        id: provider.insuranceProvider,
        address: provider.insuranceProvider,
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

const checkRegistration = async (
  appContract,
  tokenContract,
  selectedAddress
) => {
  const registeredInsuranceProviders = await fetchRegisteredInsuranceProviders(
    appContract
  );
  const registeredOracleProviders = await fetchRegisteredOracleProviders(
    appContract
  );
  const activatedInsuranceProviders = await fetchActivatedInsuranceProviders(
    appContract
  );
  const activatedOracleProviders = await fetchActivatedOracleProviders(
    appContract
  );
  const fundedInsuranceProviders = await getPastEvents(
    appContract,
    "FundedInsuranceProvider",
    { insuranceProvider: selectedAddress }
  );
  const tokenBalance = await tokenContract.methods
    .balanceOf(selectedAddress)
    .call({ from: selectedAddress });
  const isTokenHolderOldEnough = await tokenContract.methods
    .ownershipBlockNum(selectedAddress)
    .call({ from: selectedAddress })
    .then(async (blockNum) => {
      const blockRequirement = await appContract.methods
        .tokenHolderMinBlockRequirement()
        .call({ from: selectedAddress });
      const currentBlockNum = await tokenContract.eth.getBlockNumber();
      return currentBlockNum - blockNum > blockRequirement;
    });
  const isOwner = await appContract.methods
    .isOwner()
    .call({ from: selectedAddress });
  return {
    isRegisteredInsuranceProvider: registeredInsuranceProviders.find(
      (provider) =>
        provider.insuranceProvider.toLowerCase() ===
        selectedAddress.toLowerCase()
    )
      ? true
      : false,
    isRegisteredOracleProvider: registeredOracleProviders.find(
      (provider) =>
        provider.oracleProvider.toLowerCase() === selectedAddress.toLowerCase()
    )
      ? true
      : false,
    isFundedInsuranceProvider: fundedInsuranceProviders.length > 0,
    isActivatedInsuranceProvider: activatedInsuranceProviders.find(
      (provider) =>
        provider.insuranceProvider.toLowerCase() ===
        selectedAddress.toLowerCase()
    )
      ? true
      : false,
    isActivatedOracleProvider: activatedOracleProviders.find(
      (provider) =>
        provider.oracleProvider.toLowerCase() === selectedAddress.toLowerCase()
    )
      ? true
      : false,
    isTokenHolder: tokenBalance > 0,
    isOwner,
    isTokenHolderOldEnough,
  };
};

const fetchSettingsAmendmentProposal = async (
  appContract,
  tokenContract,
  selectedAddress
) => {
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
          requiredVotes: await tokenContract.methods
            .totalSupply()
            .call({ from: selectedAddress })
            .then((totalSupply) => totalSupply / 2),
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
      insuranceProvidersAddresses.map(async (insuranceProviderAddress) => {
        const { totalCumulatedProfits, myCumulatedProfits } =
          await fetchProfits(appContract, insuranceProviderAddress);
        return {
          id: insuranceProviderAddress,
          label:
            insuranceProviderAddress.slice(0, 3) +
            "..." +
            insuranceProviderAddress.slice(-3, -1),
          value: parseInt(myCumulatedProfits),
        };
      })
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
            label:
              insuranceProviderAddress.slice(0, 3) +
              "..." +
              insuranceProviderAddress.slice(-3, -1),
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
  oracleContract,
  selectedAddress
) => {
  // token related metrics
  const tokenSupply = await tokenContract.methods
    .totalSupply()
    .call({ from: selectedAddress });
  // settings metrics
  const currentMembershipFee = await appContract.methods
    .currentMembershipFee()
    .call({ from: selectedAddress })
    .then((fee) => appContract.utils.fromWei(fee, "ether"));
  const currentInsuranceCoverageRatio = await appContract.methods
    .currentInsuranceCoverageRatio()
    .call({ from: selectedAddress })
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
  } = await fetchSettingsAmendmentProposal(
    appContract,
    tokenContract,
    selectedAddress
  );
  const feeSettingsAmendmentProposalCount =
    membershipFeeAmendmentProposals.length;
  const coverageSettingsAmendmentProposalCount =
    insuranceCoverageAmendmentProposals.length;

  // current constant values
  // miniumum block number token holding to participate
  const tokenHoldingMinimumBlock = await appContract.methods
    .tokenHolderMinBlockRequirement()
    .call({ from: selectedAddress });
  // proposal validity block duration
  const proposalValidityDuration = await appContract.methods
    .proposalValidBlockNum()
    .call({ from: selectedAddress });
  // accepted answer consensus ratio
  const acceptedAnswerTreshold = await oracleContract.methods
    .getActivatedOracleProvidersCount()
    .call({ from: selectedAddress })
    .then((activatedOracleProviderCount) =>
      Math.ceil(activatedOracleProviderCount / 2)
    );
  // authorized flight delay
  const authorizedFlightDelay = await oracleContract.methods
    .authorizedFlightDelay()
    .call({ from: selectedAddress });

  // block number before token redeem if user has token
  const blockNumberBeforeTokenRedeem = await tokenContract.methods
    .blockNumBeforeRedeem(selectedAddress)
    .call({ from: selectedAddress })
    .then(async (blockNum) => {
      const currentBlockNum = await tokenContract.eth
        .getBlock()
        .then((block) => block.number);
      return parseInt(blockNum) - parseInt(currentBlockNum);
    });
  return {
    tokenSupply,
    currentMembershipFee,
    currentInsuranceCoverageRatio,
    oracleRegisteredProvidersCount,
    insuranceRegisteredProvidersCount,
    oracleActivatedProvidersCount,
    insuranceActivatedProvidersCount,
    feeSettingsAmendmentProposalCount,
    coverageSettingsAmendmentProposalCount,
    tokenHoldingMinimumBlock,
    proposalValidityDuration,
    acceptedAnswerTreshold,
    authorizedFlightDelay,
    blockNumberBeforeTokenRedeem,
  };
};

/**CURRENT USER RELATED DATA */

// get all user transactions
const fetchUserTransactions = async (
  appContract,
  oracleContract,
  selectedAddress
) => {
  const appContractMappingEventNameToIndexedKey = {
    RegisteredInsuranceProvider: "caller",
    FundedInsuranceProvider: "insuranceProvider",
    ActivatedInsuranceProvider: "insuranceProvider",
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

  const oracleContractMappingEventNameToIndexedKey = {
    NewResponse: "oracleProvider",
  };

  const userTx = [];

  const userTxSetsOracleContract = await Promise.all(
    Object.keys(oracleContractMappingEventNameToIndexedKey).map(
      async (eventName) =>
        await oracleContract
          .getPastEvents(eventName, {
            fromBlock: 0,
            filter: {
              [oracleContractMappingEventNameToIndexedKey[eventName]]:
                selectedAddress,
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
                      ...event.returnValues,
                    };
                  })
                )
              : events
          )
          .then((userTx) => userTx)
    )
  );

  const userTxSetsAppContract = await Promise.all(
    Object.keys(appContractMappingEventNameToIndexedKey).map(
      async (eventName) =>
        await appContract
          .getPastEvents(eventName, {
            fromBlock: 0,
            filter: {
              [appContractMappingEventNameToIndexedKey[eventName]]:
                selectedAddress,
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
                      ...event.returnValues,
                    };
                  })
                )
              : events
          )
          .then((userTx) => userTx)
    )
  );

  userTxSetsAppContract.map(
    (set) => set.length > 0 && set.map((tx) => userTx.push(tx))
  );

  userTxSetsOracleContract.map(
    (set) => set.length > 0 && set.map((tx) => userTx.push(tx))
  );

  return userTx.length > 1
    ? userTx.sort((a, b) => b.timestamp - a.timestamp)
    : userTx;
};

// fetch current insurances contracts

const fetchUserInsurancesContracts = async (
  appContract,
  oracleContract,
  selectedAddress
) => {
  const userInsurances = await fetchUserInsurances(
    appContract,
    selectedAddress
  );
  if (userInsurances.length > 0) {
    return await Promise.all(
      userInsurances.map(async ({ flightID, insuranceID, ...rest }) => {
        const flightData = await getPastEvents(appContract, "NewFlight", {
          flightID,
        });
        const updatedFlightData = await getPastEvents(
          oracleContract,
          "UpdatedFlight",
          { flightID }
        );
        const claims = await fetchUserClaims(
          appContract,
          selectedAddress,
          flightID,
          insuranceID
        );
        const settled = claims.find(
          (claim) => claim.insuranceID === insuranceID
        )
          ? true
          : false;
        const returnedFlight = flightData[0];
        return {
          ...returnedFlight,
          settled,
          realDeparture:
            updatedFlightData.length > 0
              ? updatedFlightData[0].realDeparture
              : null,
          realArrival:
            updatedFlightData.length > 0
              ? updatedFlightData[0].realArrival
              : null,
          isLate:
            updatedFlightData.length > 0 ? updatedFlightData[0].isLate : null,
          insuranceID,
          ...rest,
        };
      })
    );
  } else {
    return [];
  }
};

/** ORACLE RELATED DATA */

// fetch flights requests for settlement data

const fetchOracleRequestForFlightSettlementData = async (oracleContract) => {
  return await getPastEvents(oracleContract, "NewRequest");
};

// fetch the current user indexes if he an activated oracle provider
const fetchOracleIndexes = async (appContract, selectedAddress) => {
  try {
    return await appContract.methods
      .getOracleIndexes()
      .call({ from: selectedAddress });
  } catch (error) {
    return null;
  }
};

// fetch current settlemnt responses for a given flight ID
const fetchFlightSettlementResponses = async (oracleContract, flightID) => {
  return await getPastEvents(oracleContract, "NewResponse", { flightID });
};

// fetch the current requests for a given flight ID
const fetchFlightSettlementRequests = async (oracleContract, flightID) => {
  return await getPastEvents(oracleContract, "NewRequest", { flightID });
};

const GroupedFlightSettlementResponses = async (oracleContract, flightID) => {
  const requests = await fetchFlightSettlementRequests(
    oracleContract,
    flightID
  );
  const responses = await fetchFlightSettlementResponses(
    oracleContract,
    flightID
  );

  return requests.map((request) => {
    const uniqMappingDeparture = {};
    const uniqMappingArrival = {};
    responses.map((response) => {
      if (
        uniqMappingDeparture[response.flightID] &&
        uniqMappingDeparture[flightID][response.realDeparture]
      ) {
        uniqMappingDeparture[response.flightID][response.realDeparture]++;
      } else {
        uniqMappingDeparture[response.flightID] = {
          [response.realDeparture]: 1,
        };
      }
      if (
        uniqMappingArrival[response.flightID] &&
        uniqMappingArrival[flightID][response.realArrival]
      ) {
        uniqMappingArrival[response.flightID][response.realArrival]++;
      } else {
        uniqMappingArrival[response.flightID] = { [response.realArrival]: 1 };
      }
    });

    return {
      requestID: request.requestID,
      flightID: request.flightID,
      flightRef: request.flightRef,
      arrivalResponses: Object.keys(uniqMappingArrival).map((key) => {
        const value = parseInt(Object.keys(uniqMappingArrival[key])[0]);
        return {
          value,
          count: uniqMappingArrival[key][value],
        };
      }),
      departureResponses: Object.keys(uniqMappingDeparture).map((key) => {
        const value = parseInt(Object.keys(uniqMappingDeparture[key])[0]);
        return {
          value: value,
          count: uniqMappingDeparture[key][value],
        };
      }),
    };
  });
};

/**======================================================================================================================================== */
// WRITE TO THE BLOCKCHAIN
/**======================================================================================================================================== */

/* providers registrations */

// insurance providers

const registerInsuranceProvider = async (
  appContract,
  insuranceProviderAddress,
  selectedAddress,
  gas = 500000
) => {
  return await appContract.methods
    .registerInsuranceProvider(insuranceProviderAddress)
    .send({ from: selectedAddress, gas });
};

const fundInsuranceProvider = async (
  appContract,
  selectedAddress,
  value,
  gas = 500000
) => {
  return await appContract.methods
    .fundInsuranceProvider()
    .send({ from: selectedAddress, value, gas });
};

// oracle providers

const registerOracleProvider = async (
  appContract,
  selectedAddress,
  value,
  gas = 500000
) => {
  return await appContract.methods
    .registerOracleProvider()
    .send({ from: selectedAddress, value, gas });
};

/* votes providers */

// insurance providers

const voteInsuranceProviderMembership = async (
  appContract,
  selectedAddress,
  votee,
  gas = 500000
) => {
  return await appContract.methods
    .voteInsuranceProviderMembership(votee)
    .send({ from: selectedAddress, gas });
};

// oracle providers

const voteOracleProviderMembership = async (
  appContract,
  selectedAddress,
  votee,
  gas = 500000
) => {
  return await appContract.methods
    .voteOracleProviderMembership(votee)
    .send({ from: selectedAddress, gas });
};

const respondToRequest = async (
  oracleContract,
  selectedAddress,
  requestID,
  realDeparture,
  realArrival,
  gas = 500000
) => {
  return await oracleContract.methods
    .respondToRequest(requestID, realDeparture, realArrival)
    .send({ from: selectedAddress, gas });
};
/* flights management */

const registerFlight = async (
  appContract,
  selectedAddress,
  { flightRef, estimatedDeparture, estimatedArrival, rate },
  gas = 500000
) => {
  return await appContract.methods
    .registerFlight(flightRef, estimatedDeparture, estimatedArrival, rate)
    .send({ from: selectedAddress, gas });
};

/* insurances management */

const registerInsurance = async (
  appContract,
  selectedAddress,
  flightID,
  value,
  gas = 500000
) => {
  return await appContract.methods
    .registerInsurance(flightID)
    .send({ from: selectedAddress, value, gas });
};

const claimInsurance = async (
  appContract,
  selectedAddress,
  flightID,
  gas = 500000
) => {
  return await appContract.methods
    .claimInsurance(flightID)
    .send({ from: selectedAddress, gas });
};

/* Settings amendment proposals*/

const registerMembershipFeeAmendmentProposal = async (
  appContract,
  selectedAddress,
  proposedValue,
  gas = 150000
) => {
  return await appContract.methods
    .registerMembershipFeeAmendmentProposal(proposedValue)
    .send({ from: selectedAddress, gas });
};

const voteMembershipFeeAmendmentProposal = async (
  appContract,
  selectedAddress,
  proposalID,
  gas = 150000
) => {
  return await appContract.methods
    .voteMembershipFeeAmendmentProposal(proposalID)
    .send({ from: selectedAddress, gas });
};

// insurance coverage amendment proposal

const registerInsuranceCoverageAmendmentProposal = async (
  appContract,
  selectedAddress,
  proposedValue,
  gas = 150000
) => {
  return await appContract.methods
    .registerInsuranceCoverageAmendmentProposal(proposedValue)
    .send({ from: selectedAddress, gas });
};

const voteInsuranceCoverageAmendmentProposal = async (
  appContract,
  selectedAddress,
  proposalID,
  gas = 150000
) => {
  return await appContract.methods
    .voteInsuranceCoverageAmendmentProposal(proposalID)
    .send({ from: selectedAddress, gas });
};

export {
  /**READ FROM THE BLOCKCHAIN */
  // metrics and indicators
  fetchCurrentMembershipFee,
  fetchFlights,
  fetchFlight,
  fetchInsuranceProviderFlights,
  fetchInsuranceProvidersFlights,
  fetchCurrentMembershipApplications,
  checkRegistration,
  fetchSettingsAmendmentProposal,
  fetchInsuranceProvidersProfits,
  fetchFundsIndicators,
  fetchDAOIndicators,
  // current user related data
  fetchUserTransactions,
  fetchUserInsurancesContracts,
  // oracle related data
  fetchOracleRequestForFlightSettlementData,
  fetchOracleIndexes,
  fetchFlightSettlementResponses,
  fetchFlightSettlementRequests,
  GroupedFlightSettlementResponses,
  /** WRITE TO THE BLOCKCHAIN */
  // as any user
  registerInsuranceProvider,
  fundInsuranceProvider,
  registerOracleProvider,
  registerInsurance,
  claimInsurance,
  registerMembershipFeeAmendmentProposal,
  voteMembershipFeeAmendmentProposal,
  registerInsuranceCoverageAmendmentProposal,
  voteInsuranceCoverageAmendmentProposal,
  // as a token holder
  voteInsuranceProviderMembership,
  voteOracleProviderMembership,
  // as an insurance provider
  registerFlight,
  // as an oracle provider
  respondToRequest,
};
