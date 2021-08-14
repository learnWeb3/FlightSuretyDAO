// FlightSuretyApp contract interface
const FlightSuretyAppInterface = require("../../client/src/contracts/FlightSuretyApp.json");
// FlightSuretyOracle contract interface
const FlightSuretyOracleInterface = require("../../client/src/contracts/FlightSuretyOracle.json");
// web3 libraries
const Web3 = require("web3");
// truffle hd wallet provider
const HDWalletProvider = require("truffle-hdwallet-provider");

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
          ...(await appContract.methods
            .getFlightSettlementData(flight.flightID)
            .call()),
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

const initCronTasks = async (MNEMONIC, PROVIDER_URL) => {
  try {
    // hdwalletprovider to access metamask wallet
    const httpProvider = new HDWalletProvider(MNEMONIC, PROVIDER_URL);
    // websocket provider
    const wSSProviderURL = PROVIDER_URL.replace("ws", "http");
    // web3 instantiation
    const web3WSS = new Web3(wSSProviderURL);
    const web3HTTP = new Web3(httpProvider);
    console.log("running cron tasks");
    // fetch current network ID
    const networkID = await web3WSS.eth.net.getId();
    const appContractAddress =
      FlightSuretyAppInterface.networks[networkID].address;
    console.log(`FlightSuretyApp contract Address: ${appContractAddress}`);
    // FlightSuretyApp contract instantiation
    const appContract = web3Contract(
      web3WSS,
      appContractAddress,
      FlightSuretyAppInterface.abi
    );
    const oracleContractAddress =
      FlightSuretyOracleInterface.networks[networkID].address;
    console.log(`FlightSuretyOracle contract address: ${appContractAddress}`);
    // FlightSuretyOracle contract instantiation
    const oracleContract = web3Contract(
      web3WSS,
      oracleContractAddress,
      FlightSuretyOracleInterface.abi
    );
    // user address
    // const userAddress = httpProvider.addresses[0];
    const userAddress = await web3WSS.eth
      .getAccounts()
      .then((account) => account[2]);
    console.log(`current user address: ${userAddress}`);
    // fetch the flights
    const flights = await fetchFlights(appContract, oracleContract);
    //loop through it and create a request for data settlement
    await Promise.all(
      flights.map(
        async ({
          estimatedArrival,
          flightID,
          flightRef,
          oracleRequestIsPresent,
          insuredValue,
        }) => {
          if (
            estimatedArrival * 1000 < Date.now() &&
            !oracleRequestIsPresent &&
            insuredValue > 0
          ) {
            const tx = await oracleContract.methods
              .createRequest(flightID, flightRef)
              .send({ from: userAddress, gas: 500000 });
            console.log(
              `New settlement request for flight ${flightID} successfully created on oracle contract`
            );
            console.log(`Transaction hash: ${tx.transactionHash}`);
          }
        }
      )
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = { initCronTasks };
