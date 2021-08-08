const BigNumber = require("bignumber.js");
const assert = require("chai").assert;
const FlightSuretyOracle = artifacts.require("FlightSuretyOracle");

contract(FlightSuretyOracle, async (accounts) => {
  const owner = accounts[0];
  const userOne = accounts[1];
  const userTwo = accounts[2];
  // const flightID = ;
  // const flightRef = ;

  // it("As an activated oracle provider it should create a request for a targeted oracle provider subset", async () => {
  //   let contract = await FlightSuretyOracle.deployed();
  //   await contract.createRequest(flightID, flightRef);
  // });

  // it("As any other account than an activated oracle provider it should create a request for a targeted oracle provider subset", async () => {
  //   let contract = await FlightSuretyOracle.deployed();
  //   try {
  //     await contract.createRequest(flightID, flightRef);
  //     assert.fail();
  //   } catch (error) {}
  // });

  // it("As an activated oracle provider it should update responses to a request and validate the accepted outcome according to multiparty consensus rules", async () => {
  //   let contract = await FlightSuretyOracle.deployed();
  //   await respondToRequest(
  //     caller,
  //     requestID,
  //     realDeparture,
  //     realArrival,
  //     isLate
  //   );
  // });

  // it("As any other account than an activated oracle provider it should fail to update responses to a request and validate the accepted outcome according to multiparty consensus rules", async () => {
  //   let contract = await FlightSuretyOracle.deployed();
  //   try {
  //     await contract.respondToRequest(
  //       caller,
  //       requestID,
  //       realDeparture,
  //       realArrival,
  //       isLate
  //     );
  //     assert.fail();
  //   } catch (error) {}
  // });
});
