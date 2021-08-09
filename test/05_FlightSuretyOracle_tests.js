const BigNumber = require("bignumber.js");
const assert = require("chai").assert;
const FlightSuretyOracle = artifacts.require("FlightSuretyOracle");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const OracleProviderRole = artifacts.require("OracleProviderRole");
const InsuranceProviderRole = artifacts.require("InsuranceProviderRole");
const FlightSuretyApp = artifacts.require("FlightSuretyApp");

contract(FlightSuretyOracle, async (accounts) => {
  // accounts and contracts variables
  const owner = accounts[0];
  const userOne = accounts[1];
  const userTwo = accounts[2];
  const authorizedCaller = accounts[3];
  const unauthorizedCaller = accounts[4];
  const persistentUser = accounts[5];
  let flightSuretyAppAddress;
  let flightSuretyDataAddress;
  let oracleProviderRoleAddress;
  let insuranceProviderRoleAddress;

  // flights mock data
  const flightID = 1;
  const flightRef = "UA840";
  const estimatedDeparture = parseInt(Date.now().toString().slice(0, -3));
  const estimatedArrival = estimatedDeparture + 3600 * 2;
  const rate = 500000000;
  const realDeparture = parseInt(Date.now().toString().slice(0, -3));
  const realArrival = realDeparture + 3600 * 2;

  // initialize external contracts addresses

  it("As a contract owner it initialize external contracts addresses", async () => {
    const contract = await FlightSuretyOracle.deployed();
    // deploying linked contract
    let flightSuretyApp = await FlightSuretyApp.new({ from: owner });
    let oracleProviderRole = await OracleProviderRole.new(
      flightSuretyApp.address,
      contract.address,
      { from: owner }
    );
    let flightSuretyData = await FlightSuretyData.new(
      flightSuretyApp.address,
      contract.address,
      { from: owner }
    );
    let insuranceProviderRole = await InsuranceProviderRole.new(
      flightSuretyApp.address,
      { from: owner }
    );
    // storing addresses of deployed contract
    flightSuretyAppAddress = flightSuretyApp.address;
    oracleProviderRoleAddress = oracleProviderRole.address;
    flightSuretyDataAddress = flightSuretyData.address;
    insuranceProviderRoleAddress = insuranceProviderRole.address;
    // authorizing dummy caller in OracleProviderRole, FlightSuretyData and InsuranceProviderRol in order to create roles, flights and insurances
    await oracleProviderRole.authorizeCaller(authorizedCaller, { from: owner });
    await flightSuretyData.authorizeCaller(authorizedCaller, { from: owner });
    await insuranceProviderRole.authorizeCaller(authorizedCaller, {
      from: owner,
    });
    // referencing external contract address in flightsuretyOracle
    await contract.initialize(
      flightSuretyDataAddress,
      oracleProviderRoleAddress,
      { from: owner }
    );
  });

  it("As any other address it fails to initialize external contracts addresses", async () => {
    const contract = await FlightSuretyOracle.deployed();
    try {
      await contract.initialize(
        flightSuretyDataAddress,
        oracleProviderRoleAddress,
        { from: userOne }
      );
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be owner");
    }
  });

  // Request and responses management

  it("As an activated oracle provider it should create a request for a targeted oracle provider subset", async () => {
    const contract = await FlightSuretyOracle.deployed();
    let oracleProviderRoleContract = await OracleProviderRole.at(
      oracleProviderRoleAddress
    );
    let flightSuretyData = await FlightSuretyData.at(flightSuretyDataAddress);
    let insuranceProviderRole = await InsuranceProviderRole.at(
      insuranceProviderRoleAddress
    );
    // add and activate an oracle provider in order to process requests and responses
    await oracleProviderRoleContract.addOracleProvider(persistentUser, {
      from: authorizedCaller,
    });
    await oracleProviderRoleContract.activateOracleProvider(persistentUser, {
      from: authorizedCaller,
    });
    // add and activate an insurance provider in order to create a flight
    await insuranceProviderRole.addInsuranceProvider(persistentUser, {
      from: authorizedCaller,
    });
    await insuranceProviderRole.activateInsuranceProvider(persistentUser, {
      from: authorizedCaller,
    });
    // register a flights
    await flightSuretyData.registerFlight(
      persistentUser,
      flightRef,
      estimatedDeparture,
      estimatedArrival,
      rate,
      { from: authorizedCaller }
    );
    // register an insurance
    await flightSuretyData.insure(userTwo, flightID, rate, {
      from: authorizedCaller,
    });
    // finally create a request using activated oracle provider role
    await contract.createRequest(flightID, flightRef, { from: persistentUser });
  });

  it("As any other account it should fail to create a request for a targeted oracle provider subset", async () => {
    const contract = await FlightSuretyOracle.deployed();
    try {
      await contract.createRequest(flightID, flightRef, { from: userTwo });
      assert.fail();
    } catch (error) {}
  });

  it("As an activated oracle provider it should update responses to a request and validate the accepted outcome according to multiparty consensus rules", async () => {
    const contract = await FlightSuretyOracle.deployed();
    await contract.respondToRequest(
      persistentUser,
      1,
      realDeparture,
      realArrival,
      0,
      { from: persistentUser }
    );
  });

  it("As any other account it should fail to update responses to a request and validate the accepted outcome according to multiparty consensus rules", async () => {
    const contract = await FlightSuretyOracle.deployed();
    try {
      await contract.respondToRequest(
        persistentUser,
        1,
        realDeparture,
        realArrival,
        isLate,
        { from: userTwo }
      );
      assert.fail();
    } catch (error) {}
  });
});
