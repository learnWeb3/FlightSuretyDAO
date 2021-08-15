const Web3 = require("web3");
const { web3Contract } = require("../server/src/index.js");
const FlightSuretyAppInterface = require("../client/src/contracts/FlightSuretyApp.json");
const FlightSuretyOracleInterface = require("../client/src/contracts/FlightSuretyOracle.json");
const web3 = new Web3("ws://localhost:8545");
const SeedContract = async () => {
  const accounts = await web3.eth.getAccounts();
  const networkID = await web3.eth.net.getId();
  const appContractAddress =
    FlightSuretyAppInterface.networks[networkID].address;
  const oracleContractAddress =
    FlightSuretyOracleInterface.networks[networkID].address;

  const appContract = await web3Contract(
    web3,
    appContractAddress,
    FlightSuretyAppInterface.abi
  );

  // register insurance provider
  await appContract.methods.registerInsuranceProvider().send({
    from: accounts[1],
    value: web3.utils.toWei("10", "ether"),
    gas: 500000,
  });

  // register orcle providers
  await Promise.all(
    accounts.splice(2, accounts.length - 1).map(
      async (account) =>
        await appContract.methods.registerOracleProvider().send({
          from: account,
          value: web3.utils.toWei("10", "ether"),
          gas: 500000,
        })
    )
  );
};

SeedContract();
