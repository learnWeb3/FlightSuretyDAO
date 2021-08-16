// FlightSuretyApp contract interface
const FlightSuretyAppInterface = require("../../client/src/contracts/FlightSuretyApp.json");
// FlightSuretyOracle contract interface
const FlightSuretyOracleInterface = require("../../client/src/contracts/FlightSuretyOracle.json");
// web3 libraries
const Web3 = require("web3");
// truffle hd wallet provider
const HDWalletProvider = require("truffle-hdwallet-provider");
// node cron
const cron = require("node-cron");

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

// initialize web3 contracts

const initWeb3Contracts = async (MNEMONIC, PROVIDER_URL) => {
  // hdwalletprovider to access metamask wallet
  const httpProvider = new HDWalletProvider(MNEMONIC, PROVIDER_URL);
  // websocket provider
  const wSSProviderURL = PROVIDER_URL.replace("ws", "http");
  // web3 instantiation
  const web3WSS = new Web3(wSSProviderURL);
  const web3HTTP = new Web3(httpProvider);
  // fetch current network ID
  const networkID = await web3WSS.eth.net.getId();
  // contracts addresses
  const appContractAddress =
    FlightSuretyAppInterface.networks[networkID].address;
  const oracleContractAddress =
    FlightSuretyOracleInterface.networks[networkID].address;
  // FlightSuretyApp contract instantiation
  const appContractWSS = web3Contract(
    web3HTTP,
    appContractAddress,
    FlightSuretyAppInterface.abi
  );
  const appContractHTTP = web3Contract(
    web3HTTP,
    appContractAddress,
    FlightSuretyAppInterface.abi
  );
  // FlightSuretyOracle contract instantiation
  const oracleContractWSS = web3Contract(
    web3WSS,
    oracleContractAddress,
    FlightSuretyOracleInterface.abi
  );
  const oracleContractHTTP = web3Contract(
    web3HTTP,
    oracleContractAddress,
    FlightSuretyOracleInterface.abi
  );
  // user address
  const userAddress = httpProvider.addresses[0];
  return {
    networkID,
    userAddress,
    appContractAddress,
    oracleContractAddress,
    // WSS providers instantiated contracts to listen for contracts emitted events
    oracleContractWSS,
    appContractWSS,
    // HTTP providers instantiated contracts to call contracts using mnemonic unlocked addresses
    oracleContractHTTP,
    appContractHTTP,
  };
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

const initCronTasks = (MNEMONIC, PROVIDER_URL) => {
  let taskNumber = 0;
  cron.schedule("* * * * *", async () => {
    try {
      // init web3 contracts and addresses
      const {
        networkID,
        userAddress,
        appContractAddress,
        oracleContractAddress,
        // WSS providers
        oracleContractWSS,
        appContractWSS,
        // HTTP providers
        oracleContractHTTP,
        appContractHTTP,
      } = await initWeb3Contracts(MNEMONIC, PROVIDER_URL);
      taskNumber += 1;
      console.log(
        "================================================================"
      );
      console.log(`running cron tasks ${taskNumber}`);
      console.log(`current network id: ${networkID}`);
      console.log(`current user address: ${userAddress}`);
      console.log(`FlightSuretyApp contract Address: ${appContractAddress}`);
      console.log(
        `FlightSuretyOracle contract address: ${oracleContractAddress}`
      );
      // fetch the flights
      const flights = await fetchFlights(appContractWSS, oracleContractWSS);
      const txs = [];
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
              const tx = await oracleContractHTTP.methods
                .createRequest(flightID, flightRef)
                .send({ from: userAddress, gas: 500000 });
              txs.push(tx);
              console.log(
                `New settlement request for flight ${flightID} successfully created on oracle contract`
              );
              console.log(
                `createRequest call transaction hash: ${tx.transactionHash}`
              );
            }
          }
        )
      );

      !txs.length > 0 &&
        console.log("task ended with no request creation ....");
    } catch (error) {
      console.log(error);
    }
  });
};

module.exports = { initCronTasks, web3Contract };
