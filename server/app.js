// FlightSuretyApp contract interface
const FlightSuretyAppInterface = require("../client/src/contracts/FlightSuretyApp.json");
// FlightSuretyOracle contract interface
const FlightSuretyOracleInterface = require("../client/src/contracts/FlightSuretyOracle.json");
// fetch current flights and helper to instantiate contract
const { web3Contract, fetchFlights } = require("./src/index.js");
// web3 libraries
const Web3 = require("web3");
// truffle hd wallet provider
const HDWalletProvider = require("truffle-hdwallet-provider");
// express
const express = require("express");
// node cron
const cron = require("node-cron");
// dotenv
const envPath = process.cwd() + "/../.env";
require("dotenv").config({ path: envPath });
// environnent variables
const { SERVER_PORT, MNEMONIC, PROVIDER_URL } = process.env;
// websocket provider
const wSSProviderURL = PROVIDER_URL.replace("ws", "http");
// hdwalletprovider to access metamask wallet
const httpProvider = new HDWalletProvider(MNEMONIC, PROVIDER_URL);
// web3 instantiation
const web3WSS = new Web3(wSSProviderURL);
const web3HTTP = new Web3(httpProvider);
// express instantiation
const app = new express();

cron.schedule("* * * * *", async () => {
  try {
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
          estimatedDeparture,
          estimatedArrival,
          flightID,
          flightRef,
          oracleRequestIsPresent,
          oracleActivatedIndex,
        }) => {
          if (estimatedArrival * 1000 < Date.now() && !oracleRequestIsPresent) {
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
});
app.listen(SERVER_PORT, () =>
  console.log(`server running on port ${SERVER_PORT}`)
);
