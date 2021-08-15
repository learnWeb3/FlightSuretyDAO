import { getPastEvents } from "../web3";

// fetch all registered insurance providers
const fetchRegisteredInsuranceProviders = async (appContract) => {
  return await getPastEvents(appContract, "RegisteredInsuranceProvider");
};

// fetch all activated insurance providers
const fetchActivatedInsuranceProviders = async (appContract) => {
  return await getPastEvents(appContract, "ActivatedInsuranceProvider");
};
// fetch all registered oracle providers
const fetchRegisteredOracleProviders = async (appContract) => {
  return await getPastEvents(appContract, "RegisteredOracleProvider");
};
// fetch all activated oracle providers
const fetchActivatedOracleProviders = async (appContract) => {
  return await getPastEvents(appContract, "ActivatedOracleProvider");
};

// fetch all insurance created
const fetchInsurances = async (appContract) => {
  return await getPastEvents(appContract, "NewInsurance");
};

// fetch specific user insurances
const fetchUserInsurances = async (appContract, selectedAddress) => {
  return await getPastEvents(appContract, "NewInsurance", {
    passenger: selectedAddress,
  });
};

// fetch specific user claims
const fetchUserClaims = async (appContract, selectedAddress, flightID) => {
  return await getPastEvents(appContract, "NewPayout", {
    owner: selectedAddress,
    flightID,
  });
};

// profits aka registred insurance cumulated value - payout cumulated value
const fetchProfits = async (appContract, insuranceProvider) => {
  const totalCumulatedInsuranceValue = await getPastEvents(
    appContract,
    "NewInsurance"
  ).then((insurances) => {
    return insurances.length > 0
      ? insurances.reduce(
          (acc, currentValue) => acc + parseInt(currentValue.insuredValue),
          0
        )
      : 0;
  });

  const myCumulatedInsuranceValue = await getPastEvents(
    appContract,
    "NewInsurance",
    { insuranceProvider }
  ).then((insurances) =>
    insurances.length > 0
      ? insurances.reduce(
          (acc, currentValue) => acc + parseInt(currentValue.insuredValue),
          0
        )
      : 0
  );
  const totalCumulatedPayoutValue = await getPastEvents(
    appContract,
    "NewPayout"
  ).then((payouts) =>
    payouts.length > 0
      ? payouts.reduce(
          (acc, currentValue) => acc + parseInt(currentValue.insuredValue),
          0
        )
      : 0
  );
  const myCumulatedPayoutValue = await getPastEvents(appContract, "NewPayout", {
    insuranceProvider,
  }).then((payouts) =>
    payouts.length > 0
      ? payouts.reduce(
          (acc, currentValue) => acc + parseInt(currentValue.insuredValue),
          0
        )
      : 0
  );

  const totalCumulatedProfits = appContract.utils.fromWei(
    `${totalCumulatedInsuranceValue - totalCumulatedPayoutValue}`,
    "ether"
  );
  const myCumulatedProfits = appContract.utils.fromWei(
    `${myCumulatedInsuranceValue - myCumulatedPayoutValue}`,
    "ether"
  );
  return {
    totalCumulatedProfits,
    myCumulatedProfits,
  };
};

// default rates aka payouts / registered insurances
const fetchDefaultRates = async (
  appContract,
  insuranceProvider,
  totalRegisteredInsuranceCount,
  myRegisteredInsuranceCount
) => {
  const totalInsurancePayoutCount = await getPastEvents(
    appContract,
    "NewPayout"
  ).then((payouts) => payouts.length);
  const totalInsuranceDefaultRate =
    totalRegisteredInsuranceCount > 0
      ? totalInsurancePayoutCount / totalRegisteredInsuranceCount
      : null;
  const myInsurancePayoutCount = await getPastEvents(appContract, "NewPayout", {
    insuranceProvider,
  }).then((payouts) => payouts.length);
  const myInsuranceDefaultRate =
    myRegisteredInsuranceCount > 0
      ? myInsurancePayoutCount / myRegisteredInsuranceCount
      : null;
  return {
    totalInsuranceDefaultRate,
    myInsuranceDefaultRate,
  };
};

export {
  fetchRegisteredInsuranceProviders,
  fetchActivatedInsuranceProviders,
  fetchRegisteredOracleProviders,
  fetchActivatedOracleProviders,
  fetchInsurances,
  fetchUserInsurances,
  fetchUserClaims,
  fetchProfits,
  fetchDefaultRates,
};
