const BigNumber = require("bignumber.js");
const assert = require("chai").assert;
const should = require("chai").should;
const FlightSuretyData = artifacts.require("FlightSuretyData");

contract(FlightSuretyData, async (accounts) => {
  const owner = accounts[0];
  const userOne = accounts[1];
  const userTwo = accounts[2];
  const authorizedCaller = accounts[3];
  const unauthorizedCaller = accounts[4];

  const flightRef = "UA840";
  const estimatedDeparture = parseInt(Date.now().toString().slice(0, -3));
  const estimatedArrival = estimatedDeparture + 3600 * 2;
  const rate = 500000000;

  // contract call authorization management
  it("As owner of the contract should authorize a caller", async () => {
    let contract = await FlightSuretyData.deployed();
    await contract.authorizeCaller(userOne, { from: owner });
    await contract.authorizeCaller(authorizedCaller, { from: owner });
  });

  it("As caller not owner of the contract should fail to authorize a caller", async () => {
    let contract = await FlightSuretyData.deployed();
    try {
      await contract.authorizeCaller(userOne, { from: userTwo });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be owner or authorized caller");
    }
  });

  it("As owner of the contract should unauthorize a caller ", async () => {
    let contract = await FlightSuretyData.deployed();
    await contract.unauthorizeCaller(userOne, { from: owner });
  });

  it("As caller not owner of the contract should fail to unauthorize a caller ", async () => {
    let contract = await FlightSuretyData.deployed();
    try {
      await contract.unauthorizeCaller(userOne, { from: userTwo });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be owner or authorized caller");
    }
  });

  // flights  management
  it("As an authorized caller it should register a new flight for a given insurance provider aka airline", async () => {
    let contract = await FlightSuretyData.deployed();
    await contract.registerFlight(
      userOne,
      flightRef,
      estimatedDeparture,
      estimatedArrival,
      rate,
      { from: authorizedCaller }
    );
  });

  it("As an unauthorized caller it should fail to register a new flight for a given insurance provider aka airline", async () => {
    let contract = await FlightSuretyData.deployed();
    try {
      await contract.registerFlight(
        userOne,
        flightRef,
        estimatedDeparture,
        estimatedArrival,
        rate,
        { from: unauthorizedCaller }
      );
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be authorized");
    }
  });

  it("As an authorized caller it should fetch the current flight ID", async () => {
    let contract = await FlightSuretyData.deployed();
    await contract.getCurrentFlightID({ from: authorizedCaller });
  });

  it("As an unauthorized caller it should fetch the current flight ID", async () => {
    let contract = await FlightSuretyData.deployed();
    try {
      await contract.getCurrentFlightID({ from: unauthorizedCaller });
      assert.fail();
    } catch (error) {
      assert.equal(
        error.message,
        "Returned error: VM Exception while processing transaction: revert caller must be authorized"
      );
    }
  });

  it("As an authorized caller it should update flight data", async () => {
    let contract = await FlightSuretyData.deployed();
    await contract.updateFlight(
      1,
      estimatedDeparture + 3600 * 2,
      estimatedArrival + 3600 * 2,
      true,
      {
        from: authorizedCaller,
      }
    );
  });

  it("As an unauthorized caller it should fail to update flight data", async () => {
    let contract = await FlightSuretyData.deployed();
    try {
      await contract.updateFlight(
        1,
        estimatedDeparture + 3600 * 2,
        estimatedArrival + 3600 * 2,
        true,
        { from: unauthorizedCaller }
      );
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be authorized");
    }
  });

  it("As an authorized caller it should fetch a flight", async () => {
    let contract = await FlightSuretyData.deployed();
    const flight = await contract.getFlight(1, {
      from: authorizedCaller,
    });

    assert.hasAllKeys(flight, [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "flightRef",
      "estimatedDeparture",
      "estimatedArrival",
      "realDeparture",
      "realArrival",
      "isLate",
      "insuranceProvider",
      "insuredValue",
      "rate",
    ]);
    assert.equal(Object.keys(flight).length, 18);
  });

  it("As an unauthorized caller it should fetch a flight", async () => {
    let contract = await FlightSuretyData.deployed();
    try {
      await contract.getFlight(1, { from: unauthorizedCaller });
      assert.fail();
    } catch (error) {
      assert.equal(
        error.message,
        "Returned error: VM Exception while processing transaction: revert caller must be authorized"
      );
    }
  });

  /** insurance management */

  it("As an authorized caller it should insure a passenger for a given flight", async () => {
    let contract = await FlightSuretyData.deployed();
    await contract.insure(userTwo, 1, rate, { from: authorizedCaller });
  });

  it("As an unauthorized caller it should fail to insure a passenger for a given flight", async () => {
    let contract = await FlightSuretyData.deployed();
    try {
      await contract.insure(userTwo, 1, rate, {
        from: unauthorizedCaller,
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be authorized");
    }
  });

  it("As an authorized caller it should set an insurance claimed attribute to true", async () => {
    let contract = await FlightSuretyData.deployed();
    await contract.setInsuranceToClaimed(1, { from: authorizedCaller });
  });

  it("As an unauthorized caller it should fail to set an insurance claimed attribute to true", async () => {
    let contract = await FlightSuretyData.deployed();
    try {
      await contract.setInsuranceToClaimed(1, { from: unauthorizedCaller });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be authorized");
    }
  });

  it("As an authorized caller it should amend the total insured value", async () => {
    let contract = await FlightSuretyData.deployed();
    await contract.setTotalInsuredValue(100, { from: authorizedCaller });
  });

  it("As an unauthorized caller it should fail to amend the total insured value", async () => {
    let contract = await FlightSuretyData.deployed();
    try {
      await contract.setTotalInsuredValue(100, { from: unauthorizedCaller });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be authorized");
    }
  });

  it("As an authorized caller it should fetch the current autoincrementing ID of a given passenger", async () => {
    let contract = await FlightSuretyData.deployed();
    const insuranceID = await contract.getCurrentInsuranceID({
      from: authorizedCaller,
    });
    assert.equal(new BigNumber(insuranceID).isEqualTo(new BigNumber(1)), true);
  });

  it("As an unauthorized caller it should fail to fetch the current autoincrementing ID of a given passenger", async () => {
    let contract = await FlightSuretyData.deployed();
    try {
      await contract.getCurrentInsuranceID({ from: unauthorizedCaller });
      assert.fail();
    } catch (error) {
      assert.equal(
        error.message,
        "Returned error: VM Exception while processing transaction: revert caller must be authorized"
      );
    }
  });

  it("As an authorized caller it should fetch a passenger's insurance", async () => {
    let contract = await FlightSuretyData.deployed();
    const insurance = await contract.getInsurance(1, {
      from: authorizedCaller,
    });
    assert.hasAllKeys(insurance, [
      "0",
      "1",
      "2",
      "3",
      "flightID",
      "insuredValue",
      "owner",
      "claimed",
    ]);
    assert.equal(Object.keys(insurance).length, 8);
  });

  it("As an unauthorized caller it should fail to fetch a passenger's insurance", async () => {
    let contract = await FlightSuretyData.deployed();
    try {
      await contract.getInsurance(1, { from: unauthorizedCaller });
      assert.fail();
    } catch (error) {
      assert.equal(
        error.message,
        "Returned error: VM Exception while processing transaction: revert caller must be authorized"
      );
    }
  });

  it("As an authorized caller it should fetch the current total insured value", async () => {
    let contract = await FlightSuretyData.deployed();
    const insuredValue = await contract.getTotalInsuredValue({
      from: authorizedCaller,
    });
    assert.equal(
      new BigNumber(insuredValue).isEqualTo(new BigNumber(100)),
      true
    );
  });

  it("As an unauthorized caller it should fail to fetch the current total insured value", async () => {
    let contract = await FlightSuretyData.deployed();
    try {
      await contract.getTotalInsuredValue({ from: unauthorizedCaller });
      assert.fail();
    } catch (error) {
      assert.equal(
        error.message,
        "Returned error: VM Exception while processing transaction: revert caller must be authorized"
      );
    }
  });
});
