const web3Contract = (provider, address, abi) => {
  const contract = new provider.eth.Contract(abi, address);
  const { fromWei, toWei } = provider.utils;
  contract.utils = { fromWei, toWei };
  contract.eth = provider.eth;
  return contract;
};

const getPastEvents = async (contract, event, filter = null) => {
  const options = filter ? { fromBlock: 0, filter } : { fromBlock: 0 };
  return await contract.getPastEvents(event, options).then((array) =>
    array.map((element) => ({
      transactionHash: element.transactionHash,
      blockNumber: element.blockNumber,
      ...element.returnValues,
    }))
  );
};

// fetch all flights created to insure a new passengers (new insurance pick up index page)
const fetchFlights = async (appContract, oracleContract) => {
  const flights = await getPastEvents(appContract, "NewFlight").then(
    async (flights) => {
      return await Promise.all(
        flights.map(async (flight) => ({
          ...flight,
          ...(await appContract.methods.getFlightSettlementData(flight.flightID).call()),
        }))
      );
    }
  );
  const oracleFlightRequestForSettlementData = await getPastEvents(
    oracleContract,
    "NewRequest"
  );
  return flights.map((flight) => {
    const request = oracleFlightRequestForSettlementData.find(
      (request) => request.flightID === flight.flightID
    );
    return {
      ...flight,
      oracleActivatedIndex: request ? request.activatedIndex : null,
      oracleRequestIsPresent: request ? true : false,
    };
  });
};

module.exports = { web3Contract, fetchFlights };
